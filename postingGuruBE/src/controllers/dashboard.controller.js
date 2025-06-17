// backend/src/controllers/dashboard.controller.js
const { Post, SocialAccount, Event, PostTarget, sequelize } = require('../models');
const ApiResponse = require('../utils/response');

// Get dashboard overview
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;

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
        event_date: { $gte: new Date() }
      },
      order: [['event_date', 'ASC']],
      limit: 5
    });

    res.json(ApiResponse.success({
      stats: {
        scheduledPosts: parseInt(stats?.scheduledCount) || 0,
        publishedThisMonth: parseInt(stats?.publishedThisMonth) || 0,
        draftPosts: parseInt(stats?.draftCount) || 0,
        failedPosts: parseInt(stats?.failedCount) || 0,
        connectedAccounts: socialAccounts.length
      },
      recentPosts,
      upcomingEvents,
      socialAccounts
    }));
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json(ApiResponse.error('Failed to get dashboard overview'));
  }
};

// Get monthly events
const getMonthlyEvents = async (req, res) => {
  try {
    const { year, month } = req.query;
    const countryCode = req.user.country_code;

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

    res.json(ApiResponse.success(events));
  } catch (error) {
    console.error('Get monthly events error:', error);
    res.status(500).json(ApiResponse.error('Failed to get monthly events'));
  }
};

module.exports = {
  getOverview,
  getMonthlyEvents
};