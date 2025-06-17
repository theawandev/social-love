// backend/src/models/Event.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  event_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  event_type: {
    type: DataTypes.ENUM('holiday', 'observance', 'seasonal'),
    defaultValue: 'holiday',
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'events',
  indexes: [
    {
      fields: ['country_code', 'event_date']
    }
  ],
});

module.exports = Event;