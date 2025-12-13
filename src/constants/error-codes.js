/**
 * Error Code Definitions
 * Centralized error codes for consistent error handling
 */

const ERROR_CODES = {
    // Authentication Errors (1000-1999)
    AUTH_INVALID_CREDENTIALS: {
        code: 'AUTH_1001',
        message: 'Invalid email or password',
        statusCode: 401
    },
    AUTH_TOKEN_EXPIRED: {
        code: 'AUTH_1002',
        message: 'Authentication token has expired',
        statusCode: 401
    },
    AUTH_TOKEN_INVALID: {
        code: 'AUTH_1003',
        message: 'Invalid authentication token',
        statusCode: 401
    },
    AUTH_TOKEN_MISSING: {
        code: 'AUTH_1004',
        message: 'Authentication token is required',
        statusCode: 401
    },
    AUTH_REFRESH_TOKEN_INVALID: {
        code: 'AUTH_1005',
        message: 'Invalid refresh token',
        statusCode: 401
    },
    AUTH_EMAIL_NOT_VERIFIED: {
        code: 'AUTH_1006',
        message: 'Email address not verified',
        statusCode: 403
    },
    AUTH_ACCOUNT_SUSPENDED: {
        code: 'AUTH_1007',
        message: 'Account has been suspended',
        statusCode: 403
    },
    AUTH_UNAUTHORIZED: {
        code: 'AUTH_1008',
        message: 'Unauthorized access',
        statusCode: 403
    },

    // User Errors (2000-2999)
    USER_NOT_FOUND: {
        code: 'USER_2001',
        message: 'User not found',
        statusCode: 404
    },
    USER_ALREADY_EXISTS: {
        code: 'USER_2002',
        message: 'User with this email already exists',
        statusCode: 409
    },
    USER_INVALID_EMAIL: {
        code: 'USER_2003',
        message: 'Invalid email address',
        statusCode: 400
    },
    USER_WEAK_PASSWORD: {
        code: 'USER_2004',
        message: 'Password does not meet security requirements',
        statusCode: 400
    },
    USER_PROFILE_UPDATE_FAILED: {
        code: 'USER_2005',
        message: 'Failed to update user profile',
        statusCode: 500
    },

    // Payment Errors (3000-3999)
    PAYMENT_INITIALIZATION_FAILED: {
        code: 'PAYMENT_3001',
        message: 'Failed to initialize payment',
        statusCode: 500
    },
    PAYMENT_NOT_FOUND: {
        code: 'PAYMENT_3002',
        message: 'Payment record not found',
        statusCode: 404
    },
    PAYMENT_ALREADY_COMPLETED: {
        code: 'PAYMENT_3003',
        message: 'Payment has already been completed',
        statusCode: 400
    },
    PAYMENT_VERIFICATION_FAILED: {
        code: 'PAYMENT_3004',
        message: 'Payment verification failed',
        statusCode: 400
    },
    PAYMENT_INVALID_AMOUNT: {
        code: 'PAYMENT_3005',
        message: 'Invalid payment amount',
        statusCode: 400
    },
    PAYMENT_INVALID_STAGE: {
        code: 'PAYMENT_3006',
        message: 'Invalid payment stage',
        statusCode: 400
    },
    PAYMENT_STAGE_NOT_ALLOWED: {
        code: 'PAYMENT_3007',
        message: 'Payment stage not allowed at this time',
        statusCode: 400
    },
    PAYMENT_EXPIRED: {
        code: 'PAYMENT_3008',
        message: 'Payment link has expired',
        statusCode: 400
    },
    PAYMENT_CANCELLED: {
        code: 'PAYMENT_3009',
        message: 'Payment has been cancelled',
        statusCode: 400
    },
    PAYMENT_MONNIFY_ERROR: {
        code: 'PAYMENT_3010',
        message: 'Monnify payment gateway error',
        statusCode: 502
    },

    // Enrollment Errors (4000-4999)
    ENROLLMENT_NOT_FOUND: {
        code: 'ENROLLMENT_4001',
        message: 'Enrollment record not found',
        statusCode: 404
    },
    ENROLLMENT_ALREADY_EXISTS: {
        code: 'ENROLLMENT_4002',
        message: 'User already enrolled in this course',
        statusCode: 409
    },
    ENROLLMENT_INVALID_SKILL: {
        code: 'ENROLLMENT_4003',
        message: 'Invalid skill selection',
        statusCode: 400
    },
    ENROLLMENT_CREATION_FAILED: {
        code: 'ENROLLMENT_4004',
        message: 'Failed to create enrollment',
        statusCode: 500
    },

    // Validation Errors (5000-5999)
    VALIDATION_FAILED: {
        code: 'VALIDATION_5001',
        message: 'Request validation failed',
        statusCode: 400
    },
    VALIDATION_MISSING_FIELD: {
        code: 'VALIDATION_5002',
        message: 'Required field is missing',
        statusCode: 400
    },
    VALIDATION_INVALID_FORMAT: {
        code: 'VALIDATION_5003',
        message: 'Invalid data format',
        statusCode: 400
    },

    // Rate Limiting Errors (6000-6999)
    RATE_LIMIT_EXCEEDED: {
        code: 'RATE_LIMIT_6001',
        message: 'Too many requests. Please try again later',
        statusCode: 429
    },

    // Webhook Errors (7000-7999)
    WEBHOOK_INVALID_SIGNATURE: {
        code: 'WEBHOOK_7001',
        message: 'Invalid webhook signature',
        statusCode: 401
    },
    WEBHOOK_PROCESSING_FAILED: {
        code: 'WEBHOOK_7002',
        message: 'Webhook processing failed',
        statusCode: 500
    },

    // Database Errors (8000-8999)
    DATABASE_CONNECTION_FAILED: {
        code: 'DB_8001',
        message: 'Database connection failed',
        statusCode: 500
    },
    DATABASE_QUERY_FAILED: {
        code: 'DB_8002',
        message: 'Database query failed',
        statusCode: 500
    },
    DATABASE_TRANSACTION_FAILED: {
        code: 'DB_8003',
        message: 'Database transaction failed',
        statusCode: 500
    },

    // Redis Errors (9000-9999)
    REDIS_CONNECTION_FAILED: {
        code: 'REDIS_9001',
        message: 'Redis connection failed',
        statusCode: 500
    },
    REDIS_OPERATION_FAILED: {
        code: 'REDIS_9002',
        message: 'Redis operation failed',
        statusCode: 500
    },

    // General Errors (10000+)
    INTERNAL_SERVER_ERROR: {
        code: 'SERVER_10001',
        message: 'Internal server error',
        statusCode: 500
    },
    SERVICE_UNAVAILABLE: {
        code: 'SERVER_10002',
        message: 'Service temporarily unavailable',
        statusCode: 503
    },
    BAD_REQUEST: {
        code: 'SERVER_10003',
        message: 'Bad request',
        statusCode: 400
    },
    NOT_FOUND: {
        code: 'SERVER_10004',
        message: 'Resource not found',
        statusCode: 404
    },
    METHOD_NOT_ALLOWED: {
        code: 'SERVER_10005',
        message: 'Method not allowed',
        statusCode: 405
    },
    CSRF_TOKEN_INVALID: {
        code: 'SERVER_10006',
        message: 'Invalid CSRF token',
        statusCode: 403
    }
};

/**
 * Get error by code
 * @param {string} code - Error code
 * @returns {Object|null}
 */
const getErrorByCode = (code) => {
    return Object.values(ERROR_CODES).find(error => error.code === code) || null;
};

module.exports = {
    ERROR_CODES,
    getErrorByCode
};