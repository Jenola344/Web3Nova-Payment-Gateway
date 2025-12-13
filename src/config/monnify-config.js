/**
 * Monnify Payment Gateway Configuration
 * API endpoints and configuration for Monnify integration
 */

const config = require('./env-config');
const logger = require('./logger-config');

const MONNIFY_CONFIG = {
    baseUrl: config.monnify.baseUrl,
    apiKey: config.monnify.apiKey,
    secretKey: config.monnify.secretKey,
    contractCode: config.monnify.contractCode,
    webhookSecret: config.monnify.webhookSecret,
    
    // API Endpoints
    endpoints: {
        authenticate: '/api/v1/auth/login',
        initializeTransaction: '/api/v1/merchant/transactions/init-transaction',
        verifyTransaction: '/api/v1/merchant/transactions/query',
        getTransactionStatus: '/api/v1/merchant/transactions/verify',
        reserveAccount: '/api/v1/bank-transfer/reserved-accounts',
        getReservedAccounts: '/api/v1/bank-transfer/reserved-accounts',
        deleteReservedAccount: '/api/v1/bank-transfer/reserved-accounts/reference',
        getBanks: '/api/v1/banks'
    },
    
    // Payment Methods
    paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD', 'PHONE_NUMBER'],
    
    // Default Settings
    defaults: {
        currency: 'NGN',
        paymentMethod: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
        redirectUrl: `${config.frontend.url}/payment/callback`,
        incomeSplitConfig: []
    },
    
    // Timeouts (in milliseconds)
    timeout: {
        connection: 30000, // 30 seconds
        request: 45000 // 45 seconds
    }
};

/**
 * Get authentication credentials
 * @returns {Object}
 */
const getAuthCredentials = () => {
  return {
    apiKey: MONNIFY_CONFIG.apiKey,
    secretKey: MONNIFY_CONFIG.secretKey
  };
};

/**
 * Get base64 encoded credentials for authentication
 * @returns {string}
 */
const getEncodedCredentials = () => {
  const credentials = `${MONNIFY_CONFIG.apiKey}:${MONNIFY_CONFIG.secretKey}`;
  return Buffer.from(credentials).toString('base64');
};

/**
 * Get full API URL
 * @param {string} endpoint - API endpoint
 * @returns {string}
 */
const getApiUrl = (endpoint) => {
  const endpointPath = MONNIFY_CONFIG.endpoints[endpoint] || endpoint;
  return `${MONNIFY_CONFIG.baseUrl}${endpointPath}`;
};

/**
 * Validate webhook signature
 * @param {string} signature - Received signature
 * @param {Object} payload - Webhook payload
 * @returns {boolean}
 */
const validateWebhookSignature = (signature, payload) => {
  const crypto = require('crypto');
  
  const expectedSignature = crypto
    .createHmac('sha512', MONNIFY_CONFIG.webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
};

/**
 * Generate transaction reference
 * @param {string} userId - User ID
 * @param {number} stage - Payment stage
 * @returns {string}
 */
const generateTransactionReference = (userId, stage) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN-${userId.substring(0, 8).toUpperCase()}-${stage}-${timestamp}-${random}`;
};

/**
 * Build payment initialization payload
 * @param {Object} params - Payment parameters
 * @returns {Object}
 */
const buildInitializationPayload = (params) => {
  const {
    amount,
    customerName,
    customerEmail,
    customerPhone,
    paymentReference,
    paymentDescription,
    redirectUrl,
    metadata
  } = params;
  
  return {
    amount: parseFloat(amount),
    customerName,
    customerEmail,
    customerPhone,
    paymentReference,
    paymentDescription: paymentDescription || 'Web3Nova Academy Payment',
    currencyCode: MONNIFY_CONFIG.defaults.currency,
    contractCode: MONNIFY_CONFIG.contractCode,
    redirectUrl: redirectUrl || MONNIFY_CONFIG.defaults.redirectUrl,
    paymentMethods: MONNIFY_CONFIG.defaults.paymentMethod,
    metadata: metadata || {},
    incomeSplitConfig: MONNIFY_CONFIG.defaults.incomeSplitConfig
  };
};

/**
 * Parse Monnify response
 * @param {Object} response - Monnify API response
 * @returns {Object}
 */
const parseResponse = (response) => {
  try {
    return {
      success: response.requestSuccessful === true,
      message: response.responseMessage,
      code: response.responseCode,
      data: response.responseBody || null
    };
  } catch (error) {
    logger.error('Error parsing Monnify response', {
      response,
      error: error.message
    });
    throw error;
  }
};

/**
 * Map Monnify payment status to internal status
 * @param {string} monnifyStatus - Monnify status
 * @returns {string}
 */
const mapPaymentStatus = (monnifyStatus) => {
  const statusMap = {
    'PAID': 'completed',
    'PENDING': 'pending',
    'FAILED': 'failed',
    'EXPIRED': 'expired',
    'CANCELLED': 'cancelled',
    'OVERPAID': 'completed',
    'PARTIALLY_PAID': 'pending'
  };
  
  return statusMap[monnifyStatus] || 'pending';
};

/**
 * Get payment method display name
 * @param {string} method - Payment method code
 * @returns {string}
 */
const getPaymentMethodName = (method) => {
  const methodNames = {
    'CARD': 'Card Payment',
    'ACCOUNT_TRANSFER': 'Bank Transfer',
    'USSD': 'USSD',
    'PHONE_NUMBER': 'Phone Number'
  };
  
  return methodNames[method] || method;
};

/**
 * Check if environment is sandbox
 * @returns {boolean}
 */
const isSandbox = () => {
  return MONNIFY_CONFIG.baseUrl.includes('sandbox');
};

/**
 * Log Monnify API call
 * @param {string} endpoint - API endpoint
 * @param {Object} payload - Request payload
 * @param {Object} response - API response
 */
const logApiCall = (endpoint, payload, response) => {
  logger.info('Monnify API Call', {
    endpoint,
    payload: {
      ...payload,
      // Mask sensitive data
      customerPhone: payload.customerPhone ? '***' + payload.customerPhone.slice(-4) : undefined
    },
    response: {
      success: response.requestSuccessful,
      message: response.responseMessage
    },
    category: 'monnify'
  });
};

/**
 * Get error message from Monnify response
 * @param {Object} response - Monnify API response
 * @returns {string}
 */
const getErrorMessage = (response) => {
  return response.responseMessage || 
         response.message || 
         'Payment gateway error occurred';
};

module.exports = {
  MONNIFY_CONFIG,
  getAuthCredentials,
  getEncodedCredentials,
  getApiUrl,
  validateWebhookSignature,
  generateTransactionReference,
  buildInitializationPayload,
  parseResponse,
  mapPaymentStatus,
  getPaymentMethodName,
  isSandbox,
  logApiCall,
  getErrorMessage
};