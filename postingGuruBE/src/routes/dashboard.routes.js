// backend/src/routes/dashboard.routes.js
const express = require('express');
const { getOverview, getMonthlyEvents } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateCalendarQuery, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/overview', getOverview);
router.get('/events', validateCalendarQuery, handleValidationErrors, getMonthlyEvents);

// Queue statistics (for admin/debugging)
router.get('/queue-stats', async (req, res) => {
  try {
    const { getQueueStats } = require('../jobs/queue');
    const stats = await getQueueStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get queue stats' });
  }
});

module.exports = router;