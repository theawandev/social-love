// backend/src/models/PostTarget.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostTarget = sequelize.define('PostTarget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  platform_post_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'published', 'failed'),
    defaultValue: 'pending',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'post_targets',
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'social_account_id']
    }
  ],
});

module.exports = PostTarget;