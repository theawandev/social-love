// backend/src/middleware/error.middleware.js
const ApiResponse = require('../utils/response');

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    return res.status(400).json(ApiResponse.validationError(errors));
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json(ApiResponse.error('Duplicate entry', 400));
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(ApiResponse.error('Invalid reference', 400));
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(ApiResponse.error('File too large', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(ApiResponse.error('Too many files', 400));
    }
    return res.status(400).json(ApiResponse.error(err.message, 400));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.unauthorized('Token expired'));
  }

  // Default server error
  res.status(500).json(ApiResponse.error('Internal server error'));
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json(ApiResponse.notFound('API endpoint not found'));
};

module.exports = {
  errorHandler,
  notFoundHandler
};