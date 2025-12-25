import express from 'express';
import { getStudentProfile, updateStudentProfile, getAllStudents, getStudentById, createStudent, updateStudent } from '../controllers/user-controller';
import { authenticate, authorizeStudent, authorizeAdmin } from '../middleware/authmiddleware';

const router = express.Router();

// Student routes
router.get('/profile', authenticate, authorizeStudent, getStudentProfile);
router.put('/profile', authenticate, authorizeStudent, updateStudentProfile);

// Admin routes
router.get('/all', authenticate, authorizeAdmin, getAllStudents);
router.post('/register', authenticate, authorizeAdmin, createStudent);
router.get('/:id', authenticate, authorizeAdmin, getStudentById);
router.put('/:id', authenticate, authorizeAdmin, updateStudent);

export default router;