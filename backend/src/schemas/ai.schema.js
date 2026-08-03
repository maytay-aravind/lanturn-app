import { z } from 'zod';

export const resumeReviewSchema = z
  .object({
    targetRole: z.string().max(200).optional(),
  })
  .strict();

export const jobTargetSchema = z
  .object({
    jobId: z.string().min(1).max(200),
    resumeUrl: z.string().url().optional(),
  })
  .strict();

export const interviewQuestionsSchema = z
  .object({
    jobId: z.string().min(1).max(200).optional(),
    skills: z.array(z.string().max(60)).max(20).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  })
  .strict();

export const coverLetterSchema = z
  .object({
    jobId: z.string().min(1).max(200),
    resumeUrl: z.string().url().optional(),
    tone: z.string().max(60).optional(),
  })
  .strict();

export const careerChatSchema = z
  .object({
    threadId: z.string().min(1).max(200).optional(),
    message: z.string().min(1).max(4000),
    mode: z.enum(['career_guidance', 'interview_prep', 'general']).optional(),
    jobId: z.string().max(200).optional(),
  })
  .strict();

/** Validated Gemini output for AI Career DNA analysis */
export const careerDnaRadarPointSchema = z.object({
  label: z.string().min(1).max(80),
  score: z.number().min(0).max(100),
  reason: z.string().min(1).max(600),
  suggestions: z.array(z.string().min(1).max(300)).min(1).max(5),
});

export const careerDnaResponseSchema = z.object({
  careerField: z.string().min(1).max(120),
  candidateLevel: z.string().min(1).max(80),
  overallScore: z.number().min(0).max(100),
  radarChart: z.array(careerDnaRadarPointSchema).length(6),
  strengths: z.array(z.string().min(1).max(400)).min(1).max(8),
  weaknesses: z.array(z.string().min(1).max(400)).min(1).max(8),
  recommendations: z.array(z.string().min(1).max(400)).min(1).max(8),
});
