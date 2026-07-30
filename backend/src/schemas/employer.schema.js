import { z } from 'zod';

export const employerProfileSchema = z
  .object({
    companyName: z.string().max(160).optional(),
    website: z.string().url().or(z.literal('')).optional(),
    description: z.string().max(5000).optional(),
    companySize: z.string().max(60).optional(),
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
