import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete, validate } from '#middlewares';
import * as appCtrl from '#controllers/application.controller.js';
import { applySchema, applicationStatusSchema } from '#schemas/application.schema.js';

const router = Router();

// Student applies to a job
router.post('/jobs/:jobId/applications',
  authenticate, requireRole('student'), requireProfileComplete,
  validate({ body: applySchema }), appCtrl.apply);

// Student's own applications
router.get('/applications',
  authenticate, requireRole('student'), requireProfileComplete, appCtrl.listMine);

// Employer views applicants for a job
router.get('/jobs/:jobId/applications',
  authenticate, requireRole('employer'), requireProfileComplete, appCtrl.listForJob);

// Get signed URL for applicant's resume
router.get('/applications/:applicationId/resume-url',
  authenticate, requireRole('employer'), appCtrl.getResumeUrl);

// Single application (student owner / employer owner / admin)
router.get('/applications/:applicationId', authenticate, appCtrl.getOne);

// Employer/admin updates status
router.patch('/applications/:applicationId/status',
  authenticate, requireRole('employer', 'admin'),
  validate({ body: applicationStatusSchema }), appCtrl.updateStatus);

// Student withdraws
router.delete('/applications/:applicationId',
  authenticate, requireRole('student'), requireProfileComplete, appCtrl.withdraw);

export default router;
