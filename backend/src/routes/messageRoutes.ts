import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { submitMessage, getMessages, replyToMessage, archiveMessage, deleteMessage } from '../controllers/messageController';

const router = Router();

// Public submission path
router.post('/', submitMessage);

// Protected paths (AdminOnly)
router.get('/', protect, adminOnly, getMessages);
router.post('/:id/reply', protect, adminOnly, replyToMessage);
router.put('/:id/archive', protect, adminOnly, archiveMessage);
router.delete('/:id', protect, adminOnly, deleteMessage);

export default router;
