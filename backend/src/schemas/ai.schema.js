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
