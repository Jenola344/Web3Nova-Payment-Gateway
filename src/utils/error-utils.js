/**
 * Custom Error Classes
 * Extended error classes for different error types
 */

class AppError extends Error {
    constructor(message, statusCode, code = null, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message, code = 'AUTH_ERROR') {
        super(message, 401, code);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_ERROR');
    }
}

class PaymentError extends AppError {
    constructor(message, code = 'PAYMENT_ERROR') {
        super(message, 400, code);
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500, 'DATABASE_ERROR', false);
        this.originalError = originalError;
    }
}

class ExternalServiceError extends AppError {
    constructor(service, message, originalError = null) {
        super(`${service} service error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', false);
        this.service = service;
        this.originalError = originalError;
    }
}

/**
 * Create error from error code object
 * @param {Object} errorCode - Error code object from constants
 * @param {Object} additionalData - Additional error data
 * @returns {AppError}
 */
const createErrorFromCode = (errorCode, additionalData = {}) => {
    const error = new AppError(
        errorCode.message,
        errorCode.statusCode,
        errorCode.code
    );
    
    Object.assign(error, additionalData);
    return error;
};

/**
 * Check if error is operational
 * @param {Error} error - Error object
 * @returns {boolean}
 */
const isOperationalError = (error) => {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
};

/**
 * Format error for API response
 * @param {Error} error - Error object
 * @param {boolean} includeStack - Include stack trace
 * @returns {Object}
 */
const formatErrorResponse = (error, includeStack = false) => {
    const response = {
        success: false,
        error: {
        message: error.message || 'An error occurred',
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: error.timestamp || new Date().toISOString()
        }
    };
    
    // Add validation errors if present
    if (error.errors) {
        response.error.errors = error.errors;
    }
    
    // Add additional fields if present
    if (error.field) {
        response.error.field = error.field;
    }
    
    // Include stack trace in development
    if (includeStack && error.stack) {
        response.error.stack = error.stack;
    }
    
    return response;
};

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @param {Object} logger - Logger instance
 */
const logError = (error, context = {}, logger = console) => {
    const logData = {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        ...context
    };
    
    if (error.isOperational) {
        logger.warn('Operational error:', logData);
    } else {
        logger.error('Unexpected error:', logData);
    }
};

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function to wrap
 * @returns {Function}
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Create validation error from Joi/validation result
 * @param {Object} validationResult - Validation result object
 * @returns {ValidationError}
 */
const createValidationError = (validationResult) => {
    const errors = validationResult.details?.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
    })) || [];
    
    return new ValidationError('Validation failed', errors);
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    PaymentError,
    DatabaseError,
    ExternalServiceError,
    createErrorFromCode,
    isOperationalError,
    formatErrorResponse,
    logError,
    asyncHandler,
    createValidationError
};