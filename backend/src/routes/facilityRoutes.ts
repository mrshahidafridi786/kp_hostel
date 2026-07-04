import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { createFacility, getFacilities, updateFacility, deleteFacility } from '../controllers/facilityController';

const router = Router();

// Public endpoint (accessible by landing page)
router.get('/', getFacilities);

// Protected endpoints (AdminOnly)
router.post('/', protect, adminOnly, createFacility);
router.put('/:id', protect, adminOnly, updateFacility);
router.delete('/:id', protect, adminOnly, deleteFacility);

export default router;
