import { z } from 'zod';

const isoYear = z
  .number()
  .int()
  .min(1980)
  .max(2100);

const url = z.string().url().or(z.literal('')).optional();

export const studentProfileSchema = z
  .object({
    personal: z
      .object({
        name: z.string().max(120).optional(),
        phone: z.string().max(30).optional(),
        city: z.string().max(120).optional(),
        state: z.string().max(120).optional(),
        country: z.string().max(120).optional(),
      })
      .partial(),
    academic: z
      .object({
        college: z.string().max(200).optional(),
        degree: z.string().max(120).optional(),
        branch: z.string().max(120).optional(),
        graduationYear: isoYear.optional(),
        cgpa: z.number().min(0).max(10).optional(),
      })
      .partial(),
    professional: z
      .object({
        skills: z.array(z.string().max(60)).max(100).optional(),
        resumeUrl: url,
        projects: z
          .array(
            z.object({
              title: z.string(),
              description: z.string().optional(),
              link: z.string().optional(),
              techStack: z.array(z.string()).optional(),
            })
          )
          .optional(),
        experience: z
          .array(
            z.object({
              company: z.string(),
              role: z.string(),
              startDate: z.string().optional(),
              endDate: z.string().optional(),
              description: z.string().optional(),
            })
          )
          .optional(),
        certifications: z
          .array(
            z.object({
              name: z.string(),
              issuer: z.string().optional(),
              date: z.string().optional(),
              url: z.string().optional(),
            })
          )
          .optional(),
      })
      .partial(),
    social: z
      .object({
        github: z.string().max(120).optional(),
        linkedin: z.string().max(120).optional(),
        portfolio: z.string().max(200).optional(),
      })
      .partial(),
    certificates: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          uploadedAt: z.string(),
        })
      )
      .optional(),
  })
  .strict();

export const studentProfileUpdateSchema = studentProfileSchema.partial();
