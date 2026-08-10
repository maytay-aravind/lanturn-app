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

export const skillTestSchema = z
  .object({
    skill: z.string().min(1).max(100),
    rating: z.number().int().min(0).max(100),
  })
  .strict();

export const skillTestEvalSchema = z
  .object({
    skill: z.string().min(1).max(100),
    rating: z.number().int().min(0).max(100),
    questions: z.array(z.object({
      question: z.string().min(1),
      answer: z.string().min(1).max(3000),
    })).min(3).max(3),
  })
  .strict();

/** Validated Gemini output for Skill Test question generation */
export const skillTestQuestionResponseSchema = z.object({
  questions: z.array(z.object({
    id: z.number(),
    question: z.string().min(1),
    difficulty: z.string().min(1),
  })).length(3),
});

/** Validated Gemini output for Skill Test evaluation */
export const skillTestEvalResponseSchema = z.object({
  passed: z.boolean(),
  medal: z.enum(['gold', 'silver', 'bronze', 'basic', 'none']),
  score: z.string(),
  results: z.array(z.object({
    questionId: z.number(),
    correct: z.boolean(),
    feedback: z.string().min(1),
  })).length(3),
});

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

/** Validated Gemini output for AI Company DNA analysis */
export const companyDnaDimensionSchema = z.object({
  name: z.string().min(1).max(80),
  score: z.number().min(0).max(100),
  reason: z.string().min(1).max(600),
});

export const companyDnaResponseSchema = z.object({
  companyPersonality: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  overallScore: z.number().min(0).max(100),
  companyDNA: z.array(companyDnaDimensionSchema).length(6),
});
