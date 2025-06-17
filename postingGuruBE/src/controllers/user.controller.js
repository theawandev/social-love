// backend/src/controllers/user.controller.js
const { User } = require('../models');
const ApiResponse = require('../utils/response');
const fileUploadService = require('../services/file-upload.service');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, countryCode, timezone } = req.body;

    // Handle profile image upload if present
    let profileImage = req.user.profile_image;
    if (req.file) {
      profileImage = await fileUploadService.uploadProfileImage(req.file);
    }

    const updatedUser = await User.update({
      first_name: firstName,
      last_name: lastName,
      country_code: countryCode,
      timezone: timezone,
      profile_image: profileImage
    }, {
      where: { id: userId },
      returning: true
    });

    const user = updatedUser[1][0]; // Sequelize returns [affectedCount, affectedRows]

    res.json(ApiResponse.success(user, 'Profile updated successfully'));
  }
  catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(ApiResponse.error('Failed to update profile'));
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
      return res.status(400).json(ApiResponse.error('Current password is incorrect'));
    }

    // Update password (will be hashed by hook)
    await user.update({ password_hash: newPassword });

    res.json(ApiResponse.success(null, 'Password changed successfully'));
  }
  catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(ApiResponse.error('Failed to change password'));
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
        return res.status(400).json(ApiResponse.error('Password is incorrect'));
      }
    }

    // Soft delete user
    await user.update({ is_active: false });

    res.json(ApiResponse.success(null, 'Account deleted successfully'));
  }
  catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json(ApiResponse.error('Failed to delete account'));
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
  }
  catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json(ApiResponse.error('Failed to get user statistics'));
  }
};

module.exports = {
  updateProfile,
  changePassword,
  deleteAccount,
  getUserStats
};