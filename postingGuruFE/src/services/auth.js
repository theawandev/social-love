// src/services/auth.js
import api from './api';

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  completeTour: () => api.post('/auth/complete-tour'),
  logout: () => api.post('/auth/logout'),
};