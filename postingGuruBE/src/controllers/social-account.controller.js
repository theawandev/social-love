// backend/src/controllers/social-account.controller.js
const { SocialAccount, PostTarget } = require('../models');
const ApiResponse = require('../utils/response');
const { PLATFORMS } = require('../utils/constants');

// Get user's social accounts
const getSocialAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform } = req.query;

    const where = { user_id: userId, is_active: true };
    if (platform) where.platform = platform;

    const accounts = await SocialAccount.findAll({
      where,
      attributes: { exclude: ['access_token', 'refresh_token'] },
      order: [['created_at', 'DESC']]
    });

    res.json(ApiResponse.success(accounts));
  } catch (error) {
    console.error('Get social accounts error:', error);
    res.status(500).json(ApiResponse.error('Failed to get social accounts'));
  }
};

// Add social account
const addSocialAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      platform,
      accountName,
      accountId,
      accountUsername,
      accountAvatar,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      accountType
    } = req.body;

    const account = await SocialAccount.create({
      user_id: userId,
      platform,
      account_name: accountName,
      account_id: accountId,
      account_username: accountUsername,
      account_avatar: accountAvatar,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt,
      account_type: accountType
    });

    // Remove sensitive data from response
    const { access_token, refresh_token, ...accountData } = account.toJSON();

    res.status(201).json(ApiResponse.success(accountData, 'Social account added successfully', 201));
  } catch (error) {
    console.error('Add social account error:', error);
    res.status(500).json(ApiResponse.error('Failed to add social account'));
  }
};

// Remove social account
const removeSocialAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { deleteScheduledPosts } = req.body;

    const account = await SocialAccount.findOne({
      where: { id, user_id: userId }
    });

    if (!account) {
      return res.status(404).json(ApiResponse.notFound('Social account not found'));
    }

    // Handle scheduled posts
    if (deleteScheduledPosts) {
      // Delete posts that only target this account
      await sequelize.transaction(async (t) => {
        // Find posts that only have this account as target
        const postsToDelete = await Post.findAll({
          include: [{
            model: PostTarget,
            as: 'targets',
            where: { social_account_id: id }
          }],
          transaction: t
        });

        for (const post of postsToDelete) {
          const targetCount = await PostTarget.count({
            where: { post_id: post.id },
            transaction: t
          });

          if (targetCount === 1) {
            // Only one target (this account), delete the post
            await post.destroy({ transaction: t });
          } else {
            // Multiple targets, just remove this target
            await PostTarget.destroy({
              where: { post_id: post.id, social_account_id: id },
              transaction: t
            });
          }
        }

        // Deactivate the account
        await account.update({ is_active: false }, { transaction: t });
      });
    } else {
      // Just deactivate the account
      await account.update({ is_active: false });
    }

    res.json(ApiResponse.success(null, 'Social account removed successfully'));
  } catch (error) {
    console.error('Remove social account error:', error);
    res.status(500).json(ApiResponse.error('Failed to remove social account'));
  }
};

// Update social account
const updateSocialAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const account = await SocialAccount.findOne({
      where: { id, user_id: userId }
    });

    if (!account) {
      return res.status(404).json(ApiResponse.notFound('Social account not found'));
    }

    const updatedAccount = await account.update(updateData);

    // Remove sensitive data from response
    const { access_token, refresh_token, ...accountData } = updatedAccount.toJSON();

    res.json(ApiResponse.success(accountData, 'Social account updated successfully'));
  } catch (error) {
    console.error('Update social account error:', error);
    res.status(500).json(ApiResponse.error('Failed to update social account'));
  }
};

module.exports = {
  getSocialAccounts,
  addSocialAccount,
  removeSocialAccount,
  updateSocialAccount
};