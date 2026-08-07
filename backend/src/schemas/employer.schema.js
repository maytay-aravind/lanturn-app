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
    // New fields
    ceo: z.string().max(160).optional(),
    foundedYear: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
    headquarters: z.string().max(300).optional(),
    branches: z.array(z.string().max(200)).max(50).optional(),
    email: z.string().email().or(z.literal('')).optional(),
    phone: z.string().max(30).optional(),
    benefits: z.array(z.string().max(200)).max(50).optional(),
    technologies: z.array(z.string().max(100)).max(100).optional(),
    companyCulture: z.string().max(5000).optional(),
    officeImages: z.array(z.string().url().or(z.literal(''))).max(10).optional(),
    logoURL: z.string().url().or(z.literal('')).optional(),
    employeeCount: z.coerce.number().int().min(0).optional().nullable(),
  })
  .strict();

export const employerProfileUpdateSchema = employerProfileSchema.partial();
