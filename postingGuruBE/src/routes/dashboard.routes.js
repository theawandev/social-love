const express = require('express');
const { getOverview, getMonthlyEvents } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateCalendarQuery, handleValidationErrors } = require('../middleware/validation.middleware');
const cache = require('../utils/cache');
const logger = require('../utils/logger');
const { getQueueStats } = require('../jobs/queue');
const { generatePerformanceReport } = require('../utils/analytics');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Dashboard overview with caching
router.get('/overview', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `dashboard:overview:${userId}`;

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      logger.info('Dashboard overview served from cache', { userId });
      return res.json(cachedData);
    }

    // Continue to controller if not cached
    next();
  } catch (error) {
    logger.error('Dashboard cache error', { error: error.message });
    next(); // Continue without cache
  }
}, getOverview);

router.get('/events', validateCalendarQuery, handleValidationErrors, getMonthlyEvents);

// Queue statistics (for admin/debugging)
router.get('/queue-stats', async (req, res) => {
  try {
    const { getQueueStats } = require('../jobs/queue');
    const stats = await getQueueStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Queue stats error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get queue stats' });
  }
});

// Analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    const { generatePerformanceReport } = require('../utils/analytics');
    const { period = '30d' } = req.query;

    // This would typically fetch posts from database
    // For now, return mock data
    const report = generatePerformanceReport([], period);

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Analytics error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to generate analytics' });
  }
});

module.exports = router;