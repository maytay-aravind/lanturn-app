import * as authService from '#services/auth.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const session = asyncHandler(async (req, res) => {
  const data = await authService.getSession(req.user.uid);
  res.json({ data, meta: { requestId: req.id } });
});

export const onboard = asyncHandler(async (req, res) => {
  const data = await authService.onboard(req.user.uid, req.body);
  res.json({ data, meta: { requestId: req.id } });
});

export const logout = asyncHandler(async (req, res) => {
  // Stateless: client just discards the token. Optionally revoke server-side.
  res.json({ data: { ok: true }, meta: { requestId: req.id } });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const data = await authService.adminLogin(req.user.uid, req.user.email);
  res.json({ data, meta: { requestId: req.id } });
});
