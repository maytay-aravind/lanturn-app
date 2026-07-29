import { Router } from 'express';
import { authenticate, requireRole, requireProfileComplete, validate, aiLimiter } from '#middlewares';
import * as aiCtrl from '#controllers/ai.controller.js';
import {
  resumeReviewSchema,
  jobTargetSchema,
  interviewQuestionsSchema,
  coverLetterSchema,
  careerChatSchema,
} from '#schemas/ai.schema.js';

const router = Router();

const guard = [authenticate, requireRole('student'), requireProfileComplete, aiLimiter];

router.post('/resume-review', ...guard, validate({ body: resumeReviewSchema }), ...aiCtrl.reviewResume);
router.post('/resume-match', ...guard, validate({ body: jobTargetSchema }), ...aiCtrl.matchResume);
router.post('/skill-gap', ...guard, validate({ body: jobTargetSchema }), ...aiCtrl.skillGap);
router.post('/interview-questions', ...guard, validate({ body: interviewQuestionsSchema }), ...aiCtrl.interviewQuestions);
router.post('/cover-letter', ...guard, validate({ body: coverLetterSchema }), ...aiCtrl.coverLetter);
router.post('/career-chat', ...guard, validate({ body: careerChatSchema }), ...aiCtrl.careerChat);

router.get('/threads', authenticate, requireRole('student'), requireProfileComplete, ...aiCtrl.listThreads);
router.get('/threads/:threadId/messages', authenticate, requireRole('student'), requireProfileComplete, ...aiCtrl.getThreadMessages);

export default router;
