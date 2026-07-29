import * as profileService from '#services/profile.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
  const data = await profileService.getEmployerProfile(req.user.uid);
  res.json({ data, meta: { requestId: req.id } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const data = await profileService.updateEmployerProfile(req.user.uid, req.body);
  res.json({ data, meta: { requestId: req.id } });
});

export const getPublic = asyncHandler(async (req, res) => {
  const data = await profileService.getEmployerPublic(req.params.uid);
  res.json({ data, meta: { requestId: req.id } });
});
