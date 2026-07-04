import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = Router();

// Protect all notification routes
router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
