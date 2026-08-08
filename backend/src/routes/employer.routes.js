import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete, validate } from '#middlewares';
import * as employerCtrl from '#controllers/employer.controller.js';
import * as employerMatchesCtrl from '#controllers/employerMatches.controller.js';
import * as employerAICtrl from '#controllers/employerAI.controller.js';
import * as jobDescAICtrl from '#controllers/jobDescriptionAI.controller.js';
import { employerProfileUpdateSchema } from '#schemas/employer.schema.js';

const router = Router();

// Analytics — must be before /:uid so "me" is not caught as a uid
router.get('/me/analytics', authenticate, requireRole('employer'), requireProfileComplete, employerCtrl.getAnalytics);
router.get('/me', authenticate, requireRole('employer'), requireProfileComplete, employerCtrl.getMe);
router.patch('/me', authenticate, requireRole('employer'), requireProfileComplete, validate({ body: employerProfileUpdateSchema }), employerCtrl.updateMe);
router.put('/me', authenticate, requireRole('employer'), requireProfileComplete, validate({ body: employerProfileUpdateSchema }), employerCtrl.updateMe);

// Candidate Matches
router.get('/jobs/:jobId/matches', authenticate, requireRole('employer'), requireProfileComplete, employerMatchesCtrl.getJobCandidateMatches);

// AI Hiring Assistant
router.post('/ai/chat', authenticate, requireRole('employer'), requireProfileComplete, employerAICtrl.chat);
router.get('/ai/threads', authenticate, requireRole('employer'), requireProfileComplete, employerAICtrl.listThreads);
router.get('/ai/threads/:threadId/messages', authenticate, requireRole('employer'), requireProfileComplete, employerAICtrl.getMessages);
router.delete('/ai/threads/:threadId', authenticate, requireRole('employer'), requireProfileComplete, employerAICtrl.deleteThread);

// AI Job Description Generator
router.post('/ai/generate-job-description', authenticate, requireRole('employer'), requireProfileComplete, jobDescAICtrl.generate);

router.get('/:uid', employerCtrl.getPublic);

export default router;

