import { z } from 'zod';
import { APPLICATION_STATUS } from '#config';

export const applySchema = z
  .object({
    coverLetter: z.string().max(5000).optional(),
    resumeUrl: z.string().url().optional(),
  })
  .strict();

export const applicationStatusSchema = z
  .object({
    status: z.enum([
      APPLICATION_STATUS.REVIEWED,
      APPLICATION_STATUS.SHORTLISTED,
      APPLICATION_STATUS.ACCEPTED,
      APPLICATION_STATUS.REJECTED,
    ]),
  })
  .strict();
