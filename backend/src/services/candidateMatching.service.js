import { jobsRepo } from '#repositories/jobs.repository.js';
import { studentsRepo } from '#repositories/students.repository.js';
import { candidateMatchesRepo } from '#repositories/candidateMatches.repository.js';
import { callGemini } from '#clients/gemini.client.js';
import { logger_for } from '#utils/logger.js';

const log = logger_for('candidateMatching.service');

const SYSTEM_PROMPT = `
You are an expert technical recruiter and AI matching system.
Your goal is to evaluate a candidate's compatibility with a job posting based on their profile, skills, experience, projects, and education.

You must return ONLY a JSON object that adheres to the following structure exactly. Do not add any markdown formatting or surrounding text.

{
  "overallScore": 92,
  "categories": {
    "technicalSkills": 90,
    "projects": 95,
    "experience": 70,
    "education": 80
  },
  "strengths": [
    "Strong React projects",
    "Good backend exposure"
  ],
  "missingSkills": [
    "TypeScript",
    "Testing"
  ],
  "recommendations": [
    "Complete testing projects"
  ],
  "decision": "Highly Recommended"
}

Scoring rules:
- Technical Skills (40% weight): Match candidate skills against job required skills.
- Projects (25% weight): Relevance of candidate projects to the job.
- Experience (20% weight): Relevance and duration of previous work experience.
- Education & Certifications (15% weight): Relevance of degree and certificates.
The "overallScore" must be a weighted average based on these weights, out of 100.
All category scores must be out of 100.
`;

export const candidateMatchingService = {
  /**
   * Generates a match score for a student and job, and stores it in the database.
   */
  async generateAndStoreMatchScore(studentId, jobId) {
    try {
      const [job, student] = await Promise.all([
        jobsRepo.getById(jobId),
        studentsRepo.getById(studentId)
      ]);

      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }
      if (!student) {
        throw new Error(`Student not found: ${studentId}`);
      }

      const jobData = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        required_skills: job.requiredSkills,
        experience_level: job.experienceLevel,
        job_type: job.jobType
      };

      const candidateData = {
        skills: student.searchableSkills || [],
        projects: student.professional?.projects || [],
        experience: student.professional?.experience || [],
        education: student.academic || {},
        certifications: student.professional?.certifications || student.certificates || [],
        resume_keywords: student.resumeKeywords || []
      };

      const userContent = `
Analyze the compatibility between this candidate and job.

Job:
${JSON.stringify(jobData, null, 2)}

Candidate:
${JSON.stringify(candidateData, null, 2)}
      `;

      log.info({ studentId, jobId }, 'Calling Gemini for candidate match score...');

      const result = await callGemini({
        systemPrompt: SYSTEM_PROMPT,
        userContent,
        responseFormat: 'json',
        temperature: 0.1
      });

      if (!result || typeof result.overallScore !== 'number') {
        throw new Error('Invalid response structure from Gemini');
      }

      log.info({ studentId, jobId, score: result.overallScore }, 'Gemini successfully generated match score');

      const matchRecord = await candidateMatchesRepo.upsertMatch({
        jobId,
        studentId,
        matchScore: result.overallScore,
        skillMatchScore: result.categories?.technicalSkills || 0,
        experienceScore: result.categories?.experience || 0,
        projectScore: result.categories?.projects || 0,
        educationScore: result.categories?.education || 0,
        overallReason: result.decision || '',
        missingSkills: result.missingSkills || [],
        recommendations: result.recommendations || []
      });

      return matchRecord;
    } catch (error) {
      log.error({ error, studentId, jobId }, 'Failed to generate and store match score');
      // We don't want to break the application process if AI matching fails,
      // so we just log the error or handle it gracefully.
      throw error;
    }
  }
};
