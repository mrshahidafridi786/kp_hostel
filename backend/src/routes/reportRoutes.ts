import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { getDashboardStats, getReportsData } from '../controllers/reportController';

const router = Router();

// Protect all stats and report paths (AdminOnly)
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/export', getReportsData);

export default router;
