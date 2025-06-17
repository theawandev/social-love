// backend/src/models/constants.js
const { sequelize } = require('../config/database');
const User = require('./User');
const SocialAccount = require('./SocialAccount');
const Post = require('./Post');
const PostTarget = require('./PostTarget');
const MediaFile = require('./MediaFile');
const Event = require('./Event');

// Define associations
User.hasMany(SocialAccount, {
  foreignKey: 'user_id',
  as: 'socialAccounts',
  onDelete: 'CASCADE',
});
SocialAccount.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Post, {
  foreignKey: 'user_id',
  as: 'posts',
  onDelete: 'CASCADE',
});
Post.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Post.hasMany(PostTarget, {
  foreignKey: 'post_id',
  as: 'targets',
  onDelete: 'CASCADE',
});
PostTarget.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post',
});

SocialAccount.hasMany(PostTarget, {
  foreignKey: 'social_account_id',
  as: 'postTargets',
  onDelete: 'CASCADE',
});
PostTarget.belongsTo(SocialAccount, {
  foreignKey: 'social_account_id',
  as: 'socialAccount',
});

Post.hasMany(MediaFile, {
  foreignKey: 'post_id',
  as: 'mediaFiles',
  onDelete: 'CASCADE',
});
MediaFile.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post',
});

module.exports = {
  sequelize,
  User,
  SocialAccount,
  Post,
  PostTarget,
  MediaFile,
  Event,
};

// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true, // null for Google OAuth users
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  country_code: {
    type: DataTypes.STRING(2),
    defaultValue: 'US',
    validate: {
      len: [2, 2],
    },
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'GMT',
  },
  subscription_tier: {
    type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
    defaultValue: 'free',
  },
  ai_generations_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  ai_generations_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 0,
    },
  },
  ai_reset_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tour_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash') && user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
  },
});

// Instance methods
User.prototype.verifyPassword = async function(password) {
  if (!this.password_hash) return false;
  return bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

User.prototype.incrementAIUsage = async function() {
  await this.increment('ai_generations_used');
  return this.reload();
};

User.prototype.resetAIUsage = async function() {
  await this.update({
    ai_generations_used: 0,
    ai_reset_date: new Date()
  });
  return this;
};

User.prototype.canUseAI = function() {
  return this.ai_generations_used < this.ai_generations_limit;
};

module.exports = User;

// backend/src/models/SocialAccount.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SocialAccount = sequelize.define('SocialAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  platform: {
    type: DataTypes.ENUM('facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'),
    allowNull: false,
  },
  account_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255],
    },
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
    },
    {
      fields: ['user_id', 'is_active']
    },
    {
      fields: ['platform']
    }
  ],
});

// Instance methods
SocialAccount.prototype.isTokenExpired = function() {
  if (!this.token_expires_at) return false;
  return new Date() >= this.token_expires_at;
};

SocialAccount.prototype.updateTokens = async function(accessToken, refreshToken, expiresAt) {
  return await this.update({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_expires_at: expiresAt
  });
};

SocialAccount.prototype.deactivate = async function() {
  return await this.update({ is_active: false });
};

module.exports = SocialAccount;

// backend/src/models/Post.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
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
    type: DataTypes.ENUM('draft', 'scheduled', 'published', 'failed', 'partially_published'),
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
      isAfterNow(value) {
        if (value && new Date(value) <= new Date()) {
          throw new Error('Scheduled time must be in the future');
        }
      }
    }
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
  indexes: [
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['scheduled_at']
    },
    {
      fields: ['created_at']
    }
  ],
});

// Instance methods
Post.prototype.canEdit = function() {
  return ['draft', 'scheduled'].includes(this.status);
};

Post.prototype.canDelete = function() {
  return this.status !== 'published';
};

Post.prototype.isScheduled = function() {
  return this.status === 'scheduled' && this.scheduled_at;
};

Post.prototype.isOverdue = function() {
  return this.isScheduled() && new Date() > this.scheduled_at;
};

Post.prototype.markAsPublished = async function() {
  return await this.update({
    status: 'published',
    published_at: new Date()
  });
};

Post.prototype.markAsFailed = async function(errorMessage = null) {
  return await this.update({
    status: 'failed',
    error_message: errorMessage
  });
};

module.exports = Post;

// backend/src/models/PostTarget.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostTarget = sequelize.define('PostTarget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  social_account_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'social_accounts',
      key: 'id'
    },
    onDelete: 'CASCADE',
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
    },
    {
      fields: ['status']
    }
  ],
});

// Instance methods
PostTarget.prototype.markAsPublished = async function(platformPostId) {
  return await this.update({
    status: 'published',
    platform_post_id: platformPostId,
    published_at: new Date(),
    error_message: null
  });
};

PostTarget.prototype.markAsFailed = async function(errorMessage) {
  return await this.update({
    status: 'failed',
    error_message: errorMessage,
    published_at: null
  });
};

module.exports = PostTarget;

// backend/src/models/MediaFile.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MediaFile = sequelize.define('MediaFile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE',
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
    validate: {
      min: 0,
    },
  },
  file_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  thumbnail_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'media_files',
  timestamps: true,
  updatedAt: false, // Only need createdAt for files
  indexes: [
    {
      fields: ['post_id', 'file_order']
    }
  ],
});

// Instance methods
MediaFile.prototype.isImage = function() {
  return this.file_type.startsWith('image/');
};

MediaFile.prototype.isVideo = function() {
  return this.file_type.startsWith('video/');
};

MediaFile.prototype.getPublicUrl = function() {
  return `/uploads/${this.file_name}`;
};

MediaFile.prototype.getThumbnailUrl = function() {
  return this.thumbnail_path ? `/uploads/thumbnails/${this.file_name}` : null;
};

module.exports = MediaFile;

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
    validate: {
      len: [1, 255],
    },
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
    validate: {
      len: [2, 2],
    },
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
    },
    {
      fields: ['event_date']
    },
    {
      fields: ['event_type']
    }
  ],
});

// Instance methods
Event.prototype.isPast = function() {
  return new Date(this.event_date) < new Date();
};

Event.prototype.isToday = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.event_date === today;
};

Event.prototype.isUpcoming = function() {
  return new Date(this.event_date) > new Date();
};

Event.prototype.daysUntil = function() {
  const today = new Date();
  const eventDate = new Date(this.event_date);
  const diffTime = eventDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = Event;