import { jobsRepo } from '#repositories/jobs.repository.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { candidateMatchesRepo } from '#repositories/candidateMatches.repository.js';
import { callGemini } from '#clients/gemini.client.js';
import { supabase } from '#supabase';
import { generateId } from '#utils/ids.js';
import { AppError } from '#utils/httpErrors.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('employerAI.service');

const SYSTEM_PROMPT = `You are LanTURN's AI Hiring Assistant — an expert technical recruiter embedded inside an employer dashboard.

Your purpose is to help employers discover, evaluate, and compare candidates from the student pool using natural language.

You have access to:
- The employer's active job postings (provided in context)
- A pool of student candidates with their skills, projects, education, and experience
- AI match scores for students who have already been evaluated against specific jobs

Capabilities:
1. **Find candidates**: When asked "Find me candidates for X", filter the pool by skills/role, rank by relevance, and recommend the top matches with brief justifications.
2. **Explain exclusions**: When asked "Why not candidate X?", look up that student and explain specifically what skills, projects, or experience they lack relative to the job.
3. **Compare candidates**: When asked to compare two or more candidates, present a structured comparison of their strengths and gaps.
4. **Answer questions**: Answer general recruitment or candidate-related questions based on the data.

Rules:
- NEVER expose student contact info (phone, email, physical address). You may share name, skills, projects, education, and professional data.
- Reference candidates by name and key qualifications.
- Be specific — cite actual projects, skills, and scores when available.
- Keep responses concise and recruiter-friendly (bullet points preferred for lists).
- If no matching candidates exist, say so honestly.
- Format numbers clearly: "126 students match" not "one hundred and twenty six".
- When listing candidates, number them for easy reference.
- Use markdown formatting for readability (bold, bullets, headers).`;

/**
 * Build a concise context snapshot of the employer's jobs and the student pool.
 * This is injected into every AI call so the model has real data to reason over.
 */
async function buildContext(employerUid) {
  // 1. Fetch employer's jobs
  const jobsResult = await jobsRepo.listByEmployer(employerUid, { limit: 50 });
  const jobs = jobsResult.items || [];

  // 2. Collect all required skills from active jobs
  const activeJobs = jobs.filter(j => j.status === 'active');
  const allSkills = [...new Set(activeJobs.flatMap(j => j.requiredSkills || []))];

  // 3. Fetch student pool — if there are active jobs, prioritize skill-matched students;
  //    otherwise fetch a broad sample
  let students;
  if (allSkills.length > 0) {
    students = await studentsRepo.searchBySkills(allSkills, { limit: 100 });
    // If skill search returns too few, supplement with general pool
    if (students.length < 20) {
      const general = await studentsRepo.listAll({ limit: 100 });
      const existingIds = new Set(students.map(s => s.uid));
      for (const s of general) {
        if (!existingIds.has(s.uid)) students.push(s);
        if (students.length >= 100) break;
      }
    }
  } else {
    students = await studentsRepo.listAll({ limit: 100 });
  }

  // 4. Fetch existing match scores for the employer's jobs
  const jobIds = jobs.map(j => j.jobId);
  let matchScores = {};
  if (jobIds.length > 0) {
    try {
      const matches = await candidateMatchesRepo.listByJobs(jobIds, { limit: 200 });
      for (const m of matches) {
        if (!matchScores[m.studentId]) matchScores[m.studentId] = {};
        matchScores[m.studentId][m.jobId] = {
          score: m.matchScore,
          decision: m.overallReason,
          missingSkills: m.missingSkills,
        };
      }
    } catch (err) {
      log.warn({ err: err.message }, 'Failed to fetch match scores for AI context');
    }
  }

  // 5. Build the context object
  const jobsSummary = activeJobs.map(j => ({
    jobId: j.jobId,
    title: j.title,
    role: j.role || j.title,
    requiredSkills: j.requiredSkills,
    jobType: j.jobType,
    experienceLevel: j.experienceLevel,
    openings: j.openings,
    location: j.location,
    workMode: j.workMode,
  }));

  const candidatePool = students.map((s, i) => {
    const pro = s.professional || {};
    const aca = s.academic || {};
    const per = s.personal || {};
    return {
      candidateNumber: i + 1,
      name: per.name || 'Unknown',
      skills: s.searchableSkills || pro.skills || [],
      projects: (pro.projects || []).map(p => ({
        title: p.title || p.name,
        description: p.description,
        technologies: p.technologies || p.tech,
        liveUrl: p.liveUrl || p.url,
      })).slice(0, 5), // Limit projects to keep context manageable
      experience: (pro.experience || []).map(e => ({
        role: e.role || e.title,
        company: e.company,
        duration: e.duration,
      })).slice(0, 3),
      education: {
        college: aca.college,
        degree: aca.degree,
        branch: aca.branch,
        graduationYear: aca.graduationYear || s.graduationYear,
        cgpa: aca.cgpa,
      },
      certifications: (pro.certifications || []).slice(0, 5),
      matchScores: matchScores[s.uid] || null,
    };
  });

  return {
    jobsSummary,
    candidatePool,
    totalStudentsInPlatform: students.length,
    totalActiveJobs: activeJobs.length,
  };
}

