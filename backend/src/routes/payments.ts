import express from 'express';
import {
  initiatePayment,
  monnifyWebhook,
  verifyPayment,
  getPaymentTracker,
  updateStudentPayment,
  checkPaymentStatus
} from '../controllers/payment-controller';
import { authenticate, authorizeStudent, authorizeAdmin } from '../middleware/authmiddleware';
import { paymentLimiter } from '../middleware/rate-limiter';

const router = express.Router();

// Student routes
router.post('/initiate', authenticate, authorizeStudent, paymentLimiter, initiatePayment);
router.get('/status/:paymentReference', authenticate, authorizeStudent, checkPaymentStatus);

// Webhook route (no auth - Monnify calls this)
router.post('/webhook/monnify', monnifyWebhook);

// Admin routes
router.post('/verify', authenticate, authorizeAdmin, verifyPayment);
router.post('/update', authenticate, authorizeAdmin, updateStudentPayment);

// Public routes
router.get('/tracker', getPaymentTracker);

export default router;