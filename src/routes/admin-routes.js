const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers/admin-controller');
const { authenticate } = require('../middleware/auth-middleware');
const { requireAdmin } = require('../middleware/access-control');
const { validateBody, validateQuery } = require('../middleware/validator');
const paymentValidator = require('../validators/payment-validator');
const userValidator = require('../validators/user-validator');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/payments',
  validateQuery(paymentValidator.listPaymentsSchema),
  adminController.getAllPayments
);

router.put('/payments/:paymentId/status',
  validateBody(paymentValidator.updatePaymentStatusSchema),
  adminController.updatePaymentStatus
);

router.get('/users',
  validateQuery(userValidator.listUsersSchema),
  adminController.getAllUsers
);

router.get('/enrollments', adminController.getAllEnrollments);

router.get('/analytics', adminController.getAnalytics);

router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;