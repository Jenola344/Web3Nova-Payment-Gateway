/**
 * Payment Service
 * Core payment processing logic with Monnify integration
 */

const axios = require('axios');
const PaymentModel = require('../models/payment-model');
const EnrollmentModel = require('../models/enrollment-model');
const TransactionModel = require('../models/transaction-model');
const {
  getApiUrl,
  getEncodedCredentials,
  buildInitializationPayload,
  parseResponse,
  mapPaymentStatus,
  logApiCall
} = require('../config/monnify-config');
const { generatePaymentReference } = require('../utils/payment-utils');
const { addDays } = require('../utils/date-utils');
const { PaymentError, NotFoundError } = require('../utils/error-utils');
const logger = require('../config/logger-config');
const config = require('../config/env-config');

let cachedAccessToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Monnify API
 * @returns {Promise<string>}
 */
const authenticateWithMonnify = async () => {
  // Return cached token if still valid
  if (cachedAccessToken && tokenExpiry && new Date() < tokenExpiry) {
    return cachedAccessToken;
  }
  
  try {
    const url = getApiUrl('authenticate');
    const credentials = getEncodedCredentials();
    
    const response = await axios.post(url, {}, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = parseResponse(response.data);
    
    if (!result.success) {
      throw new Error('Monnify authentication failed');
    }
    
    cachedAccessToken = result.data.accessToken;
    // Set expiry to 5 minutes before actual expiry
    tokenExpiry = new Date(Date.now() + (result.data.expiresIn - 300) * 1000);
    
    logger.info('Monnify authentication successful');
    return cachedAccessToken;
  } catch (error) {
    logger.error('Monnify authentication failed', { error: error.message });
    throw new PaymentError('Payment gateway authentication failed');
  }
};

/**
 * Initialize payment
 * @param {Object} paymentData - Payment initialization data
 * @returns {Promise<Object>}
 */
const initializePayment = async (paymentData) => {
  const {
    userId,
    enrollmentId,
    stage,
    amount,
    customerName,
    customerEmail,
    customerPhone
  } = paymentData;
  
  // Get enrollment details
  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) {
    throw new NotFoundError('Enrollment not found');
  }
  
  // Generate payment reference
  const paymentReference = generatePaymentReference(userId, stage);
  
  // Calculate expiry
  const expiresAt = addDays(new Date(), config.payment.expiryDays);
  
  // Create payment record
  const payment = await PaymentModel.create({
    userId,
    enrollmentId,
    paymentReference,
    amount,
    stage,
    paymentDescription: `Stage ${stage} Payment - ${enrollment.skill}`,
    customerName,
    customerEmail,
    customerPhone,
    expiresAt,
    metadata: {
      skill: enrollment.skill,
      scholarshipType: enrollment.scholarship_type
    }
  });
  
  try {
    // Authenticate with Monnify
    const accessToken = await authenticateWithMonnify();
    
    // Build initialization payload
    const payload = buildInitializationPayload({
      amount,
      customerName,
      customerEmail,
      customerPhone,
      paymentReference,
      paymentDescription: payment.payment_description,
      redirectUrl: `${config.frontend.url}/payment/callback`,
      metadata: {
        paymentId: payment.id,
        enrollmentId,
        stage
      }
    });
    
    // Call Monnify API
    const url = getApiUrl('initializeTransaction');
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = parseResponse(response.data);
    logApiCall('initializeTransaction', payload, response.data);
    
    if (!result.success) {
      throw new PaymentError(result.message || 'Payment initialization failed');
    }
    
    // Update payment with Monnify details
    await PaymentModel.update(payment.id, {
      monnify_transaction_ref: result.data.transactionReference,
      payment_url: result.data.paymentReference,
      checkout_url: result.data.checkoutUrl,
      status: 'pending'
    });
    
    // Create transaction log
    await TransactionModel.create({
      paymentId: payment.id,
      userId,
      transactionType: 'payment',
      amount,
      status: 'initiated',
      transactionReference: paymentReference,
      externalReference: result.data.transactionReference,
      currency: 'NGN',
      description: payment.payment_description
    });
    
    logger.logPayment('payment_initialized', {
      paymentId: payment.id,
      userId,
      amount,
      stage
    });
    
    return {
      paymentId: payment.id,
      paymentReference,
      checkoutUrl: result.data.checkoutUrl,
      amount,
      expiresAt
    };
  } catch (error) {
    // Update payment status to failed
    await PaymentModel.update(payment.id, {
      status: 'failed',
      error_message: error.message
    });
    
    logger.error('Payment initialization failed', {
      paymentId: payment.id,
      error: error.message
    });
    
    throw error;
  }
};

/**
 * Verify payment
 * @param {string} paymentReference - Payment reference
 * @returns {Promise<Object>}
 */
const verifyPayment = async (paymentReference) => {
  const payment = await PaymentModel.findByReference(paymentReference);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  
  try {
    const accessToken = await authenticateWithMonnify();
    
    const url = getApiUrl('verifyTransaction');
    const response = await axios.get(`${url}/${paymentReference}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = parseResponse(response.data);
    logApiCall('verifyTransaction', { paymentReference }, response.data);
    
    if (!result.success) {
      throw new PaymentError('Payment verification failed');
    }
    
    const monnifyStatus = result.data.paymentStatus;
    const internalStatus = mapPaymentStatus(monnifyStatus);
    
    // Update payment status
    await PaymentModel.updateStatus(payment.id, internalStatus, {
      payment_method: result.data.paymentMethod?.toLowerCase().replace(' ', '_'),
      monnify_transaction_ref: result.data.transactionReference
    });
    
    // Update transaction
    const transactions = await TransactionModel.findByPaymentId(payment.id);
    if (transactions.length > 0) {
      await TransactionModel.updateStatus(
        transactions[0].id,
        internalStatus === 'completed' ? 'successful' : 'failed'
      );
    }
    
    logger.logPayment('payment_verified', {
      paymentId: payment.id,
      status: internalStatus
    });
    
    return {
      paymentId: payment.id,
      status: internalStatus,
      amount: payment.amount,
      paymentMethod: result.data.paymentMethod
    };
  } catch (error) {
    logger.error('Payment verification failed', {
      paymentReference,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>}
 */
const getPaymentDetails = async (paymentId) => {
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  
  const transactions = await TransactionModel.findByPaymentId(paymentId);
  
  return {
    ...payment,
    transactions
  };
};

/**
 * Get user payments
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
const getUserPayments = async (userId) => {
  return await PaymentModel.findByUserId(userId);
};

module.exports = {
  initializePayment,
  verifyPayment,
  getPaymentDetails,
  getUserPayments
};