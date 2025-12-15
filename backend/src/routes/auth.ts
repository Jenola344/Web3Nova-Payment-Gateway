import express from 'express';
import { login, logout, registerStudent, registerAdmin } from '../controllers/auth-controller.ts';
import { loginLimiter } from '../middleware/rate-limiter.ts';

const router = express.Router();

// Public routes
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/register/student', registerStudent);
router.post('/register/admin', registerAdmin);

export default router;