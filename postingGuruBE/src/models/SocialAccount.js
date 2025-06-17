// backend/src/models/SocialAccount.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SocialAccount = sequelize.define('SocialAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  platform: {
    type: DataTypes.ENUM('facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'),
    allowNull: false,
  },
  account_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  account_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  account_username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  account_avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  access_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  account_type: {
    type: DataTypes.ENUM('personal', 'business', 'page'),
    defaultValue: 'personal',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'social_accounts',
  indexes: [
    {
      unique: true,
      fields: ['platform', 'account_id', 'user_id']
    }
  ],
});

module.exports = SocialAccount;