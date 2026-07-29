import { Router } from 'express';
import { authenticate, authLimiter, validate } from '#middlewares';
import * as authCtrl from '#controllers/auth.controller.js';
import { onboardingSchema } from '#schemas/auth.schema.js';

const router = Router();

router.get('/session', authenticate, authCtrl.session);
router.post('/onboarding', authenticate, authLimiter, validate({ body: onboardingSchema }), authCtrl.onboard);
router.post('/logout', authenticate, authCtrl.logout);

export default router;
