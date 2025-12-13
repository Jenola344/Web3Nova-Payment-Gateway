const express = require('express');
const router = express.Router();
const { webhookController } = require('../controllers/webhook-controller');

// Webhook routes (no authentication required - signature verified)
router.post('/monnify', webhookController.handleMonnifyWebhook);

module.exports = router;

module.exports = {
  authRoutes: require('./auth-routes'),
  paymentRoutes: require('./payment-routes'),
  userRoutes: require('./user-routes'),
  adminRoutes: require('./admin-routes'),
  webhookRoutes: require('./webhook-routes')
};