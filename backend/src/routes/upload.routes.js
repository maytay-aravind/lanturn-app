import { Router } from 'express';
import { authenticate, validate } from '#middlewares';
import * as uploadCtrl from '#controllers/upload.controller.js';
import { uploadSignSchema, uploadCommitSchema } from '#schemas/upload.schema.js';

const router = Router();

router.post('/sign', authenticate, validate({ body: uploadSignSchema }), uploadCtrl.sign);
router.post('/commit', authenticate, validate({ body: uploadCommitSchema }), uploadCtrl.commit);

export default router;
