/**
 * Payment Constants
 * All payment-related constants and configurations
 */

const PAYMENT_STAGES = {
    STAGE_1: 1,
    STAGE_2: 2,
    STAGE_3: 3
};

const PAYMENT_STAGE_PERCENTAGES = {
    [PAYMENT_STAGES.STAGE_1]: 40,
    [PAYMENT_STAGES.STAGE_2]: 40,
    [PAYMENT_STAGES.STAGE_3]: 20
};

const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    REFUNDED: 'refunded'
};

const PAYMENT_METHODS = {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    USSD: 'ussd',
    ACCOUNT_TRANSFER: 'account_transfer'
};

const TRANSACTION_TYPES = {
    PAYMENT: 'payment',
    REFUND: 'refund',
    REVERSAL: 'reversal',
    CHARGEBACK: 'chargeback'
};

const TRANSACTION_STATUS = {
    INITIATED: 'initiated',
    PENDING: 'pending',
    SUCCESSFUL: 'successful',
    FAILED: 'failed',
    REVERSED: 'reversed'
};

const SCHOLARSHIP_TYPES = {
    FULL: 'full',
    HALF: 'half',
    NONE: 'none'
};

const COURSE_SKILLS = {
    SMART_CONTRACT: 'Smart Contract',
    FRONTEND_DEVELOPMENT: 'Web Development',
    UI_UX_DESIGN: 'UI/UX Design',
    BACKEND_DEVELOPMENT: 'Backend Development'
};

const CLASS_LOCATIONS = {
    ONLINE: 'Online',
    PHYSICAL: 'Physical',
};

const PAYMENT_EXPIRY_DAYS = 7; // Days before payment link expires

const PAYMENT_CURRENCY = {
    NGN: 'NGN',
    USD: 'USD'
};

const DEFAULT_CURRENCY = PAYMENT_CURRENCY.NGN;

// Course pricing (in NGN)
const COURSE_PRICES = {
    [COURSE_SKILLS.SMART_CONTRACT]: 100000,
    [COURSE_SKILLS.WEB_DEVELOPMENT]: 100000,
    [COURSE_SKILLS.UI_UX_DESIGN]: 100000,
    [COURSE_SKILLS.FRONTEND_SMART_CONTRACT]: 100000
};

// Scholarship discounts (percentage)
const SCHOLARSHIP_DISCOUNTS = {
    [SCHOLARSHIP_TYPES.FULL]: 100,
    [SCHOLARSHIP_TYPES.HALF]: 50,
    [SCHOLARSHIP_TYPES.NONE]: 0
};

const WEBHOOK_EVENTS = {
    PAYMENT_SUCCESSFUL: 'payment.successful',
    PAYMENT_FAILED: 'payment.failed',
    PAYMENT_PENDING: 'payment.pending',
    REFUND_PROCESSED: 'refund.processed',
    TRANSFER_COMPLETE: 'transfer.complete'
};

const NOTIFICATION_TYPES = {
    PAYMENT_INITIATED: 'payment_initiated',
    PAYMENT_SUCCESSFUL: 'payment_successful',
    PAYMENT_FAILED: 'payment_failed',
    PAYMENT_REMINDER: 'payment_reminder',
    ENROLLMENT_CONFIRMED: 'enrollment_confirmed',
    RECEIPT_GENERATED: 'receipt_generated'
};

const PAYMENT_REMINDER_SCHEDULE = {
    FIRST_REMINDER: 14, // Days after pending payment
    SECOND_REMINDER: 5,
    FINAL_REMINDER: 6
};

/**
 * Calculate payment amount for a specific stage
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @param {number} stage - Payment stage
 * @returns {number} Amount in currency
 */
const calculateStageAmount = (skill, scholarshipType, stage) => {
    const basePrice = COURSE_PRICES[skill] || 0;
    const discount = SCHOLARSHIP_DISCOUNTS[scholarshipType] || 0;
    const discountedPrice = basePrice * (1 - discount / 100);
    const stagePercentage = PAYMENT_STAGE_PERCENTAGES[stage] || 0;
    
    return Math.round(discountedPrice * (stagePercentage / 100));
};

/**
 * Calculate total payable amount after scholarship
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @returns {number} Total amount
 */
const calculateTotalAmount = (skill, scholarshipType) => {
    const basePrice = COURSE_PRICES[skill] || 0;
    const discount = SCHOLARSHIP_DISCOUNTS[scholarshipType] || 0;
    
    return Math.round(basePrice * (1 - discount / 100));
};

/**
 * Get next payment stage
 * @param {number} currentStage - Current payment stage
 * @returns {number|null} Next stage or null if complete
 */
const getNextStage = (currentStage) => {
    const stages = Object.values(PAYMENT_STAGES).sort();
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
        return null;
    }
    
    return stages[currentIndex + 1];
};

/**
 * Check if payment stage is valid
 * @param {number} stage - Payment stage
 * @returns {boolean}
 */
const isValidStage = (stage) => {
    return Object.values(PAYMENT_STAGES).includes(stage);
};

/**
 * Check if payment status is final
 * @param {string} status - Payment status
 * @returns {boolean}
 */
const isFinalStatus = (status) => {
    return [
        PAYMENT_STATUS.COMPLETED,
        PAYMENT_STATUS.FAILED,
        PAYMENT_STATUS.CANCELLED,
        PAYMENT_STATUS.EXPIRED,
        PAYMENT_STATUS.REFUNDED
    ].includes(status);
};

/**
 * Get payment stage description
 * @param {number} stage - Payment stage
 * @returns {string}
 */
const getStageDescription = (stage) => {
    const descriptions = {
        [PAYMENT_STAGES.STAGE_1]: 'First Installment (20%)',
        [PAYMENT_STAGES.STAGE_2]: 'Second Installment (20%)',
        [PAYMENT_STAGES.STAGE_3]: 'Final Installment (10%)'
    };
    
    return descriptions[stage] || 'Unknown Stage';
};

module.exports = {
    PAYMENT_STAGES,
    PAYMENT_STAGE_PERCENTAGES,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    TRANSACTION_TYPES,
    TRANSACTION_STATUS,
    SCHOLARSHIP_TYPES,
    COURSE_SKILLS,
    CLASS_LOCATIONS,
    PAYMENT_EXPIRY_DAYS,
    PAYMENT_CURRENCY,
    DEFAULT_CURRENCY,
    COURSE_PRICES,
    SCHOLARSHIP_DISCOUNTS,
    WEBHOOK_EVENTS,
    NOTIFICATION_TYPES,
    PAYMENT_REMINDER_SCHEDULE,
    calculateStageAmount,
    calculateTotalAmount,
    getNextStage,
    isValidStage,
    isFinalStatus,
    getStageDescription
};