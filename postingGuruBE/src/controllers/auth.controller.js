// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiResponse = require('../utils/response');

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        $or: [{ username }, { email }],
        is_active: true
      }
    });

    if (existingUser) {
      return res.status(400).json(ApiResponse.error('Username or email already exists', 400));
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: password, // Will be hashed by hook
      first_name: firstName,
      last_name: lastName
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    );

    res.status(201).json(ApiResponse.success({
      user,
      token
    }, 'User registered successfully', 201));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(ApiResponse.error('Registration failed'));
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email, is_active: true }
    });

    if (!user) {
      return res.status(401).json(ApiResponse.unauthorized('Invalid credentials'));
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(ApiResponse.unauthorized('Invalid credentials'));
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    );

    res.json(ApiResponse.success({
      user,
      token
    }, 'Login successful'));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(ApiResponse.error('Login failed'));
  }
};

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
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
    console.error('Get profile error:', error);
    res.status(500).json(ApiResponse.error('Failed to get profile'));
  }
};

// Complete tour
const completeTour = async (req, res) => {
  try {
    await User.update(
      { tour_completed: true },
      { where: { id: req.user.id } }
    );
    res.json(ApiResponse.success({ tourCompleted: true }, 'Tour completed successfully'));
  } catch (error) {
    console.error('Complete tour error:', error);
    res.status(500).json(ApiResponse.error('Failed to complete tour'));
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  getProfile,
  completeTour
};

