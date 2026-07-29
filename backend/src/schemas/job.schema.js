import { z } from 'zod';
import { JOB_STATUS, JOB_TYPE, EXPERIENCE_LEVEL } from '#config';

export const jobCreateSchema = z
  .object({
    title: z.string().min(1).max(160),
    description: z.string().min(1).max(10000),
    requirements: z.array(z.string().max(500)).max(50),
    requiredSkills: z.array(z.string().max(60)).max(50),
    location: z
      .object({
        city: z.string().max(120).optional(),
        state: z.string().max(120).optional(),
        country: z.string().max(120).optional(),
        remote: z.boolean().optional(),
      })
      .partial(),
    jobType: z.enum([JOB_TYPE.FULL_TIME, JOB_TYPE.INTERNSHIP, JOB_TYPE.PART_TIME, JOB_TYPE.CONTRACT]),
    industry: z.string().max(120).optional(),
    salary: z
      .object({
        min: z.number().nonnegative().optional(),
        max: z.number().nonnegative().optional(),
        currency: z.string().max(8).optional(),
        period: z.string().max(20).optional(),
      })
      .partial()
      .optional(),
    experienceLevel: z
      .enum([EXPERIENCE_LEVEL.ENTRY, EXPERIENCE_LEVEL.JUNIOR, EXPERIENCE_LEVEL.MID, EXPERIENCE_LEVEL.SENIOR])
      .optional(),
    openings: z.number().int().min(1).max(1000).optional(),
    deadline: z.string().datetime().optional(),
    status: z.enum([JOB_STATUS.DRAFT, JOB_STATUS.ACTIVE]).optional(),
  })
  .strict();

export const jobUpdateSchema = jobCreateSchema.partial();

export const jobListQuerySchema = z
  .object({
    q: z.string().max(200).optional(),
    jobType: z.enum([JOB_TYPE.FULL_TIME, JOB_TYPE.INTERNSHIP, JOB_TYPE.PART_TIME, JOB_TYPE.CONTRACT]).optional(),
    industry: z.string().max(120).optional(),
    country: z.string().max(120).optional(),
    remote: z.enum(['true', 'false']).optional(),
    skill: z.string().max(60).optional(),
    experienceLevel: z
      .enum([EXPERIENCE_LEVEL.ENTRY, EXPERIENCE_LEVEL.JUNIOR, EXPERIENCE_LEVEL.MID, EXPERIENCE_LEVEL.SENIOR])
      .optional(),
    sort: z.enum(['recent', 'deadline']).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    cursor: z.string().max(500).optional(),
  })
  .strict();
