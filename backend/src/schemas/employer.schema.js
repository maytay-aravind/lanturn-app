import { z } from 'zod';

export const employerProfileSchema = z
  .object({
    companyName: z.string().min(1).max(160),
    website: z.string().url().or(z.literal('')).optional(),
    description: z.string().max(5000).optional(),
    location: z
      .object({
        city: z.string().max(120).optional(),
        state: z.string().max(120).optional(),
        country: z.string().max(120).optional(),
      })
      .partial()
      .optional(),
    industry: z.string().max(120).optional(),
    hrContact: z
      .object({
        name: z.string().max(120).optional(),
        email: z.string().email().optional(),
        phone: z.string().max(30).optional(),
      })
      .partial()
      .optional(),
  })
  .strict();

export const employerProfileUpdateSchema = employerProfileSchema.partial();
