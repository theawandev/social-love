// backend/src/services/social-platforms/instagram.service.js
const { createApiClient, makeAuthenticatedRequest } = require('./base-platform.service');
const { socialApiConfig } = require('../../config/socialPlatform');

const apiClient = createApiClient(socialApiConfig.instagram.baseUrl);

const publishPost = async (accessToken, instagramAccountId, postData) => {
  try {
    const { content, mediaFiles = [], postType } = postData;

    if (mediaFiles.length === 0) {
      throw new Error('Instagram posts require at least one media file');
    }

    let mediaObjectId;

    if (postType === 'reel' || postType === 'video') {
      // Video/Reel post
      mediaObjectId = await createVideoMedia(accessToken, instagramAccountId, mediaFiles[0], content);
    } else if (mediaFiles.length === 1) {
      // Single image post
      mediaObjectId = await createImageMedia(accessToken, instagramAccountId, mediaFiles[0], content);
    } else {
      // Carousel post
      mediaObjectId = await createCarouselMedia(accessToken, instagramAccountId, mediaFiles, content);
    }

    // Publish the media
    const response = await makeAuthenticatedRequest(
      apiClient,
      'POST',
      `/${instagramAccountId}/media_publish`,
      { creation_id: mediaObjectId },
      accessToken
    );

    return {
      success: true,
      platformPostId: response.id,
      message: 'Post published successfully to Instagram'
    };
  } catch (error) {
    console.error('Instagram publish error:', error);
    throw error;
  }
};

const createImageMedia = async (accessToken, instagramAccountId, mediaFile, caption) => {
  const response = await makeAuthenticatedRequest(
    apiClient,
    'POST',
    `/${instagramAccountId}/media`,
    {
      image_url: mediaFile.file_path,
      caption: caption
    },
    accessToken
  );

  return response.id;
};

const createVideoMedia = async (accessToken, instagramAccountId, mediaFile, caption) => {
  const response = await makeAuthenticatedRequest(
    apiClient,
    'POST',
    `/${instagramAccountId}/media`,
    {
      video_url: mediaFile.file_path,
      caption: caption,
      media_type: 'VIDEO'
    },
    accessToken
  );

  return response.id;
};

const createCarouselMedia = async (accessToken, instagramAccountId, mediaFiles, caption) => {
  // Create individual media items first
  const childrenIds = [];

  for (const file of mediaFiles) {
    const childResponse = await makeAuthenticatedRequest(
      apiClient,
      'POST',
      `/${instagramAccountId}/media`,
      {
        image_url: file.file_path,
        is_carousel_item: true
      },
      accessToken
    );
    childrenIds.push(childResponse.id);
  }

  // Create carousel container
  const carouselResponse = await makeAuthenticatedRequest(
    apiClient,
    'POST',
    `/${instagramAccountId}/media`,
    {
      media_type: 'CAROUSEL',
      children: childrenIds.join(','),
      caption: caption
    },
    accessToken
  );

  return carouselResponse.id;
};

const getAccountInfo = async (accessToken, instagramAccountId) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      `/${instagramAccountId}?fields=id,username,account_type,media_count,followers_count,profile_picture_url`,
      null,
      accessToken
    );

    return {
      id: response.id,
      name: response.username,
      username: response.username,
      avatar: response.profile_picture_url,
      type: response.account_type,
      followerCount: response.followers_count,
      mediaCount: response.media_count
    };
  } catch (error) {
    console.error('Instagram account info error:', error);
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

module.exports = {
  publishPost,
  getAccountInfo,
  validateAccessToken
};