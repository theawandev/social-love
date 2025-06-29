const { User } = require('../models');
const ApiResponse = require('../utils/response');
const fileUploadService = require('../services/file-upload.service');
const { validateCountryCode, validateTimezone, sanitizeString } = require('../utils/validator');
const { formatFileSize, maskSensitiveData } = require('../utils/helpers');
const logger = require('../utils/logger');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, countryCode, timezone } = req.body;

    // Validate input using utilities
    if (countryCode && !validateCountryCode(countryCode)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid country code'));
    }

    if (timezone && !validateTimezone(timezone)) {
      return res.status(400).json(ApiResponse.badRequest('Invalid timezone'));
    }

    // Sanitize strings
    const sanitizedFirstName = sanitizeString(firstName);
    const sanitizedLastName = sanitizeString(lastName);

    // Handle profile image upload if present
    let profileImage = req.user.profile_image;
    if (req.file) {
      profileImage = await fileUploadService.uploadProfileImage(req.file);
      logger.info('Profile image uploaded', {
        userId,
        fileSize: formatFileSize(req.file.size),
        fileName: req.file.filename
      });
    }

    const [affectedCount, updatedUsers] = await User.update({
      first_name: sanitizedFirstName,
      last_name: sanitizedLastName,
      country_code: countryCode,
      timezone: timezone,
      profile_image: profileImage
    }, {
      where: { id: userId },
      returning: true
    });

    const user = updatedUsers[0];

    logger.info('Profile updated successfully', {
      userId,
      changes: maskSensitiveData({ firstName, lastName, countryCode, timezone })
    });

    res.json(ApiResponse.success(user, 'Profile updated successfully'));
  } catch (error) {
    logger.error('Update profile error', { error: error.message, userId: req.user.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to update profile'));
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);

    // Verify current password
    const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(ApiResponse.badRequest('Current password is incorrect'));
    }

    // Update password (will be hashed by hook)
    await user.update({ password_hash: newPassword });

    logger.info('Password changed successfully', { userId });

    res.json(ApiResponse.success(null, 'Password changed successfully'));
  } catch (error) {
    logger.error('Change password error', { error: error.message, userId: req.user.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to change password'));
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmPassword } = req.body;

    const user = await User.findByPk(userId);

    // Verify password before deletion
    if (user.password_hash) {
      const isPasswordValid = await user.verifyPassword(confirmPassword);
      if (!isPasswordValid) {
        return res.status(400).json(ApiResponse.badRequest('Password is incorrect'));
      }
    }

    // Soft delete user
    await user.update({ is_active: false });

    logger.info('Account deleted successfully', { userId });

    res.json(ApiResponse.success(null, 'Account deleted successfully'));
  } catch (error) {
    logger.error('Delete account error', { error: error.message, userId: req.user.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to delete account'));
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // This would typically involve complex queries
    // For now, return basic stats
    const stats = {
      accountCreated: req.user.created_at,
      totalPosts: 0, // Would query Post model
      totalAccounts: 0, // Would query SocialAccount model
      aiGenerationsUsed: req.user.ai_generations_used,
      subscriptionTier: req.user.subscription_tier
    };

    res.json(ApiResponse.success(stats));
  } catch (error) {
    logger.error('Get user stats error', { error: error.message, userId: req.user.id });
    res.status(500).json(ApiResponse.internalServerError('Failed to get user statistics'));
  }
};

module.exports = {
  updateProfile,
  changePassword,
  deleteAccount,
  getUserStats
};