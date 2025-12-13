const emailService = require('./email-service');
const logger = require('../config/logger-config');

const notificationService = {
  async sendPaymentNotification(userId, type, data) {
    try {
      switch(type) {
        case 'payment_success':
          await emailService.sendPaymentConfirmation(data.email, data);
          break;
        case 'payment_reminder':
          await emailService.sendPaymentReminder(data.email, data);
          break;
      }
      
      logger.info('Notification sent', { userId, type });
    } catch (error) {
      logger.error('Notification failed', { userId, type, error: error.message });
    }
  }
};

module.exports = notificationService;