import { Router } from 'express';
import { authenticate, requireProfileComplete, validate } from '#middlewares';
import * as uploadCtrl from '#controllers/upload.controller.js';
import { uploadSignSchema, uploadCommitSchema } from '#schemas/upload.schema.js';

const router = Router();

router.post('/sign', authenticate, requireProfileComplete, validate({ body: uploadSignSchema }), uploadCtrl.sign);
router.post('/commit', authenticate, requireProfileComplete, validate({ body: uploadCommitSchema }), uploadCtrl.commit);

export default router;
