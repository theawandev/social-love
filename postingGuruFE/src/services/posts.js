// src/services/posts.js
import api from './api';

export const postsAPI = {
  // Get posts with filters
  getPosts: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/posts?${searchParams}`);
  },

  // Get single post
  getPost: (id) => api.get(`/posts/${id}`),

  // Create new post
  createPost: (postData) => {
    const formData = new FormData();

    // Add text fields
    Object.keys(postData).forEach(key => {
      if (key !== 'files' && postData[key] !== undefined) {
        if (typeof postData[key] === 'object') {
          formData.append(key, JSON.stringify(postData[key]));
        } else {
          formData.append(key, postData[key]);
        }
      }
    });

    // Add files
    if (postData.files && postData.files.length > 0) {
      postData.files.forEach(file => {
        formData.append('files', file);
      });
    }

    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Update post
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),

  // Delete post
  deletePost: (id) => api.delete(`/posts/${id}`),

  // Duplicate post
  duplicatePost: (id) => api.post(`/posts/${id}/duplicate`),

  // Publish post immediately
  publishPost: (id) => api.post(`/posts/${id}/publish`),

  // Cancel scheduled post
  cancelPost: (id) => api.post(`/posts/${id}/cancel`),
};