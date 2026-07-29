import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete, validate } from '#middlewares';
import * as jobCtrl from '#controllers/job.controller.js';
import { jobCreateSchema, jobUpdateSchema, jobListQuerySchema } from '#schemas/job.schema.js';

const router = Router();

// Public list + detail (no auth required for browse)
router.get('/', validate({ query: jobListQuerySchema }), jobCtrl.list);

// Employer's own jobs — MUST come before /:jobId or "me" is caught as a jobId
router.get('/me/all', authenticate, requireRole('employer'), requireProfileComplete, jobCtrl.listMine);

router.get('/:jobId', jobCtrl.get);

// Employer-only
router.post('/', authenticate, requireRole('employer'), requireProfileComplete, validate({ body: jobCreateSchema }), jobCtrl.create);
router.patch('/:jobId', authenticate, requireRole('employer'), requireProfileComplete, validate({ body: jobUpdateSchema }), jobCtrl.update);
router.delete('/:jobId', authenticate, requireRole('employer'), requireProfileComplete, jobCtrl.remove);

export default router;
