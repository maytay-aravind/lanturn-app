import * as uploadService from '#services/upload.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const sign = asyncHandler(async (req, res) => {
  const data = await uploadService.signUpload(req.user.uid, req.body);
  res.json({ data, meta: { requestId: req.id } });
});

export const commit = asyncHandler(async (req, res) => {
  const data = await uploadService.commitUpload(req.user.uid, req.user.role, req.body);
  res.json({ data, meta: { requestId: req.id } });
});
