import { callGemini } from '#clients/gemini.client.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('jobDescriptionAI.service');

/**
 * Generate a professional job description using AI.
 * Takes partial job details and returns structured content.
 */
export async function generateJobDescription({ title, jobType, experienceLevel, workMode, department, industry }) {
  const systemPrompt = `You are an expert HR copywriter specializing in writing compelling, professional job descriptions for tech companies.

Given partial job details, generate a complete, well-structured job posting. Your output MUST be valid JSON with these exact keys:
- "description": A professional 2-3 paragraph description of the role (plain text, no markdown)
- "responsibilities": A bullet-pointed list of 5-8 key responsibilities (each item on its own line, prefixed with "• ")
- "requirements": An array of 4-6 qualification strings (e.g. "Bachelor's degree in Computer Science or equivalent")
- "requiredSkills": An array of 4-8 specific technical skill names (e.g. ["React", "JavaScript", "Git"])
- "niceToHave": An array of 3-5 bonus/nice-to-have skill names (e.g. ["TypeScript", "Tailwind CSS"])

Rules:
- Keep the tone professional but approachable
- Be specific to the role, not generic
- For internships, adjust expectations to be student-friendly (no "5+ years experience")
- requiredSkills and niceToHave should be short tag-like names, NOT full sentences
- responsibilities should be action-oriented sentences starting with verbs`;

  const userContent = `Generate a job description for the following position:

Title: ${title || 'Software Developer'}
Type: ${jobType || 'full-time'}
Experience Level: ${experienceLevel || 'entry'}
${workMode ? `Work Mode: ${workMode}` : ''}
${department ? `Department: ${department}` : ''}
${industry ? `Industry: ${industry}` : ''}

Return ONLY valid JSON, no markdown, no code fences.`;

  log.info({ title, jobType, experienceLevel }, 'Generating AI job description');

  const result = await callGemini({
    systemPrompt,
    userContent,
    responseFormat: 'json',
    temperature: 0.5,
  });

  log.info({ title, keysReturned: Object.keys(result) }, 'AI job description generated');

  return {
    description: result.description || '',
    responsibilities: result.responsibilities || '',
    requirements: Array.isArray(result.requirements) ? result.requirements : [],
    requiredSkills: Array.isArray(result.requiredSkills) ? result.requiredSkills : [],
    niceToHave: Array.isArray(result.niceToHave) ? result.niceToHave : [],
  };
}
