// backend/src/services/social-platforms/facebook.service.js
const { createApiClient, makeAuthenticatedRequest } = require('./base-platform.service');
const { socialApiConfig } = require('../../config/socialPlatform');

const apiClient = createApiClient(socialApiConfig.facebook.baseUrl);

const publishPost = async (accessToken, pageId, postData) => {
  try {
    const { content, mediaFiles = [] } = postData;

    let endpoint;
    let payload = {
      message: content,
      access_token: accessToken
    };

    if (mediaFiles.length === 0) {
      // Text-only post
      endpoint = `/${pageId}/feed`;
    } else if (mediaFiles.length === 1) {
      const file = mediaFiles[0];
      if (file.file_type.startsWith('image/')) {
        // Single image post
        endpoint = `/${pageId}/photos`;
        payload.url = file.file_path;
        payload.caption = content;
        delete payload.message;
      } else if (file.file_type.startsWith('video/')) {
        // Video post
        endpoint = `/${pageId}/videos`;
        payload.source = file.file_path;
        payload.description = content;
        delete payload.message;
      }
    } else {
      // Multiple images (carousel)
      endpoint = `/${pageId}/feed`;
      // Facebook carousel implementation would go here
    }

    const response = await makeAuthenticatedRequest(apiClient, 'POST', endpoint, payload, accessToken);

    return {
      success: true,
      platformPostId: response.id,
      message: 'Post published successfully to Facebook'
    };
  } catch (error) {
    console.error('Facebook publish error:', error);
    throw error;
  }
};

const getAccountInfo = async (accessToken, pageId) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      `/${pageId}?fields=id,name,username,picture,category,fan_count`,
      null,
      accessToken
    );

    return {
      id: response.id,
      name: response.name,
      username: response.username,
      avatar: response.picture?.data?.url,
      category: response.category,
      followerCount: response.fan_count
    };
  } catch (error) {
    console.error('Facebook account info error:', error);
    throw error;
  }
};

const validateAccessToken = async (accessToken) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      '/me?fields=id,name',
      null,
      accessToken
    );

    return { valid: true, userId: response.id, userName: response.name };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const getPages = async (accessToken) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      '/me/accounts?fields=id,name,access_token,picture',
      null,
      accessToken
    );

    return response.data.map(page => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token,
      avatar: page.picture?.data?.url
    }));
  } catch (error) {
    console.error('Facebook get pages error:', error);
    throw error;
  }
};

module.exports = {
  publishPost,
  getAccountInfo,
  validateAccessToken,
  getPages
};