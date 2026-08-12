import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole, requireProfileComplete } from '#middlewares';
import * as roadmapCtrl from '#controllers/roadmap.controller.js';

const router = Router();

const auth = [authenticate, requireRole('student'), requireProfileComplete];

// Multer: accept a single PDF file in memory (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

// Static domain catalogue — no auth needed
router.get('/domains', roadmapCtrl.listDomains);
router.get('/domains/:domainId', roadmapCtrl.getDomain);

// Student roadmap management
router.get('/me', ...auth, roadmapCtrl.getMyRoadmaps);
router.post('/me/enroll', ...auth, roadmapCtrl.enroll);
router.delete('/me/:roadmapId', ...auth, roadmapCtrl.removeRoadmap);
router.patch('/me/:roadmapId/progress', ...auth, roadmapCtrl.updateProgress);

// AI Resume Gap Analyzer
router.post('/analyze-resume', ...auth, upload.single('resume'), roadmapCtrl.analyzeResume);
router.post('/sync-resume-progress', ...auth, roadmapCtrl.syncResumeTopics);

export default router;

