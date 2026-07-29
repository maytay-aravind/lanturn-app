import { Router } from 'express';
import { authenticate } from '#middlewares';
import * as notifCtrl from '#controllers/notification.controller.js';

const router = Router();

router.get('/', authenticate, notifCtrl.list);
router.get('/unread-count', authenticate, notifCtrl.unreadCount);
router.patch('/:id/read', authenticate, notifCtrl.markRead);
router.post('/read-all', authenticate, notifCtrl.markAllRead);

export default router;
