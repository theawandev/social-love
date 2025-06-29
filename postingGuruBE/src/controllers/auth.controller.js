// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiResponse = require('../utils/response');
const authService = require('../services/auth.service');
const notificationService = require('../services/notification.service');
const { validateEmail, validatePassword, validateUsername } = require('../utils/validator');
const { maskSensitiveData } = require('../utils/helpers');
const logger = require('../utils/logger');

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Additional validation using utilities
    if (!validateEmail(email)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid email format'));
    }

    if (!validateUsername(username)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid username format'));
    }

    if (!validatePassword(password)) {
      return res.status(400).json(ApiResponse.badRequest('Password must be at least 6 characters with uppercase, lowercase, and number'));
    }

    // Check if user already exists
    const userExists = await authService.checkUserExists(username, email);
    if (userExists) {
      return res.status(400).json(ApiResponse.conflict('Username or email already exists'));
    }

    // Create user
    const user = await authService.createUser({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Generate JWT token
    const token = authService.generateToken(user.id, user.email);

    // Send welcome email
    await notificationService.sendWelcomeEmail(user);

    logger.info('User registered successfully', { userId: user.id, email: maskSensitiveData({ email }).email });

    res.status(201).json(ApiResponse.created({
      user,
      token
    }, 'User registered successfully'));
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json(ApiResponse.internalServerError('Registration failed'));
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json(ApiResponse.unauthorized('Invalid credentials'));
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(ApiResponse.unauthorized('Invalid credentials'));
    }

    // Generate JWT token
    const token = authService.generateToken(user.id, user.email);

    logger.info('User login successful', { userId: user.id });

    res.json(ApiResponse.success({
      user,
      token
    }, 'Login successful'));
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json(ApiResponse.internalServerError('Login failed'));
  }
};

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    // Generate JWT token
    const token = authService.generateToken(user.id, user.email);

    logger.info('Google OAuth successful', { userId: user.id });

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    logger.error('Google callback error', { error: error.message });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/error`);
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json(ApiResponse.success(user));
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    res.status(500).json(ApiResponse.internalServerError('Failed to get profile'));
  }
};

// Complete tour
const completeTour = async (req, res) => {
  try {
    await User.update(
      { tour_completed: true },
      { where: { id: req.user.id } }
    );

    logger.info('Tour completed', { userId: req.user.id });

    res.json(ApiResponse.success({ tourCompleted: true }, 'Tour completed successfully'));
  } catch (error) {
    logger.error('Complete tour error', { error: error.message });
    res.status(500).json(ApiResponse.internalServerError('Failed to complete tour'));
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  getProfile,
  completeTour
};
