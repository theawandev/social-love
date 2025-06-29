const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const { maskSensitiveData } = require('../utils/helpers');

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Log error with context
  logger.error('Global error handler', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    body: maskSensitiveData(req.body, ['password', 'token', 'secret'])
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    return res.status(400).json(ApiResponse.validationError(errors));
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(400).json(ApiResponse.conflict(`${field} already exists`));
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(ApiResponse.badRequest('Invalid reference'));
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(ApiResponse.badRequest('File too large'));
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json(ApiResponse.badRequest('Too many files'));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.unauthorized('Token expired'));
  }

  // Custom business logic errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(ApiResponse.badRequest(err.message));
  }

  // Default server error
  res.status(500).json(ApiResponse.internalServerError('Internal server error'));
};

// 404 handler
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', { url: req.url, method: req.method });
  res.status(404).json(ApiResponse.notFound('API endpoint not found'));
};

module.exports = {
  errorHandler,
  notFoundHandler
};