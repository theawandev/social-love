// src/services/user.js
import api from './api';

export const userAPI = {
  // Update profile
  updateProfile: (profileData) => {
    const formData = new FormData();

    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Change password
  changePassword: (passwordData) => api.put('/users/password', passwordData),

  // Delete account
  deleteAccount: (confirmData) => api.delete('/users/account', { data: confirmData }),

  // Get user stats
  getUserStats: () => api.get('/users/stats'),
  getProfile: () => api.get('/users/profile'),
};