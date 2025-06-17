// backend/src/utils/response.js
const { HTTP_STATUS_CODES, ERROR_MESSAGES } = require('./constants');

/**
 * Standardized API response utility
 * Provides consistent response format across the application
 */

const createResponse = (success, message, data = null, statusCode = 200, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (errors !== null) {
    response.errors = errors;
  }

  response.statusCode = statusCode;

  return response;
};

// Success responses
const success = (data = null, message = 'Success', statusCode = HTTP_STATUS_CODES.OK) => {
  return createResponse(true, message, data, statusCode);
};

const created = (data = null, message = 'Created successfully') => {
  return createResponse(true, message, data, HTTP_STATUS_CODES.CREATED);
};

const noContent = (message = 'No content') => {
  return createResponse(true, message, null, HTTP_STATUS_CODES.NO_CONTENT);
};

// Error responses
const error = (message = ERROR_MESSAGES.INTERNAL_ERROR, statusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, errors = null) => {
  return createResponse(false, message, null, statusCode, errors);
};

const badRequest = (message = ERROR_MESSAGES.VALIDATION_FAILED, errors = null) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.BAD_REQUEST, errors);
};

const unauthorized = (message = ERROR_MESSAGES.UNAUTHORIZED) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.UNAUTHORIZED);
};

const forbidden = (message = ERROR_MESSAGES.FORBIDDEN) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.FORBIDDEN);
};

const notFound = (message = ERROR_MESSAGES.NOT_FOUND) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.NOT_FOUND);
};

const conflict = (message = ERROR_MESSAGES.CONFLICT) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.CONFLICT);
};

const unprocessableEntity = (message = ERROR_MESSAGES.VALIDATION_FAILED, errors = null) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, errors);
};

const tooManyRequests = (message = ERROR_MESSAGES.RATE_LIMITED) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.TOO_MANY_REQUESTS);
};

const internalServerError = (message = ERROR_MESSAGES.INTERNAL_ERROR) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
};

// Validation error response (for express-validator)
const validationError = (errors, message = ERROR_MESSAGES.VALIDATION_FAILED) => {
  const formattedErrors = Array.isArray(errors)
    ? errors.map(err => ({
      field: err.param || err.path || 'unknown',
      message: err.msg || err.message || 'Invalid value',
      value: err.value
    }))
    : errors;

  return createResponse(false, message, null, HTTP_STATUS_CODES.BAD_REQUEST, formattedErrors);
};

// Pagination response wrapper
const paginated = (data, pagination, message = 'Success') => {
  return createResponse(true, message, {
    items: data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 20)),
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false
    }
  });
};

// API response for file uploads
const fileUploadSuccess = (files, message = 'Files uploaded successfully') => {
  const fileData = Array.isArray(files) ? files : [files];

  return createResponse(true, message, {
    files: fileData.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date().toISOString()
    }))
  }, HTTP_STATUS_CODES.CREATED);
};

// API response for async operations
const accepted = (data = null, message = 'Request accepted for processing') => {
  return createResponse(true, message, data, 202);
};

// Custom error response for specific business logic
const businessLogicError = (code, message, details = null) => {
  return createResponse(false, message, null, HTTP_STATUS_CODES.BAD_REQUEST, {
    code,
    details
  });
};

// API rate limit response
const rateLimitError = (retryAfter = null) => {
  const response = createResponse(
    false,
    ERROR_MESSAGES.RATE_LIMITED,
    null,
    HTTP_STATUS_CODES.TOO_MANY_REQUESTS
  );

  if (retryAfter) {
    response.retryAfter = retryAfter;
  }

  return response;
};

// Service unavailable response
const serviceUnavailable = (message = 'Service temporarily unavailable') => {
  return createResponse(false, message, null, 503);
};

// Helper function to send response with proper status code
const sendResponse = (res, responseObj) => {
  return res.status(responseObj.statusCode).json(responseObj);
};

// Middleware wrapper for consistent error handling
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  // Core response creators
  success,
  created,
  noContent,
  error,

  // HTTP status specific responses
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessableEntity,
  tooManyRequests,
  internalServerError,

  // Specialized responses
  validationError,
  paginated,
  fileUploadSuccess,
  accepted,
  businessLogicError,
  rateLimitError,
  serviceUnavailable,

  // Utilities
  sendResponse,
  asyncHandler,
  createResponse
};