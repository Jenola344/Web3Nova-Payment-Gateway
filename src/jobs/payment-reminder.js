const PaymentModel = require('../models/payment-model');
const notificationService = require('../services/notification-service');
const { addDays } = require('../utils/date-utils');
const logger = require('../config/logger-config');

const sendPaymentReminders = async () => {
  try {
    logger.info('Running payment reminder job...');
    
    // Get pending payments expiring soon
    const expiryDate = addDays(new Date(), 2);
    const pendingPayments = await PaymentModel.findAll({
      status: 'pending',
      endDate: expiryDate
    });
    
    for (const payment of pendingPayments.payments) {
      await notificationService.sendPaymentNotification(
        payment.user_id,
        'payment_reminder',
        {
          email: payment.customer_email,
          customerName: payment.customer_name,
          amount: payment.amount,
          paymentReference: payment.payment_reference
        }
      );
    }
    
    logger.info(`Payment reminders sent: ${pendingPayments.payments.length}`);
  } catch (error) {
    logger.error('Payment reminder job failed', { error: error.message });
  }
};

module.exports = { sendPaymentReminders };