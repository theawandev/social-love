// backend/src/models/Post.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 10000],
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'published', 'failed'),
    defaultValue: 'draft',
  },
  post_type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'carousel', 'reel', 'short'),
    allowNull: false,
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isAfter: new Date().toISOString(),
    },
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_ai_generated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ai_prompt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'posts',
});

module.exports = Post;