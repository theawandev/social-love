// backend/src/config/socialPlatform.js
const socialApiConfig = {
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_video'],
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
  },

  instagram: {
    appId: process.env.INSTAGRAM_APP_ID,
    appSecret: process.env.INSTAGRAM_APP_SECRET,
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com',
    scopes: ['instagram_basic', 'instagram_content_publish'],
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
  },

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    apiVersion: 'v2',
    baseUrl: 'https://api.linkedin.com',
    scopes: ['w_member_social', 'r_liteprofile', 'r_emailaddress'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
  },

  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    apiVersion: 'v1',
    baseUrl: 'https://open-api.tiktok.com',
    scopes: ['video.publish', 'user.info.basic'],
    authUrl: 'https://www.tiktok.com/auth/authorize'
  },

  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    apiVersion: 'v3',
    baseUrl: 'https://www.googleapis.com/youtube',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'],
    authUrl: 'https://accounts.google.com/o/oauth2/auth'
  }
};

// Get auth URL for a platform
const getAuthUrl = (platform, redirectUri, state) => {
  const config = socialApiConfig[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId || config.appId || config.clientKey,
    redirect_uri: redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: state
  });

  return `${config.authUrl}?${params.toString()}`;
};

// Validate platform configuration
const validatePlatformConfig = (platform) => {
  const config = socialApiConfig[platform];
  if (!config) {
    return { valid: false, error: `Platform ${platform} not supported` };
  }

  const requiredKeys = {
    facebook: ['appId', 'appSecret'],
    instagram: ['appId', 'appSecret'],
    linkedin: ['clientId', 'clientSecret'],
    tiktok: ['clientKey', 'clientSecret'],
    youtube: ['clientId', 'clientSecret']
  };

  const required = requiredKeys[platform];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing configuration for ${platform}: ${missing.join(', ')}`
    };
  }

  return { valid: true };
};

module.exports = {
  socialApiConfig,
  getAuthUrl,
  validatePlatformConfig
};