/**
 * Main chat handler — processes an employer message and returns an AI response.
 */
export async function employerAIChat(uid, { threadId, message }) {
  if (!message?.trim()) throw AppError.unprocessable('Message cannot be empty');

  let thread = null;

  // 1. Retrieve or create thread
  if (threadId) {
    const { data } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('thread_id', threadId)
      .eq('user_id', uid)
      .maybeSingle();
    if (data) thread = { threadId: data.thread_id, ...data };
  }

  if (!thread) {
    threadId = generateId('thr');
    const payload = {
      thread_id:            threadId,
      user_id:              uid,
      title:                message.slice(0, 60),
      mode:                 'employer_hiring',
      context:              {},
      last_message_preview: message,
      last_message_at:      new Date().toISOString(),
    };
    const { error } = await supabase.from('chat_threads').insert(payload);
    if (error) throw error;
    thread = { threadId, ...payload };
  }

  // 2. Save employer message
  const { error: msgErr } = await supabase.from('chat_messages').insert({
    thread_id: threadId,
    role:      'user',
    content:   message,
  });
  if (msgErr) throw msgErr;

  // 3. Build context (jobs + candidates)
  log.info({ uid, threadId }, 'Building AI context for employer hiring chat...');
  const context = await buildContext(uid);

  // 4. Build conversation history (last 10 messages)
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(10);

  const conversationHistory = (history || [])
    .map(m => `${m.role === 'user' ? 'Employer' : 'Assistant'}: ${m.content}`)
    .join('\n');

  // 5. Construct the full prompt with injected context
  const contextBlock = `
=== EMPLOYER'S ACTIVE JOBS (${context.totalActiveJobs}) ===
${JSON.stringify(context.jobsSummary, null, 2)}

=== CANDIDATE POOL (${context.totalStudentsInPlatform} students) ===
${JSON.stringify(context.candidatePool, null, 2)}
`;

  const userContent = `${contextBlock}

=== CONVERSATION ===
${conversationHistory}

Employer: ${message}`;

  // 6. Call AI
  let reply;
  try {
    reply = await callGemini({
      systemPrompt: SYSTEM_PROMPT,
      userContent,
      temperature: 0.5,
    });
  } catch (err) {
    log.error({ threadId, err: err.message }, 'Gemini employer AI chat failed');
    throw err;
  }

  // 7. Save assistant reply
  await supabase.from('chat_messages').insert({
    thread_id: threadId,
    role:      'assistant',
    content:   reply,
  });

  // 8. Update thread metadata
  await supabase.from('chat_threads').update({
    last_message_preview: reply.slice(0, 80),
    last_message_at:      new Date().toISOString(),
  }).eq('thread_id', threadId);

  log.info({ uid, threadId, replyLen: reply.length }, 'Employer AI chat completed');

  return { threadId, reply };
}

/**
 * List all hiring assistant threads for an employer.
 */
export async function listEmployerThreads(uid) {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('thread_id, title, mode, last_message_preview, last_message_at, created_at')
    .eq('user_id', uid)
    .eq('mode', 'employer_hiring')
    .order('last_message_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data || []).map(d => ({
    threadId:           d.thread_id,
    title:              d.title,
    mode:               d.mode,
    lastMessagePreview: d.last_message_preview,
    lastMessageAt:      d.last_message_at,
    createdAt:          d.created_at,
  }));
}

/**
 * Get messages for a specific employer chat thread.
 */
export async function getEmployerChatMessages(threadId, uid) {
  // Verify ownership
  const { data: thread, error: threadErr } = await supabase
    .from('chat_threads')
    .select('user_id')
    .eq('thread_id', threadId)
    .maybeSingle();
  if (threadErr) throw threadErr;
  if (!thread || thread.user_id !== uid) throw AppError.forbidden('Not your thread');

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) throw error;

  return (data || []).map(m => ({
    messageId: m.id,
    role:      m.role,
    content:   m.content,
    createdAt: m.created_at,
  }));
}
