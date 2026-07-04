import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import {
  createFee,
  getFees,
  getFeeById,
  recordPayment,
  triggerManualReminders,
  generateBulkMonthlyFees
} from '../controllers/feeController';

const router = Router();

// Protect all fee routes
router.use(protect);

router.post('/', adminOnly, createFee);
router.get('/', getFees);
router.get('/:id', getFeeById);
router.post('/:id/pay', adminOnly, recordPayment);
router.post('/remind', adminOnly, triggerManualReminders);
router.post('/bulk', adminOnly, generateBulkMonthlyFees);

export default router;
