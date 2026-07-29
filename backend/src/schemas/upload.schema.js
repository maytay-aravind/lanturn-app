import { z } from 'zod';
import { UPLOAD_KINDS } from '#config';

export const uploadSignSchema = z
  .object({
    kind: z.enum([UPLOAD_KINDS.RESUME, UPLOAD_KINDS.PROFILE_PHOTO, UPLOAD_KINDS.COMPANY_LOGO]),
    mimeType: z.string().min(1).max(100),
    sizeBytes: z.number().int().positive(),
  })
  .strict();

export const uploadCommitSchema = z
  .object({
    kind: z.enum([UPLOAD_KINDS.RESUME, UPLOAD_KINDS.PROFILE_PHOTO, UPLOAD_KINDS.COMPANY_LOGO]),
    objectPath: z.string().min(1).max(500),
  })
  .strict();
