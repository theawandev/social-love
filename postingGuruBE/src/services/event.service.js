// backend/src/services/event.service.js
const { Event, sequelize } = require('../models');

const getEventsByCountry = async (countryCode, startDate, endDate) => {
  const where = { country_code: countryCode };

  if (startDate && endDate) {
    where.event_date = {
      [sequelize.Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    where.event_date = {
      [sequelize.Op.gte]: startDate
    };
  }

  return await Event.findAll({
    where,
    order: [['event_date', 'ASC']]
  });
};

const getUpcomingEvents = async (countryCode, limit = 10) => {
  return await Event.findAll({
    where: {
      country_code: countryCode,
      event_date: {
        [sequelize.Op.gte]: new Date()
      }
    },
    order: [['event_date', 'ASC']],
    limit
  });
};

const getMonthlyEvents = async (countryCode, year, month) => {
  return await Event.findAll({
    where: {
      country_code: countryCode,
      [sequelize.Op.and]: [
        sequelize.where(sequelize.fn('EXTRACT', 'YEAR', sequelize.col('event_date')), year),
        sequelize.where(sequelize.fn('EXTRACT', 'MONTH', sequelize.col('event_date')), month)
      ]
    },
    order: [['event_date', 'ASC']]
  });
};

const createEvent = async (eventData) => {
  return await Event.create(eventData);
};

const updateEvent = async (id, updateData) => {
  const [affectedCount, affectedRows] = await Event.update(updateData, {
    where: { id },
    returning: true
  });

  return affectedRows[0];
};

const deleteEvent = async (id) => {
  return await Event.destroy({ where: { id } });
};

const searchEvents = async (countryCode, searchTerm, limit = 20) => {
  return await Event.findAll({
    where: {
      country_code: countryCode,
      [sequelize.Op.or]: [
        { name: { [sequelize.Op.iLike]: `%${searchTerm}%` } },
        { description: { [sequelize.Op.iLike]: `%${searchTerm}%` } }
      ]
    },
    order: [['event_date', 'ASC']],
    limit
  });
};

module.exports = {
  getEventsByCountry,
  getUpcomingEvents,
  getMonthlyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents
};