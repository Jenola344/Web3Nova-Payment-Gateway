/**
 * Response Utilities
 * Standardized API response formatting
 */

/**
 * Success response structure
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object}
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Error response structure
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Object} errors - Detailed errors
 * @returns {Object}
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, code = null, errors = null) => {
  const response = {
    success: false,
    error: {
      message,
      timestamp: new Date().toISOString()
    }
  };
  
  if (code) {
    response.error.code = code;
  }
  
  if (errors) {
    response.error.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object}
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 * @returns {Object}
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination metadata
 * @returns {Object}
 */
const paginatedResponse = (res, data, pagination) => {
  const response = {
    success: true,
    message: 'Data retrieved successfully',
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
    },
    timestamp: new Date().toISOString()
  };
  
  return res.status(200).json(response);
};

/**
 * Bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} errors - Validation errors
 * @returns {Object}
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return errorResponse(res, message, 400, 'BAD_REQUEST', errors);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object}
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object}
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403, 'FORBIDDEN');
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object}
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404, 'NOT_FOUND');
};

/**
 * Conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object}
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409, 'CONFLICT');
};

/**
 * Rate limit response (429)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object}
 */
const rateLimitResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429, 'RATE_LIMIT_EXCEEDED');
};

/**
 * Internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object}
 */
const internalServerErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500, 'INTERNAL_SERVER_ERROR');
};

/**
 * Service unavailable response (503)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object}
 */
const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return errorResponse(res, message, 503, 'SERVICE_UNAVAILABLE');
};

/**
 * File download response
 * @param {Object} res - Express response object
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 * @returns {Object}
 */
const fileDownloadResponse = (res, fileBuffer, filename, mimeType = 'application/pdf') => {
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', fileBuffer.length);
  
  return res.send(fileBuffer);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @returns {Object}
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
};

/**
 * Custom response with metadata
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Object} metadata - Additional metadata
 * @param {string} message - Success message
 * @returns {Object}
 */
const customResponse = (res, data, metadata = {}, message = 'Success') => {
  const response = {
    success: true,
    message,
    data,
    metadata,
    timestamp: new Date().toISOString()
  };
  
  return res.status(200).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  rateLimitResponse,
  internalServerErrorResponse,
  serviceUnavailableResponse,
  fileDownloadResponse,
  validationErrorResponse,
  customResponse
};