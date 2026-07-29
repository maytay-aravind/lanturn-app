import * as profileService from '#services/profile.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
  const data = await profileService.getStudentProfile(req.user.uid);
  res.json({ data, meta: { requestId: req.id } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const data = await profileService.updateStudentProfile(req.user.uid, req.body);
  res.json({ data, meta: { requestId: req.id } });
});

export const getPublic = asyncHandler(async (req, res) => {
  const data = await profileService.getStudentPublic(req.params.uid);
  res.json({ data, meta: { requestId: req.id } });
});
