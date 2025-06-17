// backend/src/routes/post.routes.js
const express = require('express');
const { create, getPosts, getPost, updatePost, deletePost, duplicatePost } = require('../controllers/post.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadMiddleware } = require('../middleware/upload.middleware');
const {
  validatePostCreation,
  handleValidationErrors
} = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Post CRUD
router.post('/', uploadMiddleware, validatePostCreation, handleValidationErrors, create);
router.get('/', getPosts);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/duplicate', duplicatePost);

// Post status management
router.post('/:id/publish', async (req, res) => {
  // Immediately publish a post
  try {
    const { addPostPublishJob } = require('../jobs/queue');
    await addPostPublishJob(req.params.id, new Date());
    res.json({ success: true, message: 'Post queued for publishing' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to queue post' });
  }
});

router.post('/:id/cancel', async (req, res) => {
  // Cancel a scheduled post
  try {
    const { cancelPostPublishJob } = require('../jobs/queue');
    const cancelled = await cancelPostPublishJob(req.params.id);
    if (cancelled) {
      res.json({ success: true, message: 'Post cancelled successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Scheduled post not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel post' });
  }
});

module.exports = router;