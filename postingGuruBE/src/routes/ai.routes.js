// backend/src/routes/ai.routes.js
const express = require('express');
const {
  generateTextContent,
  generateImageContent,
  getUsageStats
} = require('../controllers/ai.controller');
const { verifyToken, checkAILimits } = require('../middleware/auth.middleware');
const { body, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Validation for text generation
const validateTextGeneration = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt must be between 10 and 500 characters'),
  body('platform')
    .optional()
    .isIn(['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'])
    .withMessage('Invalid platform'),
  body('postType')
    .optional()
    .isIn(['text', 'image', 'video', 'carousel', 'reel', 'short'])
    .withMessage('Invalid post type')
];

// Validation for image generation
const validateImageGeneration = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt must be between 10 and 500 characters'),
  body('style')
    .optional()
    .isIn(['realistic', 'artistic', 'cartoon', 'abstract'])
    .withMessage('Invalid style'),
  body('size')
    .optional()
    .isIn(['512x512', '1024x1024', '1024x1792', '1792x1024'])
    .withMessage('Invalid size')
];

router.post('/generate/text', checkAILimits, validateTextGeneration, handleValidationErrors, generateTextContent);
router.post('/generate/image', checkAILimits, validateImageGeneration, handleValidationErrors, generateImageContent);
router.get('/usage', getUsageStats);

module.exports = router;