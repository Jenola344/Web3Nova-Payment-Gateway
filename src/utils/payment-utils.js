/**
 * Payment Utilities
 * Payment calculation and formatting functions
 */

const {
  COURSE_PRICES,
  SCHOLARSHIP_DISCOUNTS,
  PAYMENT_STAGE_PERCENTAGES,
  DEFAULT_CURRENCY
} = require('../constants/payment-constants');

/**
 * Calculate course price with scholarship
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @returns {number} Final price
 */
const calculateCoursePrice = (skill, scholarshipType) => {
  const basePrice = COURSE_PRICES[skill] || 0;
  const discount = SCHOLARSHIP_DISCOUNTS[scholarshipType] || 0;
  
  return Math.round(basePrice * (1 - discount / 100));
};

/**
 * Calculate payment stage amount
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @param {number} stage - Payment stage
 * @returns {number} Stage amount
 */
const calculateStageAmount = (skill, scholarshipType, stage) => {
  const finalPrice = calculateCoursePrice(skill, scholarshipType);
  const stagePercentage = PAYMENT_STAGE_PERCENTAGES[stage] || 0;
  
  return Math.round(finalPrice * (stagePercentage / 100));
};

/**
 * Calculate total paid amount
 * @param {Array} payments - Array of completed payments
 * @returns {number} Total amount paid
 */
const calculateTotalPaid = (payments) => {
  return payments
    .filter(payment => payment.status === 'completed')
    .reduce((total, payment) => total + parseFloat(payment.amount), 0);
};

/**
 * Calculate remaining balance
 * @param {number} totalAmount - Total course amount
 * @param {number} paidAmount - Amount already paid
 * @returns {number} Remaining balance
 */
const calculateRemainingBalance = (totalAmount, paidAmount) => {
  return Math.max(0, totalAmount - paidAmount);
};

/**
 * Format amount with currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
const formatAmount = (amount, currency = DEFAULT_CURRENCY) => {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format amount without currency symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
const formatAmountPlain = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Generate payment reference
 * @param {string} userId - User ID
 * @param {number} stage - Payment stage
 * @returns {string} Payment reference
 */
const generatePaymentReference = (userId, stage) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `WEB3NOVA-${userId.substring(0, 8).toUpperCase()}-${stage}-${timestamp}-${random}`;
};

/**
 * Validate payment amount
 * @param {number} amount - Amount to validate
 * @param {number} expectedAmount - Expected amount
 * @param {number} tolerance - Tolerance percentage (default: 1%)
 * @returns {boolean}
 */
const validatePaymentAmount = (amount, expectedAmount, tolerance = 1) => {
  const minAmount = expectedAmount * (1 - tolerance / 100);
  const maxAmount = expectedAmount * (1 + tolerance / 100);
  
  return amount >= minAmount && amount <= maxAmount;
};

/**
 * Calculate payment percentage completed
 * @param {number} paidAmount - Amount paid
 * @param {number} totalAmount - Total amount
 * @returns {number} Percentage (0-100)
 */
const calculatePaymentPercentage = (paidAmount, totalAmount) => {
  if (totalAmount === 0) return 0;
  
  return Math.min(100, Math.round((paidAmount / totalAmount) * 100));
};

/**
 * Get next payment stage info
 * @param {Array} completedStages - Array of completed stage numbers
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @returns {Object|null} Next payment info or null
 */
const getNextPaymentInfo = (completedStages, skill, scholarshipType) => {
  const allStages = Object.keys(PAYMENT_STAGE_PERCENTAGES).map(Number).sort();
  
  const nextStage = allStages.find(stage => !completedStages.includes(stage));
  
  if (!nextStage) {
    return null;
  }
  
  return {
    stage: nextStage,
    amount: calculateStageAmount(skill, scholarshipType, nextStage),
    percentage: PAYMENT_STAGE_PERCENTAGES[nextStage],
    description: `Stage ${nextStage} Payment (${PAYMENT_STAGE_PERCENTAGES[nextStage]}%)`
  };
};

/**
 * Parse amount from string
 * @param {string} amountString - Amount string
 * @returns {number} Parsed amount
 */
const parseAmount = (amountString) => {
  const cleaned = amountString.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Calculate transaction fee
 * @param {number} amount - Transaction amount
 * @param {string} paymentMethod - Payment method
 * @returns {number} Transaction fee
 */
const calculateTransactionFee = (amount, paymentMethod) => {
  // Monnify fee structure
  const feeRates = {
    card: 0.015, // 1.5%
    bank_transfer: 0.01, // 1%
    ussd: 0.01, // 1%
    account_transfer: 0.01 // 1%
  };
  
  const rate = feeRates[paymentMethod] || 0.015;
  const fee = amount * rate;
  const cappedFee = Math.min(fee, 2000); // Cap at NGN 2000
  
  return Math.round(cappedFee);
};

/**
 * Calculate amount after fee
 * @param {number} amount - Original amount
 * @param {string} paymentMethod - Payment method
 * @returns {Object} Amount breakdown
 */
const calculateAmountWithFee = (amount, paymentMethod) => {
  const fee = calculateTransactionFee(amount, paymentMethod);
  
  return {
    originalAmount: amount,
    fee: fee,
    totalAmount: amount + fee,
    amountAfterFee: amount
  };
};

/**
 * Validate payment status transition
 * @param {string} currentStatus - Current payment status
 * @param {string} newStatus - New payment status
 * @returns {boolean}
 */
const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    pending: ['processing', 'completed', 'failed', 'cancelled', 'expired'],
    processing: ['completed', 'failed'],
    completed: ['refunded'],
    failed: ['pending'],
    cancelled: [],
    expired: ['pending'],
    refunded: []
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Generate payment breakdown
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @returns {Object} Payment breakdown
 */
const generatePaymentBreakdown = (skill, scholarshipType) => {
  const basePrice = COURSE_PRICES[skill] || 0;
  const discount = SCHOLARSHIP_DISCOUNTS[scholarshipType] || 0;
  const finalPrice = calculateCoursePrice(skill, scholarshipType);
  
  const stages = Object.keys(PAYMENT_STAGE_PERCENTAGES).map(Number).sort();
  
  const stageBreakdown = stages.map(stage => ({
    stage,
    percentage: PAYMENT_STAGE_PERCENTAGES[stage],
    amount: calculateStageAmount(skill, scholarshipType, stage),
    description: `Stage ${stage} - ${PAYMENT_STAGE_PERCENTAGES[stage]}%`
  }));
  
  return {
    skill,
    basePrice,
    scholarshipType,
    discountPercentage: discount,
    discountAmount: basePrice - finalPrice,
    finalPrice,
    stages: stageBreakdown
  };
};

module.exports = {
  calculateCoursePrice,
  calculateStageAmount,
  calculateTotalPaid,
  calculateRemainingBalance,
  formatAmount,
  formatAmountPlain,
  generatePaymentReference,
  validatePaymentAmount,
  calculatePaymentPercentage,
  getNextPaymentInfo,
  parseAmount,
  calculateTransactionFee,
  calculateAmountWithFee,
  isValidStatusTransition,
  generatePaymentBreakdown
};