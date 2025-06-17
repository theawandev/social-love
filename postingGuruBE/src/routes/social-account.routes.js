// backend/src/routes/social-account.routes.js
const express = require('express');
const {
  getSocialAccounts,
  addSocialAccount,
  removeSocialAccount,
  updateSocialAccount
} = require('../controllers/social-account.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  validateSocialAccount,
  handleValidationErrors
} = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/', getSocialAccounts);
router.post('/', validateSocialAccount, handleValidationErrors, addSocialAccount);
router.put('/:id', updateSocialAccount);
router.delete('/:id', removeSocialAccount);

module.exports = router;