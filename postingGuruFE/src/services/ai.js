// src/services/ai.js
import api from './api';

export const aiAPI = {
  // Generate text content
  generateText: (data) => api.post('/ai/generate/text', data),

  // Generate image content
  generateImage: (data) => api.post('/ai/generate/image', data),

  // Get AI usage stats
  getUsage: () => api.get('/ai/usage'),
};