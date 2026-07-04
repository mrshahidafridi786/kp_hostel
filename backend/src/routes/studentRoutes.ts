import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  toggleStudentStatus
} from '../controllers/studentController';

const router = Router();

// Apply auth protection to all student routes
router.use(protect);

router.post('/', adminOnly, createStudent);
router.get('/', adminOnly, getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', adminOnly, deleteStudent);
router.put('/:id/status', adminOnly, toggleStudentStatus);

export default router;
