const express = require('express');
const { create, getPosts, getPost, updatePost, deletePost, duplicatePost } = require('../controllers/post.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadMiddleware } = require('../middleware/upload.middleware');
const { cacheMiddleware, invalidateCache, userCacheKey, queryCacheKey } = require('../middleware/cache.middleware');
const {
  validatePostCreation,
  handleValidationErrors
} = require('../middleware/validation.middleware');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Post CRUD with caching
router.post('/',
  uploadMiddleware,
  validatePostCreation,
  handleValidationErrors,
  invalidateCache([
    userCacheKey('posts:list'),
    userCacheKey('dashboard:overview')
  ]),
  create
);

router.get('/',
  cacheMiddleware(queryCacheKey('posts:list'), 300), // 5 minutes cache
  getPosts
);

router.get('/:id',
  cacheMiddleware(req => `post:${req.params.id}:${req.user.id}`, 600), // 10 minutes cache
  getPost
);

router.put('/:id',
  invalidateCache([
    req => `post:${req.params.id}:${req.user.id}`,
    userCacheKey('posts:list'),
    userCacheKey('dashboard:overview')
  ]),
  updatePost
);

router.delete('/:id',
  invalidateCache([
    req => `post:${req.params.id}:${req.user.id}`,
    userCacheKey('posts:list'),
    userCacheKey('dashboard:overview')
  ]),
  deletePost
);

router.post('/:id/duplicate',
  invalidateCache([
    userCacheKey('posts:list'),
    userCacheKey('dashboard:overview')
  ]),
  duplicatePost
);

// Post status management
router.post('/:id/publish', async (req, res) => {
  try {
    const { addPostPublishJob } = require('../jobs/queue');
    await addPostPublishJob(req.params.id, new Date());

    logger.info('Post queued for immediate publishing', {
      postId: req.params.id,
      userId: req.user.id
    });

    res.json({ success: true, message: 'Post queued for publishing' });
  } catch (error) {
    logger.error('Failed to queue post for publishing', {
      postId: req.params.id,
      error: error.message
    });
    res.status(500).json({ success: false, message: 'Failed to queue post' });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const { cancelPostPublishJob } = require('../jobs/queue');
    const cancelled = await cancelPostPublishJob(req.params.id);

    if (cancelled) {
      logger.info('Post cancelled successfully', {
        postId: req.params.id,
        userId: req.user.id
      });
      res.json({ success: true, message: 'Post cancelled successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Scheduled post not found' });
    }
  } catch (error) {
    logger.error('Failed to cancel post', {
      postId: req.params.id,
      error: error.message
    });
    res.status(500).json({ success: false, message: 'Failed to cancel post' });
  }
});

module.exports = router;