// backend/src/routes/constants.js
const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const postRoutes = require('./post.routes');
const socialAccountRoutes = require('./social-account.routes');
const dashboardRoutes = require('./dashboard.routes');
const calendarRoutes = require('./calendar.routes');
const aiRoutes = require('./ai.routes');
const uploadRoutes = require('./upload.routes');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/social-accounts', socialAccountRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/calendar', calendarRoutes);
router.use('/ai', aiRoutes);
router.use('/upload', uploadRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    message: 'Social Media Scheduler API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      socialAccounts: '/api/social-accounts',
      dashboard: '/api/dashboard',
      calendar: '/api/calendar',
      ai: '/api/ai',
      upload: '/api/upload'
    },
    documentation: 'https://docs.socialmediascheduler.com'
  });
});

module.exports = router;