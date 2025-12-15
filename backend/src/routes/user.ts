import express from 'express';
import { getStudentProfile, updateStudentProfile, getAllStudents, getStudentById } from '../controllers/user-controller.ts';
import { authenticate, authorizeStudent, authorizeAdmin } from '../middleware/authmiddleware.ts';

const router = express.Router();

// Student routes
router.get('/profile', authenticate, authorizeStudent, getStudentProfile);
router.put('/profile', authenticate, authorizeStudent, updateStudentProfile);

// Admin routes
router.get('/all', authenticate, authorizeAdmin, getAllStudents);
router.get('/:id', authenticate, authorizeAdmin, getStudentById);

export default router;