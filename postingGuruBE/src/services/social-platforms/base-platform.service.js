// backend/src/services/social-platforms/base-platform.service.js
const axios = require('axios');

const createApiClient = (baseUrl) => {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor for error handling
  client.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', error.response?.data || error.message);
      throw handleApiError(error);
    }
  );

  return client;
};

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        return new Error('Authentication failed. Please reconnect your account.');
      case 403:
        return new Error('Permission denied. Check account permissions.');
      case 429:
        return new Error('Rate limit exceeded. Please try again later.');
      default:
        return new Error(data?.error?.message || data?.message || 'API request failed');
    }
  }

  return new Error('Network error. Please check your connection.');
};

const makeAuthenticatedRequest = async (client, method, url, data, accessToken) => {
  const config = {
    method,
    url,
    headers: {
      'Authorization': `Bearer ${ accessToken }`
    }
  };

  if (data) {
    config.data = data;
  }

  const response = await client(config);
  return response.data;
};

module.exports = {
  createApiClient,
  handleApiError,
  makeAuthenticatedRequest
};







