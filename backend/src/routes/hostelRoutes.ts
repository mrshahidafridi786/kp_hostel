import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import {
  getHostelInfo,
  updateHostelInfo,
  updateWardenProfile,
  updateMDProfile,
  updateCredentials,
  uploadGalleryMedia,
  deleteGalleryMedia,
  getCredentials
} from '../controllers/hostelController';

const router = Router();

// Public endpoint (accessible by landing page)
router.get('/', getHostelInfo);

// Protected endpoints (AdminOnly)
router.get('/settings', protect, adminOnly, getCredentials);
router.put('/', protect, adminOnly, updateHostelInfo);
router.put('/warden', protect, adminOnly, updateWardenProfile);
router.put('/md', protect, adminOnly, updateMDProfile);
router.put('/settings', protect, adminOnly, updateCredentials);
router.post('/gallery', protect, adminOnly, uploadGalleryMedia);
router.delete('/gallery/:mediaId', protect, adminOnly, deleteGalleryMedia);

export default router;
