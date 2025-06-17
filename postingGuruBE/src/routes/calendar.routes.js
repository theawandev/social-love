// backend/src/routes/calendar.routes.js
const express = require('express');
const {
  getCalendarData,
  getPostsForDate,
  getEventsForDate
} = require('../controllers/calendar.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get('/data', getCalendarData);
router.get('/posts/:date', getPostsForDate);
router.get('/events/:date', getEventsForDate);

module.exports = router;