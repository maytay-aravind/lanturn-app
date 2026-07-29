import { z } from 'zod';
import { ROLES, USER_STATUS, JOB_STATUS } from '#config';

export const adminListQuerySchema = z
  .object({
    role: z.enum([ROLES.STUDENT, ROLES.EMPLOYER, ROLES.ADMIN]).optional(),
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.DISABLED]).optional(),
    q: z.string().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: z.string().max(500).optional(),
  })
  .strict();

export const userStatusSchema = z
  .object({ status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.DISABLED]) })
  .strict();

export const userRoleSchema = z
  .object({ role: z.enum([ROLES.STUDENT, ROLES.EMPLOYER, ROLES.ADMIN]) })
  .strict();

export const adminJobStatusSchema = z
  .object({ status: z.enum([JOB_STATUS.ACTIVE, JOB_STATUS.CLOSED, JOB_STATUS.REMOVED]) })
  .strict();

export const analyticsSeriesQuerySchema = z
  .object({
    type: z.string().max(60).optional(),
    days: z.coerce.number().int().min(1).max(365).optional(),
  })
  .strict();

export const platformConfigSchema = z
  .object({
    maintenanceMode: z.boolean().optional(),
    signupEnabled: z.boolean().optional(),
    aiDailyLimit: z.number().int().positive().optional(),
  })
  .strict();
