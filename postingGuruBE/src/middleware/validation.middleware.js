// backend/src/middleware/validation.middleware.js
const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');
const { PLATFORMS, POST_TYPES } = require('../utils/constants');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(ApiResponse.validationError(errors.array()));
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Post creation validation
const validatePostCreation = [
  body('title')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Title must be less than 500 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10000 characters'),
  body('postType')
    .isIn(Object.values(POST_TYPES))
    .withMessage('Invalid post type'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  body('targetAccounts')
    .isArray({ min: 1 })
    .withMessage('At least one target account is required'),
  body('targetAccounts.*')
    .isUUID()
    .withMessage('Each target account must be a valid UUID')
];

// Social account validation
const validateSocialAccount = [
  body('platform')
    .isIn(Object.values(PLATFORMS))
    .withMessage('Invalid platform'),
  body('accountName')
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ max: 255 })
    .withMessage('Account name must be less than 255 characters'),
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required'),
  body('accessToken')
    .notEmpty()
    .withMessage('Access token is required')
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('countryCode')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters'),
  body('timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone must be between 1 and 50 characters')
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Event validation
const validateEvent = [
  body('name')
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ max: 255 })
    .withMessage('Event name must be less than 255 characters'),
  body('eventDate')
    .isISO8601()
    .withMessage('Event date must be a valid date'),
  body('eventType')
    .optional()
    .isIn(['holiday', 'observance', 'seasonal'])
    .withMessage('Invalid event type'),
  body('countryCode')
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters')
];

// Calendar query validation
const validateCalendarQuery = [
  query('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  query('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12')
];

// AI generation validation
const validateAIGeneration = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt must be between 10 and 500 characters'),
  body('platform')
    .optional()
    .isIn(Object.values(PLATFORMS))
    .withMessage('Invalid platform'),
  body('postType')
    .optional()
    .isIn(Object.values(POST_TYPES))
    .withMessage('Invalid post type')
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePostCreation,
  validateSocialAccount,
  validateProfileUpdate,
  validatePasswordChange,
  validateEvent,
  validateCalendarQuery,
  validateAIGeneration
};







