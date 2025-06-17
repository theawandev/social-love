// backend/src/services/social-platforms/linkedin.service.js
const { createApiClient, makeAuthenticatedRequest } = require('./base-platform.service');
const { socialApiConfig } = require('../../config/socialPlatform');

const apiClient = createApiClient(socialApiConfig.linkedin.baseUrl);

const publishPost = async (accessToken, personId, postData) => {
  try {
    const { content, mediaFiles = [] } = postData;

    let shareContent = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: mediaFiles.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (mediaFiles.length > 0) {
      const media = [];

      for (const file of mediaFiles) {
        if (file.file_type.startsWith('image/')) {
          const assetUrn = await uploadImage(accessToken, personId, file);
          media.push({
            status: 'READY',
            description: { text: content },
            media: assetUrn
          });
        }
      }

      shareContent.specificContent['com.linkedin.ugc.ShareContent'].media = media;
    }

    const response = await makeAuthenticatedRequest(
      apiClient,
      'POST',
      '/v2/ugcPosts',
      shareContent,
      accessToken
    );

    return {
      success: true,
      platformPostId: response.id,
      message: 'Post published successfully to LinkedIn'
    };
  } catch (error) {
    console.error('LinkedIn publish error:', error);
    throw error;
  }
};

const uploadImage = async (accessToken, personId, mediaFile) => {
  try {
    const registerResponse = await makeAuthenticatedRequest(
      apiClient,
      'POST',
      '/v2/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${personId}`,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      },
      accessToken
    );

    // In a real implementation, you'd upload the file to LinkedIn's CDN here
    return registerResponse.value.asset;
  } catch (error) {
    console.error('LinkedIn image upload error:', error);
    throw error;
  }
};

const getAccountInfo = async (accessToken, personId) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      '/v2/people/(id:' + personId + ')?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
      null,
      accessToken
    );

    return {
      id: response.id,
      name: `${response.firstName.localized.en_US} ${response.lastName.localized.en_US}`,
      avatar: response.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier
    };
  } catch (error) {
    console.error('LinkedIn account info error:', error);
    throw error;
  }
};

const validateAccessToken = async (accessToken) => {
  try {
    const response = await makeAuthenticatedRequest(
      apiClient,
      'GET',
      '/v2/people/(id:~)',
      null,
      accessToken
    );

    return { valid: true, userId: response.id };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = {
  publishPost,
  getAccountInfo,
  validateAccessToken
};