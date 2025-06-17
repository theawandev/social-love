// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiResponse = require('../utils/response');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json(ApiResponse.unauthorized('Access token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    const user = await User.findByPk(decoded.userId, {
      where: { is_active: true }
    });

    if (!user) {
      return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(ApiResponse.unauthorized('Token expired'));
    }
    return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
  }
};

// Check AI generation limits
const checkAILimits = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if reset is needed (monthly)
    const now = new Date();
    const resetDate = new Date(user.ai_reset_date);
    const monthsDiff = (now.getFullYear() - resetDate.getFullYear()) * 12 + (now.getMonth() - resetDate.getMonth());

    if (monthsDiff >= 1) {
      await User.update(
        {
          ai_generations_used: 0,
          ai_reset_date: new Date()
        },
        { where: { id: user.id } }
      );
      user.ai_generations_used = 0;
    }

    if (user.ai_generations_used >= user.ai_generations_limit) {
      return res.status(403).json(ApiResponse.forbidden('AI generation limit exceeded'));
    }

    next();
  } catch (error) {
    console.error('AI limits check error:', error);
    return res.status(500).json(ApiResponse.error('Failed to check AI limits'));
  }
};

module.exports = {
  verifyToken,
  checkAILimits
};



