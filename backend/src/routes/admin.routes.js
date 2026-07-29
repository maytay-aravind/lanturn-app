import { Router } from 'express';
import { authenticate, requireRole, validate } from '#middlewares';
import * as adminCtrl from '#controllers/admin.controller.js';
import {
  adminListQuerySchema,
  userStatusSchema,
  userRoleSchema,
  adminJobStatusSchema,
  analyticsSeriesQuerySchema,
  platformConfigSchema,
} from '#schemas/admin.schema.js';

const router = Router();

const adminGuard = [authenticate, requireRole('admin')];

router.get('/admin/users', ...adminGuard, validate({ query: adminListQuerySchema }), adminCtrl.listUsers);
router.patch('/admin/users/:uid/status', ...adminGuard, validate({ body: userStatusSchema }), adminCtrl.updateUserStatus);
router.patch('/admin/users/:uid/role', ...adminGuard, validate({ body: userRoleSchema }), adminCtrl.updateUserRole);

router.get('/admin/jobs', ...adminGuard, adminCtrl.listJobs);
router.patch('/admin/jobs/:jobId/status', ...adminGuard, validate({ body: adminJobStatusSchema }), adminCtrl.moderateJob);

router.get('/admin/analytics/summary', ...adminGuard, adminCtrl.analyticsSummary);
router.get('/admin/analytics/series', ...adminGuard, validate({ query: analyticsSeriesQuerySchema }), adminCtrl.analyticsSeries);

router.get('/platform/config', ...adminGuard, adminCtrl.getPlatformConfig);
router.patch('/platform/config', ...adminGuard, validate({ body: platformConfigSchema }), adminCtrl.updatePlatformConfig);

export default router;
