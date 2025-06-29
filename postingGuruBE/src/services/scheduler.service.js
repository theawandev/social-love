const { addPostPublishJob, cancelPostPublishJob } = require('../jobs/queue');
const { Post } = require('../models');
const logger = require('../utils/logger');
const { formatDateForDisplay } = require('../utils/timezone');
const { retry } = require('../utils/helpers');

const schedulePost = async (postId, scheduledAt) => {
  try {
    const formattedDate = formatDateForDisplay(scheduledAt);
    logger.info('Scheduling post', { postId, scheduledAt: formattedDate });

    // Use retry utility for robustness
    const job = await retry(async () => {
      return await addPostPublishJob(postId, scheduledAt);
    }, 3, 1000);

    logger.info('Post scheduled successfully', { postId, jobId: job.id, scheduledAt: formattedDate });
    return job.id;
  } catch (error) {
    logger.error('Schedule post error', {
      postId,
      scheduledAt: scheduledAt?.toISOString(),
      error: error.message
    });
    throw error;
  }
};

const cancelPost = async (postId) => {
  try {
    logger.info('Cancelling scheduled post', { postId });

    const cancelled = await cancelPostPublishJob(postId);

    if (cancelled) {
      logger.info('Successfully cancelled scheduled post', { postId });
    } else {
      logger.warn('No scheduled job found for post', { postId });
    }

    return cancelled;
  } catch (error) {
    logger.error('Cancel post error', { postId, error: error.message });
    throw error;
  }
};

const reschedulePost = async (postId, newScheduledAt) => {
  try {
    const formattedDate = formatDateForDisplay(newScheduledAt);
    logger.info('Rescheduling post', { postId, newScheduledAt: formattedDate });

    // Cancel existing job
    await cancelPost(postId);

    // Schedule new job
    const jobId = await schedulePost(postId, newScheduledAt);

    logger.info('Post rescheduled successfully', { postId, newJobId: jobId, newScheduledAt: formattedDate });
    return jobId;
  } catch (error) {
    logger.error('Reschedule post error', {
      postId,
      newScheduledAt: newScheduledAt?.toISOString(),
      error: error.message
    });
    throw error;
  }
};

const getPostScheduleInfo = async (postId) => {
  try {
    const post = await Post.findByPk(postId, {
      attributes: ['id', 'status', 'scheduled_at', 'published_at']
    });

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    const scheduleInfo = {
      postId: post.id,
      status: post.status,
      scheduledAt: post.scheduled_at,
      publishedAt: post.published_at,
      isScheduled: post.status === 'scheduled' && post.scheduled_at,
      canReschedule: post.status === 'scheduled' || post.status === 'draft',
      formattedScheduledAt: post.scheduled_at ? formatDateForDisplay(post.scheduled_at) : null,
      formattedPublishedAt: post.published_at ? formatDateForDisplay(post.published_at) : null
    };

    logger.info('Retrieved post schedule info', { postId, status: post.status });

    return scheduleInfo;
  } catch (error) {
    logger.error('Get post schedule info error', { postId, error: error.message });
    throw error;
  }
};

const publishPostImmediately = async (postId) => {
  try {
    logger.info('Publishing post immediately', { postId });

    const job = await addPostPublishJob(postId, new Date());

    logger.info('Post queued for immediate publishing', { postId, jobId: job.id });
    return job.id;
  } catch (error) {
    logger.error('Publish post immediately error', { postId, error: error.message });
    throw error;
  }
};

const bulkSchedulePosts = async (posts) => {
  try {
    logger.info('Bulk scheduling posts', { count: posts.length });

    const results = [];

    for (const post of posts) {
      try {
        const jobId = await schedulePost(post.id, new Date(post.scheduledAt));
        results.push({
          postId: post.id,
          success: true,
          jobId
        });
      } catch (error) {
        logger.error('Failed to schedule post in bulk', { postId: post.id, error: error.message });
        results.push({
          postId: post.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info('Bulk scheduling completed', {
      total: posts.length,
      successful: successCount,
      failed: posts.length - successCount
    });

    return results;
  } catch (error) {
    logger.error('Bulk schedule posts error', { error: error.message });
    throw error;
  }
};

const getUpcomingScheduledPosts = async (userId, limit = 10) => {
  try {
    const posts = await Post.findAll({
      where: {
        user_id: userId,
        status: 'scheduled',
        scheduled_at: {
          [require('sequelize').Op.gte]: new Date()
        }
      },
      order: [['scheduled_at', 'ASC']],
      limit,
      attributes: ['id', 'title', 'content', 'scheduled_at', 'post_type']
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: truncateText(post.content, 100),
      scheduledAt: post.scheduled_at,
      formattedScheduledAt: formatDateForDisplay(post.scheduled_at),
      postType: post.post_type
    }));

    logger.info('Retrieved upcoming scheduled posts', { userId, count: formattedPosts.length });

    return formattedPosts;
  } catch (error) {
    logger.error('Get upcoming scheduled posts error', { userId, error: error.message });
    throw error;
  }
};

module.exports = {
  schedulePost,
  cancelPost,
  reschedulePost,
  getPostScheduleInfo,
  publishPostImmediately,
  bulkSchedulePosts,
  getUpcomingScheduledPosts
};