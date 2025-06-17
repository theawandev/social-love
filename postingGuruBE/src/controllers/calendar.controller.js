// backend/src/controllers/calendar.controller.js
const { Post, PostTarget, SocialAccount, Event, sequelize } = require('../models');
const ApiResponse = require('../utils/response');

// Get calendar data for a specific month
const getCalendarData = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.id;

    if (!year || !month) {
      return res.status(400).json(ApiResponse.error('Year and month are required'));
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get posts for the month
    const posts = await Post.findAll({
      where: {
        user_id: userId,
        [sequelize.Op.or]: [
          {
            scheduled_at: {
              [sequelize.Op.between]: [startDate, endDate]
            }
          },
          {
            published_at: {
              [sequelize.Op.between]: [startDate, endDate]
            }
          }
        ]
      },
      include: [{
        model: PostTarget,
        as: 'targets',
        include: [{
          model: SocialAccount,
          as: 'socialAccount',
          attributes: ['platform', 'account_name', 'account_avatar']
        }]
      }],
      order: [['scheduled_at', 'ASC']]
    });

    // Get events for the month and user's country
    const events = await Event.findAll({
      where: {
        country_code: req.user.country_code,
        event_date: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      order: [['event_date', 'ASC']]
    });

    // Format data by date
    const calendarData = {};

    // Add posts to calendar data
    posts.forEach(post => {
      const date = post.scheduled_at || post.published_at;
      const dateKey = date.toISOString().split('T')[0];

      if (!calendarData[dateKey]) {
        calendarData[dateKey] = { posts: [], events: [] };
      }

      calendarData[dateKey].posts.push({
        id: post.id,
        title: post.title,
        content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        status: post.status,
        post_type: post.post_type,
        scheduled_at: post.scheduled_at,
        published_at: post.published_at,
        platforms: post.targets.map(target => ({
          platform: target.socialAccount.platform,
          account_name: target.socialAccount.account_name,
          status: target.status
        }))
      });
    });

    // Add events to calendar data
    events.forEach(event => {
      const dateKey = event.event_date;

      if (!calendarData[dateKey]) {
        calendarData[dateKey] = { posts: [], events: [] };
      }

      calendarData[dateKey].events.push({
        id: event.id,
        name: event.name,
        description: event.description,
        event_type: event.event_type,
        event_date: event.event_date
      });
    });

    res.json(ApiResponse.success(calendarData));
  } catch (error) {
    console.error('Get calendar data error:', error);
    res.status(500).json(ApiResponse.error('Failed to get calendar data'));
  }
};

// Get posts for a specific date
const getPostsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const posts = await Post.findAll({
      where: {
        user_id: userId,
        [sequelize.Op.or]: [
          {
            scheduled_at: {
              [sequelize.Op.between]: [startDate, endDate]
            }
          },
          {
            published_at: {
              [sequelize.Op.between]: [startDate, endDate]
            }
          }
        ]
      },
      include: [{
        model: PostTarget,
        as: 'targets',
        include: [{
          model: SocialAccount,
          as: 'socialAccount'
        }]
      }],
      order: [['scheduled_at', 'ASC']]
    });

    res.json(ApiResponse.success(posts));
  } catch (error) {
    console.error('Get posts for date error:', error);
    res.status(500).json(ApiResponse.error('Failed to get posts for date'));
  }
};

// Get events for a specific date
const getEventsForDate = async (req, res) => {
  try {
    const { date } = req.params;
    const countryCode = req.user.country_code;

    const events = await Event.findAll({
      where: {
        country_code: countryCode,
        event_date: date
      },
      order: [['name', 'ASC']]
    });

    res.json(ApiResponse.success(events));
  } catch (error) {
    console.error('Get events for date error:', error);
    res.status(500).json(ApiResponse.error('Failed to get events for date'));
  }
};

module.exports = {
  getCalendarData,
  getPostsForDate,
  getEventsForDate
};