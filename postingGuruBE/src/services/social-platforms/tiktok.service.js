// backend/src/services/social-platforms/tiktok.service.js
const { createApiClient, makeAuthenticatedRequest } = require('./base-platform.service');
const { socialApiConfig } = require('../../config/socialPlatform');

const apiClient = createApiClient(socialApiConfig.tiktok.baseUrl);

const publishPost = async (accessToken, userId, postData) => {
  try {
    const { content, mediaFiles = [] } = postData;

    if (mediaFiles.length === 0 || !mediaFiles[0].file_type.startsWith('video/')) {
      throw new Error('TikTok posts require a video file');
    }

    const videoFile = mediaFiles[0];

    const response = await makeAuthenticatedRequest(
      apiClient,
      'POST',
      '/v1/video/upload/',
      {
        video_url: videoFile.file_path,
        caption: content,
        privacy_level: 'PUBLIC_TO_EVERYONE'
      },
      accessToken
    );

    return {
      success: true,
      platformPostId: response.video_id,
      message: 'Video published successfully to TikTok'
    };
  } catch (error) {
    console.error('TikTok publish error:', error);
    throw error;
  }
};

const getAccountInfo = async (accessToken, userId) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      '/v1/user/info/',
      null,
      accessToken
    );

    return {
      id: response.user_id,
      name: response.display_name,
      username: response.username,
      avatar: response.avatar_url,
      followerCount: response.follower_count,
      followingCount: response.following_count
    };
  } catch (error) {
    console.error('TikTok account info error:', error);
    throw error;
  }
};

const validateAccessToken = async (accessToken) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      '/v1/user/info/',
      null,
      accessToken
    );

    return { valid: true, userId: response.user_id, userName: response.display_name };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = {
  publishPost,
  getAccountInfo,
  validateAccessToken
};