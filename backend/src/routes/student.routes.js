import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete, validate } from '#middlewares';
import * as studentCtrl from '#controllers/student.controller.js';
import { studentProfileUpdateSchema } from '#schemas/student.schema.js';

const router = Router();

router.get('/me', authenticate, requireRole('student'), requireProfileComplete, studentCtrl.getMe);
router.patch('/me', authenticate, requireRole('student'), requireProfileComplete, validate({ body: studentProfileUpdateSchema }), studentCtrl.updateMe);
router.put('/me', authenticate, requireRole('student'), requireProfileComplete, validate({ body: studentProfileUpdateSchema }), studentCtrl.updateMe);
// Must be before /:uid so Express doesn't treat "resume-url" as a uid
router.get('/me/resume-url', authenticate, requireRole('student'), requireProfileComplete, studentCtrl.getResumeUrl);
router.get('/me/certificate-url', authenticate, requireRole('student'), requireProfileComplete, studentCtrl.getCertificateUrl);
router.get('/:uid', authenticate, studentCtrl.getPublic);

export default router;
