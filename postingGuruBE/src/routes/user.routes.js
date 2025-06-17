// backend/src/routes/user.routes.js
const express = require('express');
const {
  updateProfile,
  changePassword,
  deleteAccount,
  getUserStats
} = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadMiddleware } = require('../middleware/upload.middleware');
const {
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors
} = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.put('/profile', uploadMiddleware, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/password', validatePasswordChange, handleValidationErrors, changePassword);
router.delete('/account', deleteAccount);
router.get('/stats', getUserStats);

module.exports = router;