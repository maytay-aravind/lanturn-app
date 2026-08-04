import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete } from '#middlewares';
import * as roadmapCtrl from '#controllers/roadmap.controller.js';

const router = Router();

const auth = [authenticate, requireRole('student'), requireProfileComplete];

// Static domain catalogue — no auth needed
router.get('/domains', roadmapCtrl.listDomains);
router.get('/domains/:domainId', roadmapCtrl.getDomain);

// Student roadmap management
router.get('/me', ...auth, roadmapCtrl.getMyRoadmaps);
router.post('/me/enroll', ...auth, roadmapCtrl.enroll);
router.delete('/me/:roadmapId', ...auth, roadmapCtrl.removeRoadmap);
router.patch('/me/:roadmapId/progress', ...auth, roadmapCtrl.updateProgress);

export default router;
