const PaymentModel = require('../models/payment-model');
const logger = require('../config/logger-config');

const reconcilePayments = async () => {
  try {
    logger.info('Running payment reconciliation job...');
    
    // Mark expired payments
    const expiredCount = await PaymentModel.markExpiredPayments();
    
    logger.info(`Payment reconciliation completed: ${expiredCount} payments marked as expired`);
  } catch (error) {
    logger.error('Payment reconciliation job failed', { error: error.message });
  }
};

module.exports = { reconcilePayments };