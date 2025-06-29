const { Post, SocialAccount, Event, PostTarget, sequelize } = require('../models');
const ApiResponse = require('../utils/response');
const cache = require('../utils/cache');
const { formatNumber } = require('../utils/helpers');
const logger = require('../utils/logger');

// Get dashboard overview
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `dashboard:overview:${userId}`;

    // Get stats using Sequelize aggregation
    const stats = await Post.findOne({
      where: { user_id: userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.where(sequelize.col('status'), 'scheduled')), 'scheduledCount'],
        [sequelize.fn('COUNT', sequelize.where(
          sequelize.and(
            sequelize.where(sequelize.col('status'), 'published'),
            sequelize.where(
              sequelize.fn('DATE_TRUNC', 'month', sequelize.col('published_at')),
              sequelize.fn('DATE_TRUNC', 'month', sequelize.fn('CURRENT_DATE'))
            )
          )
        )), 'publishedThisMonth'],
        [sequelize.fn('COUNT', sequelize.where(sequelize.col('status'), 'draft')), 'draftCount'],
        [sequelize.fn('COUNT', sequelize.where(sequelize.col('status'), 'failed')), 'failedCount']
      ],
      raw: true
    });

    // Get recent posts
    const recentPosts = await Post.findAll({
      where: { user_id: userId },
      include: [{
        model: PostTarget,
        as: 'targets',
        include: [{
          model: SocialAccount,
          as: 'socialAccount',
          attributes: ['platform', 'account_name']
        }]
      }],
      order: [['updated_at', 'DESC']],
      limit: 5
    });

    // Get social accounts count
    const socialAccounts = await SocialAccount.findAll({
      where: { user_id: userId, is_active: true },
      attributes: ['id', 'platform', 'account_name', 'account_avatar', 'is_active']
    });

    // Get upcoming events for user's country
    const upcomingEvents = await Event.findAll({
      where: {
        country_code: req.user.country_code,
        event_date: { [sequelize.Op.gte]: new Date() }
      },
      order: [['event_date', 'ASC']],
      limit: 5
    });

    const dashboardData = {
      stats: {
        scheduledPosts: parseInt(stats?.scheduledCount) || 0,
        publishedThisMonth: parseInt(stats?.publishedThisMonth) || 0,
        draftPosts: parseInt(stats?.draftCount) || 0,
        failedPosts: parseInt(stats?.failedCount) || 0,
        connectedAccounts: socialAccounts.length
      },
      recentPosts,
      upcomingEvents,
      socialAccounts,
      formattedStats: {
        scheduledPosts: formatNumber(parseInt(stats?.scheduledCount) || 0),
        publishedThisMonth: formatNumber(parseInt(stats?.publishedThisMonth) || 0),
        draftPosts: formatNumber(parseInt(stats?.draftCount) || 0),
        failedPosts: formatNumber(parseInt(stats?.failedCount) || 0)
      }
    };

    // Cache the result for 5 minutes
    await cache.set(cacheKey, ApiResponse.success(dashboardData), 300);

    logger.info('Dashboard overview generated', {
      userId,
      scheduledPosts: dashboardData.stats.scheduledPosts,
      connectedAccounts: dashboardData.stats.connectedAccounts
    });

    res.json(ApiResponse.success(dashboardData));
  } catch (error) {
    logger.error('Dashboard overview error', { error: error.message, userId: req.user.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to get dashboard overview'));
  }
};

// Get monthly events
const getMonthlyEvents = async (req, res) => {
  try {
    const { year, month } = req.query;
    const countryCode = req.user.country_code;
    const cacheKey = `events:monthly:${countryCode}:${year}:${month}`;

    // Try cache first
    const cachedEvents = await cache.get(cacheKey);
    if (cachedEvents) {
      logger.info('Monthly events served from cache', { countryCode, year, month });
      return res.json(cachedEvents);
    }

    const events = await Event.findAll({
      where: {
        country_code: countryCode,
        [sequelize.Op.and]: [
          sequelize.where(sequelize.fn('EXTRACT', 'YEAR', sequelize.col('event_date')), year),
          sequelize.where(sequelize.fn('EXTRACT', 'MONTH', sequelize.col('event_date')), month)
        ]
      },
      order: [['event_date', 'ASC']]
    });

    const responseData = ApiResponse.success(events);

    // Cache for 1 day (events don't change frequently)
    await cache.set(cacheKey, responseData, 86400);

    logger.info('Monthly events generated', { countryCode, year, month, count: events.length });

    res.json(responseData);
  } catch (error) {
    logger.error('Get monthly events error', { error: error.message, query: req.query });
    res.status(500).json(ApiResponse.internalServerError('Failed to get monthly events'));
  }
};

module.exports = {
  getOverview,
  getMonthlyEvents
};