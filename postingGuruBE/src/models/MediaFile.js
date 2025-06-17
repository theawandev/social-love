// backend/src/models/MediaFile.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MediaFile = sequelize.define('MediaFile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  thumbnail_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'media_files',
  timestamps: true,
  updatedAt: false, // Only need createdAt for files
});

module.exports = MediaFile;