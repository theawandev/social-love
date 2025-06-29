// src/services/accounts.js
import api from './api';

export const accountsAPI = {
  // Get social accounts
  getAccounts: (platform) => {
    const params = platform ? `?platform=${platform}` : '';
    return api.get(`/social-accounts${params}`);
  },

  // Add social account
  addAccount: (accountData) => api.post('/social-accounts', accountData),

  // Update social account
  updateAccount: (id, accountData) => api.put(`/social-accounts/${id}`, accountData),

  // Remove social account
  removeAccount: (id, options = {}) => api.delete(`/social-accounts/${id}`, { data: options }),
};