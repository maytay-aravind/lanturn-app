import { z } from 'zod';
import { ROLES } from '#config';

export const onboardingSchema = z
  .object({
    role: z.enum([ROLES.STUDENT, ROLES.EMPLOYER]),
    profile: z.record(z.unknown()).default({}),
  })
  .strict();

// Sign-in is just the Firebase ID token in the Authorization header — no body.
export const emptySchema = z.object({}).strict();
