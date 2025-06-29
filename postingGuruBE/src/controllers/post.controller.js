const { Post, PostTarget, SocialAccount, MediaFile, sequelize } = require('../models');
const ApiResponse = require('../utils/response');
const { POST_STATUS, PLATFORMS } = require('../utils/constants');
const schedulerService = require('../services/scheduler.service');
const { validatePostContent, validateUUID } = require('../utils/validator');
const { truncateText, extractHashtags, extractMentions, calculateReadingTime } = require('../utils/helpers');
const logger = require('../utils/logger');

// Create a new post
const create = async (req, res) => {
  try {
    const { title, content, postType, scheduledAt, targetAccounts, isAiGenerated, aiPrompt } = req.body;
    const userId = req.user.id;

    // Validate content using utility
    if (!validatePostContent(content)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid post content'));
    }

    // Validate target accounts
    for (const accountId of targetAccounts) {
      if (!validateUUID(accountId)) {
        return res.status(400).json(ApiResponse.badRequest('Invalid account ID format'));
      }
    }

    // Verify target accounts belong to user
    const userAccounts = await SocialAccount.findAll({
      where: { user_id: userId, is_active: true },
      attributes: ['id']
    });

    const userAccountIds = userAccounts.map(acc => acc.id);
    const invalidAccounts = targetAccounts.filter(accountId => !userAccountIds.includes(accountId));

    if (invalidAccounts.length > 0) {
      return res.status(400).json(ApiResponse.badRequest('Invalid target accounts'));
    }

    // Determine post status
    const status = scheduledAt ? POST_STATUS.SCHEDULED : POST_STATUS.DRAFT;

    // Extract additional metadata using utilities
    const hashtags = extractHashtags(content);
    const mentions = extractMentions(content);
    const readingTime = calculateReadingTime(content);
    const truncatedContent = truncateText(content, 100);

    // Create post with transaction
    const result = await sequelize.transaction(async (t) => {
      // Create post
      const post = await Post.create({
        user_id: userId,
        title,
        content,
        post_type: postType,
        scheduled_at: scheduledAt,
        status,
        is_ai_generated: isAiGenerated,
        ai_prompt: aiPrompt
      }, { transaction: t });

      // Create post targets
      const targets = targetAccounts.map(accountId => ({
        post_id: post.id,
        social_account_id: accountId
      }));
      await PostTarget.bulkCreate(targets, { transaction: t });

      // Create media files if any
      if (req.files && req.files.length > 0) {
        const mediaFiles = req.files.map((file, index) => ({
          post_id: post.id,
          file_name: file.filename,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
          file_order: index
        }));
        await MediaFile.bulkCreate(mediaFiles, { transaction: t });
      }

      return post;
    });

    // Schedule job if needed
    if (status === POST_STATUS.SCHEDULED) {
      await schedulerService.schedulePost(result.id, new Date(scheduledAt));
    }

    // Fetch complete post data
    const completePost = await Post.findByPk(result.id, {
      include: [
        {
          model: PostTarget,
          as: 'targets',
          include: [{
            model: SocialAccount,
            as: 'socialAccount',
            attributes: ['platform', 'account_name', 'account_avatar']
          }]
        },
        {
          model: MediaFile,
          as: 'mediaFiles',
          order: [['file_order', 'ASC']]
        }
      ]
    });

    logger.info('Post created successfully', {
      postId: result.id,
      userId,
      status,
      hashtags: hashtags.length,
      mentions: mentions.length,
      readingTime
    });

    res.status(201).json(ApiResponse.created(completePost, 'Post created successfully'));
  } catch (error) {
    logger.error('Create post error', { error: error.message, userId: req.user.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to create post'));
  }
};

// Get user's posts with filters
const getPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, platform, page = 1, limit = 20, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;
    const where = { user_id: userId };

    if (status) where.status = status;
    if (startDate) where.created_at = { [sequelize.Op.gte]: startDate };
    if (endDate) where.created_at = { ...where.created_at, [sequelize.Op.lte]: endDate };

    const include = [
      {
        model: PostTarget,
        as: 'targets',
        include: [{
          model: SocialAccount,
          as: 'socialAccount',
          attributes: ['platform', 'account_name', 'account_avatar'],
          where: platform ? { platform } : undefined
        }]
      }
    ];

    const posts = await Post.findAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    // Add metadata to posts using utilities
    const postsWithMetadata = posts.map(post => {
      const postData = post.toJSON();
      postData.hashtags = extractHashtags(postData.content);
      postData.mentions = extractMentions(postData.content);
      postData.readingTime = calculateReadingTime(postData.content);
      postData.truncatedContent = truncateText(postData.content, 100);
      return postData;
    });

    const hasMore = posts.length === parseInt(limit);

    res.json(ApiResponse.success({
      posts: postsWithMetadata,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore
      }
    }));
  } catch (error) {
    logger.error('Get posts error', { error: error.message, userId: req.user.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to get posts'));
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!validateUUID(id)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid post ID format'));
    }

    const post = await Post.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: PostTarget,
          as: 'targets',
          include: [{
            model: SocialAccount,
            as: 'socialAccount'
          }]
        },
        {
          model: MediaFile,
          as: 'mediaFiles',
          order: [['file_order', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json(ApiResponse.notFound('Post not found'));
    }

    // Add metadata using utilities
    const postData = post.toJSON();
    postData.hashtags = extractHashtags(postData.content);
    postData.mentions = extractMentions(postData.content);
    postData.readingTime = calculateReadingTime(postData.content);

    res.json(ApiResponse.success(postData));
  } catch (error) {
    logger.error('Get post error', { error: error.message, postId: req.params.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to get post'));
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    if (!validateUUID(id)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid post ID format'));
    }

    // Validate content if being updated
    if (updateData.content && !validatePostContent(updateData.content)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid post content'));
    }

    const post = await Post.findOne({
      where: { id, user_id: userId }
    });

    if (!post) {
      return res.status(404).json(ApiResponse.notFound('Post not found'));
    }

    if (post.status === POST_STATUS.PUBLISHED) {
      return res.status(400).json(ApiResponse.badRequest('Cannot update published posts'));
    }

    const updatedPost = await post.update(updateData);

    // Reschedule if scheduled time changed
    if (updateData.scheduled_at && post.scheduled_at !== updateData.scheduled_at) {
      await schedulerService.reschedulePost(id, new Date(updateData.scheduled_at));
    }

    logger.info('Post updated successfully', { postId: id, userId });

    res.json(ApiResponse.success(updatedPost, 'Post updated successfully'));
  } catch (error) {
    logger.error('Update post error', { error: error.message, postId: req.params.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to update post'));
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!validateUUID(id)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid post ID format'));
    }

    const post = await Post.findOne({
      where: { id, user_id: userId }
    });

    if (!post) {
      return res.status(404).json(ApiResponse.notFound('Post not found'));
    }

    // Cancel scheduled job if exists
    if (post.status === POST_STATUS.SCHEDULED) {
      await schedulerService.cancelPost(id);
    }

    await post.destroy();

    logger.info('Post deleted successfully', { postId: id, userId });

    res.json(ApiResponse.success(null, 'Post deleted successfully'));
  } catch (error) {
    logger.error('Delete post error', { error: error.message, postId: req.params.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to delete post'));
  }
};

// Duplicate post
const duplicatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!validateUUID(id)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid post ID format'));
    }

    const originalPost = await Post.findOne({
      where: { id, user_id: userId },
      include: [
        { model: PostTarget, as: 'targets' },
        { model: MediaFile, as: 'mediaFiles' }
      ]
    });

    if (!originalPost) {
      return res.status(404).json(ApiResponse.notFound('Post not found'));
    }

    // Create duplicate
    const duplicatedPost = await Post.create({
      user_id: userId,
      title: `Copy of ${originalPost.title}`,
      content: originalPost.content,
      post_type: originalPost.post_type,
      status: 'draft'
    });

    // Duplicate targets
    if (originalPost.targets.length > 0) {
      const targetData = originalPost.targets.map(target => ({
        post_id: duplicatedPost.id,
        social_account_id: target.social_account_id
      }));
      await PostTarget.bulkCreate(targetData);
    }

    logger.info('Post duplicated successfully', { originalPostId: id, newPostId: duplicatedPost.id, userId });

    res.status(201).json(ApiResponse.created(duplicatedPost, 'Post duplicated successfully'));
  } catch (error) {
    logger.error('Duplicate post error', { error: error.message, postId: req.params.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to duplicate post'));
  }
};

module.exports = {
  create,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  duplicatePost
};