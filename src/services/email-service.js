const aws = require('../config/aws-config');
const logger = require('../config/logger-config');

const emailService = {
  async sendPaymentConfirmation(to, paymentData) {
    const htmlBody = `
      <h2>Payment Confirmation</h2>
      <p>Dear ${paymentData.customerName},</p>
      <p>Your payment of ₦${paymentData.amount} has been received.</p>
      <p>Payment Reference: ${paymentData.paymentReference}</p>
    `;
    
    return await aws.sendEmail({
      to,
      subject: 'Payment Confirmation - Web3Nova Academy',
      htmlBody
    });
  },
  
  async sendPaymentReminder(to, paymentData) {
    const htmlBody = `
      <h2>Payment Reminder</h2>
      <p>Dear ${paymentData.customerName},</p>
      <p>This is a reminder about your pending payment of ₦${paymentData.amount}.</p>
    `;
    
    return await aws.sendEmail({
      to,
      subject: 'Payment Reminder - Web3Nova Academy',
      htmlBody
    });
  },
  
  async sendVerificationEmail(to, token) {
    const verifyUrl = `${config.frontend.url}/verify-email?token=${token}`;
    const htmlBody = `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `;
    
    return await aws.sendEmail({
      to,
      subject: 'Verify Your Email - Web3Nova Academy',
      htmlBody
    });
  }
};

module.exports = emailService;