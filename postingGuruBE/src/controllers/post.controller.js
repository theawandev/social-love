// backend/src/controllers/post.controller.js
const { Post, PostTarget, SocialAccount, MediaFile } = require('../models');
const ApiResponse = require('../utils/response');
const { POST_STATUS } = require('../utils/constants');
const schedulerService = require('../services/scheduler.service');

// Create a new post
const create = async (req, res) => {
  try {
    const { title, content, postType, scheduledAt, targetAccounts, isAiGenerated, aiPrompt } = req.body;
    const userId = req.user.id;

    // Verify target accounts belong to user
    const userAccounts = await SocialAccount.findAll({
      where: { user_id: userId, is_active: true },
      attributes: ['id']
    });

    const userAccountIds = userAccounts.map(acc => acc.id);
    const invalidAccounts = targetAccounts.filter(accountId => !userAccountIds.includes(accountId));

    if (invalidAccounts.length > 0) {
      return res.status(400).json(ApiResponse.error('Invalid target accounts'));
    }

    // Determine post status
    const status = scheduledAt ? POST_STATUS.SCHEDULED : POST_STATUS.DRAFT;

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

    res.status(201).json(ApiResponse.success(completePost, 'Post created successfully', 201));
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json(ApiResponse.error('Failed to create post'));
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
    if (startDate) where.created_at = { $gte: startDate };
    if (endDate) where.created_at = { ...where.created_at, $lte: endDate };

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

    res.json(ApiResponse.success({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    }));
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json(ApiResponse.error('Failed to get posts'));
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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

    res.json(ApiResponse.success(post));
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json(ApiResponse.error('Failed to get post'));
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const post = await Post.findOne({
      where: { id, user_id: userId }
    });

    if (!post) {
      return res.status(404).json(ApiResponse.notFound('Post not found'));
    }

    if (post.status === POST_STATUS.PUBLISHED) {
      return res.status(400).json(ApiResponse.error('Cannot update published posts'));
    }

    const updatedPost = await post.update(updateData);

    // Reschedule if scheduled time changed
    if (updateData.scheduled_at && post.scheduled_at !== updateData.scheduled_at) {
      await schedulerService.reschedulePost(id, new Date(updateData.scheduled_at));
    }

    res.json(ApiResponse.success(updatedPost, 'Post updated successfully'));
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json(ApiResponse.error('Failed to update post'));
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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

    res.json(ApiResponse.success(null, 'Post deleted successfully'));
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json(ApiResponse.error('Failed to delete post'));
  }
};

// Duplicate post
const duplicatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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

    res.status(201).json(ApiResponse.success(duplicatedPost, 'Post duplicated successfully', 201));
  } catch (error) {
    console.error('Duplicate post error:', error);
    res.status(500).json(ApiResponse.error('Failed to duplicate post'));
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