/**
 * User Validators
 * Request validation schemas for user endpoints
 */

const Joi = require('joi');

/**
 * Update profile schema
 */
const updateProfileSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name cannot exceed 255 characters'
    }),
  
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

/**
 * Get user by ID schema
 */
const getUserSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
});

/**
 * List users schema (query params)
 */
const listUsersSchema = Joi.object({
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
  
  role: Joi.string()
    .valid('student', 'admin', 'super_admin')
    .optional(),
  
  isActive: Joi.boolean()
    .optional(),
  
  search: Joi.string()
    .max(255)
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
  updateProfileSchema,
  getUserSchema,
  listUsersSchema,
  validate
};