// backend/src/services/social-platforms/youtube.service.js
const { createApiClient, makeAuthenticatedRequest } = require('./base-platform.service');
const { socialApiConfig } = require('../../config/socialPlatform');

const apiClient = createApiClient(socialApiConfig.youtube.baseUrl);

const publishPost = async (accessToken, channelId, postData) => {
  try {
    const { content, mediaFiles = [], title } = postData;

    if (mediaFiles.length === 0 || !mediaFiles[0].file_type.startsWith('video/')) {
      throw new Error('YouTube posts require a video file');
    }

    const videoFile = mediaFiles[0];

    const response = await makeAuthenticatedRequest(
      apiClient,
      'POST',
      '/v3/videos?part=snippet,status',
      {
        snippet: {
          title: title || 'Untitled Video',
          description: content,
          channelId: channelId
        },
        status: {
          privacyStatus: 'public'
        }
      },
      accessToken
    );

    return {
      success: true,
      platformPostId: response.id,
      message: 'Video published successfully to YouTube'
    };
  } catch (error) {
    console.error('YouTube publish error:', error);
    throw error;
  }
};

const getAccountInfo = async (accessToken, channelId) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      `/v3/channels?part=snippet,statistics&id=${channelId}`,
      null,
      accessToken
    );

    const channel = response.items[0];

    return {
      id: channel.id,
      name: channel.snippet.title,
      username: channel.snippet.customUrl,
      avatar: channel.snippet.thumbnails.default.url,
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount
    };
  } catch (error) {
    console.error('YouTube account info error:', error);
    throw error;
  }
};

const validateAccessToken = async (accessToken) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      '/v3/channels?part=id&mine=true',
      null,
      accessToken
    );

    return { valid: true, channelId: response.items[0]?.id };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = {
  publishPost,
  getAccountInfo,
  validateAccessToken
};