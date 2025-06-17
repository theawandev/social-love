// backend/src/routes/auth.routes.js
const express = require('express');
const passport = require('passport');
const { register, login, googleCallback, getProfile, completeTour } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors
} = require('../middleware/validation.middleware');

const router = express.Router();

// Local authentication
router.post('/register', validateUserRegistration, handleValidationErrors, register);
router.post('/login', validateUserLogin, handleValidationErrors, login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallback
);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.post('/complete-tour', verifyToken, completeTour);

// Logout (client-side handles token removal)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;