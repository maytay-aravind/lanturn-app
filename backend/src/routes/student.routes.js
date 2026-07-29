import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete, validate } from '#middlewares';
import * as studentCtrl from '#controllers/student.controller.js';
import { studentProfileUpdateSchema } from '#schemas/student.schema.js';

const router = Router();

router.get('/me', authenticate, requireRole('student'), requireProfileComplete, studentCtrl.getMe);
router.patch('/me', authenticate, requireRole('student'), requireProfileComplete, validate({ body: studentProfileUpdateSchema }), studentCtrl.updateMe);
router.put('/me', authenticate, requireRole('student'), requireProfileComplete, validate({ body: studentProfileUpdateSchema }), studentCtrl.updateMe);
router.get('/:uid', authenticate, studentCtrl.getPublic);

export default router;
