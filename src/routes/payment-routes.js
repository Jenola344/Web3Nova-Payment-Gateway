const express = require('express');
const router = express.Router();
const { paymentController } = require('../controllers/payment-controller');
const { authenticate, requireEmailVerification } = require('../middleware/auth-middleware');
const { validateBody, validateParams } = require('../middleware/validator');
const { auditLogger } = require('../middleware/audit-logger');
const paymentValidator = require('../validators/payment-validator');

// All payment routes require authentication
router.use(authenticate);
router.use(requireEmailVerification);

router.post('/initialize',
  validateBody(paymentValidator.initializePaymentSchema),
  auditLogger('payment_initiated', 'payment'),
  paymentController.initializePayment
);

router.get('/verify/:paymentReference',
  paymentController.verifyPayment
);

router.get('/:paymentId',
  paymentController.getPaymentDetails
);

router.get('/',
  paymentController.getUserPayments
);

module.exports = router;
