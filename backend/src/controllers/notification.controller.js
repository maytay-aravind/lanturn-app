import * as notifService from '#services/notification.service.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const query = { ...req.query, limit: parseInt(req.query.limit || 50, 10) };
  const items = await notifService.listNotifications(req.user.uid, query);
  res.json({ data: { items }, meta: { requestId: req.id } });
});

export const markRead = asyncHandler(async (req, res) => {
  await notifService.markNotificationRead(req.params.id);
  res.json({ data: { ok: true }, meta: { requestId: req.id } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notifService.markAllNotificationsRead(req.user.uid);
  res.json({ data: { ok: true }, meta: { requestId: req.id } });
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await notifService.getUnreadCount(req.user.uid);
  res.json({ data: { count }, meta: { requestId: req.id } });
});
