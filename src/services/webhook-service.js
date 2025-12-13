const WebhookLogModel = require('../models/webhook-log-model');
const PaymentModel = require('../models/payment-model');
const { mapPaymentStatus } = require('../config/monnify-config');
const { verifyWebhookSignature } = require('../utils/crypto-utils');
const config = require('../config/env-config');

const webhookService = {
  async processMonnifyWebhook(payload, signature) {
    // Create webhook log
    const log = await WebhookLogModel.create({
      provider: 'monnify',
      eventType: payload.eventType,
      payload,
      signature,
      signatureValid: verifyWebhookSignature(payload, signature, config.monnify.webhookSecret)
    });
    
    try {
      if (!log.signature_valid) {
        throw new Error('Invalid webhook signature');
      }
      
      // Process based on event type
      if (payload.eventType === 'SUCCESSFUL_TRANSACTION') {
        const payment = await PaymentModel.findByMonnifyReference(payload.transactionReference);
        
        if (payment) {
          await PaymentModel.updateStatus(payment.id, 'completed', {
            paid_at: new Date(),
            payment_method: payload.paymentMethod?.toLowerCase()
          });
        }
      }
      
      await WebhookLogModel.updateStatus(log.id, 'processed', { success: true });
      return { success: true };
    } catch (error) {
      await WebhookLogModel.updateStatus(log.id, 'failed', null, error.message);
      throw error;
    }
  }
};

module.exports = webhookService;