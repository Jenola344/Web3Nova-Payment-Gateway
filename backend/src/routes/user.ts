import express from 'express';
import { getStudentProfile, updateStudentProfile, getAllStudents, getStudentById, createStudent, updateStudent, getStudentStats } from '../controllers/user-controller';
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
router.get('/stats/dashboard', getStudentStats); // Public or Protected? Tracker is public. Let's make it public for now or check usage.


export default router;