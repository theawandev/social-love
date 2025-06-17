// backend/src/controllers/event.controller.js
const { Event, sequelize } = require('../models');
const ApiResponse = require('../utils/response');

// Get events by country and date range
const getEvents = async (req, res) => {
  try {
    const { countryCode, startDate, endDate, eventType } = req.query;

    const where = {};

    if (countryCode) {
      where.country_code = countryCode;
    }

    if (startDate && endDate) {
      where.event_date = {
        [sequelize.Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.event_date = {
        [sequelize.Op.gte]: startDate
      };
    }

    if (eventType) {
      where.event_type = eventType;
    }

    const events = await Event.findAll({
      where,
      order: [['event_date', 'ASC']]
    });

    res.json(ApiResponse.success(events));
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json(ApiResponse.error('Failed to get events'));
  }
};

// Get upcoming events for user's country
const getUpcomingEvents = async (req, res) => {
  try {
    const countryCode = req.user.country_code;
    const { limit = 10 } = req.query;

    const events = await Event.findAll({
      where: {
        country_code: countryCode,
        event_date: {
          [sequelize.Op.gte]: new Date()
        }
      },
      order: [['event_date', 'ASC']],
      limit: parseInt(limit)
    });

    res.json(ApiResponse.success(events));
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json(ApiResponse.error('Failed to get upcoming events'));
  }
};

// Get events for specific month
const getMonthlyEvents = async (req, res) => {
  try {
    const { year, month } = req.params;
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

// Add custom event (admin functionality)
const addEvent = async (req, res) => {
  try {
    const { name, description, eventDate, eventType, countryCode, isRecurring } = req.body;

    const event = await Event.create({
      name,
      description,
      event_date: eventDate,
      event_type: eventType,
      country_code: countryCode,
      is_recurring: isRecurring
    });

    res.status(201).json(ApiResponse.success(event, 'Event added successfully', 201));
  } catch (error) {
    console.error('Add event error:', error);
    res.status(500).json(ApiResponse.error('Failed to add event'));
  }
};

module.exports = {
  getEvents,
  getUpcomingEvents,
  getMonthlyEvents,
  addEvent
};