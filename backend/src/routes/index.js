import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import employerRoutes from './employer.routes.js';
import uploadRoutes from './upload.routes.js';
import jobRoutes from './job.routes.js';
import applicationRoutes from './application.routes.js';
import notificationRoutes from './notification.routes.js';
import aiRoutes from './ai.routes.js';
import adminRoutes from './admin.routes.js';
import joobleRoutes from './jooble.routes.js';
import magicalRoutes from './magical.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/employers', employerRoutes);
router.use('/uploads', uploadRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', adminRoutes); // mounts /admin/* and /platform/*

// Jobs mounted at /jobs; application routes use absolute paths (/jobs/:jobId/applications,
// /applications, etc.) so they are mounted at root.
router.use('/jobs', jobRoutes);
router.use('/jobs', joobleRoutes);
router.use('/magical', magicalRoutes);
router.use('/', applicationRoutes);

export default router;
