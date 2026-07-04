import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '../controllers/announcementController';

const router = Router();

// Protect all announcement routes
router.use(protect);

router.post('/', adminOnly, createAnnouncement);
router.get('/', getAnnouncements);
router.delete('/:id', adminOnly, deleteAnnouncement);

export default router;
