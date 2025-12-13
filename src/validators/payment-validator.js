/**
 * Payment Validators
 * Request validation schemas for payment endpoints
 */

const Joi = require('joi');
const { COURSE_SKILLS, PAYMENT_STAGES } = require('../constants/payment-constants');

/**
 * Initialize payment schema
 */
const initializePaymentSchema = Joi.object({
  enrollmentId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid enrollment ID format',
      'any.required': 'Enrollment ID is required'
    }),
  
  stage: Joi.number()
    .valid(...Object.values(PAYMENT_STAGES))
    .required()
    .messages({
      'any.only': 'Invalid payment stage',
      'any.required': 'Payment stage is required'
    }),
  
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
  
  customerName: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'any.required': 'Customer name is required'
    }),
  
  customerEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Customer email is required'
    }),
  
  customerPhone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Customer phone number is required'
    })
});

/**
 * Verify payment schema
 */
const verifyPaymentSchema = Joi.object({
  paymentReference: Joi.string()
    .required()
    .messages({
      'any.required': 'Payment reference is required'
    })
});

/**
 * Get payment schema
 */
const getPaymentSchema = Joi.object({
  paymentId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid payment ID format',
      'any.required': 'Payment ID is required'
    })
});

/**
 * List payments schema (query params)
 */
const listPaymentsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional(),
  
  status: Joi.string()
    .valid('pending', 'processing', 'completed', 'failed', 'cancelled', 'expired')
    .optional(),
  
  stage: Joi.number()
    .valid(...Object.values(PAYMENT_STAGES))
    .optional(),
  
  startDate: Joi.date()
    .iso()
    .optional(),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.min': 'End date must be after start date'
    })
});

/**
 * Update payment status schema (admin only)
 */
const updatePaymentStatusSchema = Joi.object({
  paymentId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid payment ID format',
      'any.required': 'Payment ID is required'
    }),
  
  status: Joi.string()
    .valid('completed', 'failed', 'cancelled', 'refunded')
    .required()
    .messages({
      'any.only': 'Invalid payment status',
      'any.required': 'Payment status is required'
    }),
  
  reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    })
});

/**
 * Create enrollment schema
 */
const createEnrollmentSchema = Joi.object({
  skill: Joi.string()
    .valid(...Object.values(COURSE_SKILLS))
    .required()
    .messages({
      'any.only': 'Invalid course skill',
      'any.required': 'Course skill is required'
    }),
  
  classLocation: Joi.string()
    .valid('Online', 'Physical', 'Hybrid')
    .required()
    .messages({
      'any.only': 'Invalid class location',
      'any.required': 'Class location is required'
    }),
  
  scholarshipType: Joi.string()
    .valid('full', 'half', 'none')
    .default('none')
    .optional()
});

/**
 * Validate request data
 * @param {Object} schema - Joi schema
 * @param {Object} data - Data to validate
 * @returns {Object}
 */
const validate = (schema, data) => {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  initializePaymentSchema,
  verifyPaymentSchema,
  getPaymentSchema,
  listPaymentsSchema,
  updatePaymentStatusSchema,
  createEnrollmentSchema,
  validate
};