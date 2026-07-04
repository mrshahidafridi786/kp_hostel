import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  assignStudent,
  removeStudent
} from '../controllers/roomController';

const router = Router();

// Protect all room routes
router.use(protect);

router.post('/', adminOnly, createRoom);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.put('/:id', adminOnly, updateRoom);
router.delete('/:id', adminOnly, deleteRoom);
router.post('/assign', adminOnly, assignStudent);
router.post('/remove', adminOnly, removeStudent);

export default router;
