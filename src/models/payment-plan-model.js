/**
 * Payment Plan Model
 * Database operations for payment plans (if extended functionality is needed)
 * Currently uses constants, but can be database-driven in the future
 */

const {
  COURSE_PRICES,
  SCHOLARSHIP_DISCOUNTS,
  PAYMENT_STAGE_PERCENTAGES
} = require('../constants/payment-constants');

/**
 * Get payment plan for enrollment
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @returns {Object}
 */
const getPaymentPlan = (skill, scholarshipType) => {
  const basePrice = COURSE_PRICES[skill] || 0;
  const discount = SCHOLARSHIP_DISCOUNTS[scholarshipType] || 0;
  const finalPrice = basePrice * (1 - discount / 100);
  
  const stages = Object.keys(PAYMENT_STAGE_PERCENTAGES).map(stage => {
    const stageNum = parseInt(stage, 10);
    const percentage = PAYMENT_STAGE_PERCENTAGES[stageNum];
    const amount = Math.round(finalPrice * (percentage / 100));
    
    return {
      stage: stageNum,
      percentage,
      amount,
      description: `Stage ${stageNum} - ${percentage}%`
    };
  });
  
  return {
    skill,
    basePrice,
    scholarshipType,
    discount,
    finalPrice,
    stages
  };
};

/**
 * Calculate total amount for stages
 * @param {string} skill - Course skill
 * @param {string} scholarshipType - Scholarship type
 * @param {Array<number>} stages - Array of stage numbers
 * @returns {number}
 */
const calculateStagesTotal = (skill, scholarshipType, stages) => {
  const plan = getPaymentPlan(skill, scholarshipType);
  
  return stages.reduce((total, stageNum) => {
    const stage = plan.stages.find(s => s.stage === stageNum);
    return total + (stage ? stage.amount : 0);
  }, 0);
};

module.exports = {
  getPaymentPlan,
  calculateStagesTotal
};