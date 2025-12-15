import express from 'express';
import { 
  initiatePayment, 
  confirmPayment, 
  verifyPayment, 
  getPaymentTracker, 
  updateStudentPayment 
} from '../controllers/payment-controller.ts';
import { authenticate, authorizeStudent, authorizeAdmin } from '../middleware/authmiddleware.ts';
import { paymentLimiter } from '../middleware/rate-limiter.ts';

const router = express.Router();

// Student routes
router.post('/initiate', authenticate, authorizeStudent, paymentLimiter, initiatePayment);
router.post('/confirm', authenticate, authorizeStudent, paymentLimiter, confirmPayment);

// Admin routes
router.post('/verify', authenticate, authorizeAdmin, verifyPayment);
router.post('/update', authenticate, authorizeAdmin, updateStudentPayment);

// Public routes
router.get('/tracker', getPaymentTracker);

export default router;