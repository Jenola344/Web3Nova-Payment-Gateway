const { createValidationError } = require('../utils/error-utils');
const { validationErrorResponse } = require('../utils/response-utils');

const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      return validationErrorResponse(res, errors);
    }
    
    req[source] = value;
    next();
  };
};

const validateBody = (schema) => validateRequest(schema, 'body');
const validateQuery = (schema) => validateRequest(schema, 'query');
const validateParams = (schema) => validateRequest(schema, 'params');

module.exports = { validateRequest, validateBody, validateQuery, validateParams };