// backend/src/services/scheduler.service.js
const { addPostPublishJob, cancelPostPublishJob } = require('../jobs/queue');
const { Post } = require('../models');
const logger = require('../utils/logger');

const schedulePost = async (postId, scheduledAt) => {
  try {
    logger.info(`Scheduling post ${postId} for ${scheduledAt.toISOString()}`);

    const job = await addPostPublishJob(postId, scheduledAt);

    logger.info(`Post ${postId} scheduled successfully with job ID: ${job.id}`);
    return job.id;
  } catch (error) {
    logger.error('Schedule post error:', { postId, scheduledAt, error: error.message });
    throw error;
  }
};

const cancelPost = async (postId) => {
  try {
    logger.info(`Cancelling scheduled post ${postId}`);

    const cancelled = await cancelPostPublishJob(postId);

    if (cancelled) {
      logger.info(`Successfully cancelled scheduled post ${postId}`);
    } else {
      logger.warn(`No scheduled job found for post ${postId}`);
    }

    return cancelled;
  } catch (error) {
    logger.error('Cancel post error:', { postId, error: error.message });
    throw error;
  }
};

const reschedulePost = async (postId, newScheduledAt) => {
  try {
    logger.info(`Rescheduling post ${postId} to ${newScheduledAt.toISOString()}`);

    // Cancel existing job
    await cancelPost(postId);

    // Schedule new job
    const jobId = await schedulePost(postId, newScheduledAt);

    logger.info(`Post ${postId} rescheduled successfully with new job ID: ${jobId}`);
    return jobId;
  } catch (error) {
    logger.error('Reschedule post error:', { postId, newScheduledAt, error: error.message });
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

    return {
      postId: post.id,
      status: post.status,
      scheduledAt: post.scheduled_at,
      publishedAt: post.published_at,
      isScheduled: post.status === 'scheduled' && post.scheduled_at,
      canReschedule: post.status === 'scheduled' || post.status === 'draft'
    };
  } catch (error) {
    logger.error('Get post schedule info error:', { postId, error: error.message });
    throw error;
  }
};

const publishPostImmediately = async (postId) => {
  try {
    logger.info(`Publishing post ${postId} immediately`);

    const job = await addPostPublishJob(postId, new Date());

    logger.info(`Post ${postId} queued for immediate publishing with job ID: ${job.id}`);
    return job.id;
  } catch (error) {
    logger.error('Publish post immediately error:', { postId, error: error.message });
    throw error;
  }
};

const bulkSchedulePosts = async (posts) => {
  try {
    logger.info(`Bulk scheduling ${posts.length} posts`);

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
        logger.error(`Failed to schedule post ${post.id}:`, error);
        results.push({
          postId: post.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info(`Bulk scheduling completed: ${successCount}/${posts.length} posts scheduled successfully`);

    return results;
  } catch (error) {
    logger.error('Bulk schedule posts error:', { error: error.message });
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

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      scheduledAt: post.scheduled_at,
      postType: post.post_type
    }));
  } catch (error) {
    logger.error('Get upcoming scheduled posts error:', { userId, error: error.message });
    throw error;
  }
};

const calculateOptimalScheduleTime = (platform, timezone = 'UTC', targetDate = null) => {
  const { getNextOptimalTime } = require('../utils/timezone');

  try {
    let optimalTime;

    if (targetDate) {
      // Calculate optimal time for specific date
      const moment = require('moment-timezone');
      const targetMoment = moment.tz(targetDate, timezone);

      // Get optimal times for the platform
      const optimalTimes = {
        facebook: [9, 13, 15], // 9 AM, 1 PM, 3 PM
        instagram: [11, 14, 17], // 11 AM, 2 PM, 5 PM
        linkedin: [8, 12, 17], // 8 AM, 12 PM, 5 PM
        tiktok: [6, 10, 19], // 6 AM, 10 AM, 7 PM
        youtube: [14, 16, 20] // 2 PM, 4 PM, 8 PM
      };

      const times = optimalTimes[platform] || optimalTimes.facebook;
      const closestHour = times.find(hour => hour > targetMoment.hour()) || times[0];

      optimalTime = targetMoment.clone().hour(closestHour).minute(0).second(0);

      // If the time is in the past, move to next day
      if (optimalTime.isBefore(moment())) {
        optimalTime.add(1, 'day');
      }

    } else {
      // Get next optimal time
      optimalTime = getNextOptimalTime(platform, timezone);
    }

    return optimalTime;
  } catch (error) {
    logger.error('Calculate optimal schedule time error:', { platform, timezone, targetDate, error: error.message });
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
  getUpcomingScheduledPosts,
  calculateOptimalScheduleTime
};



