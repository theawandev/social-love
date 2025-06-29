// src/services/dashboard.js
import api from './api';

export const dashboardAPI = {
  // Get dashboard overview
  getOverview: () => api.get('/dashboard/overview'),

  // Get monthly events
  getMonthlyEvents: (year, month) => {
    const params = new URLSearchParams({ year, month });
    return api.get(`/dashboard/events?${params}`);
  },
  getStats: () => api.get('/dashboard/stats'),

  // Get queue statistics
  getQueueStats: () => api.get('/dashboard/queue-stats'),
};