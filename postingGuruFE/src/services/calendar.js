// src/services/calendar.js
import api from './api';

export const calendarAPI = {
  // Get calendar data
  getCalendarData: (year, month) => {
    const params = new URLSearchParams({ year, month });
    return api.get(`/calendar/data?${params}`);
  },

  // Get posts for specific date
  getPostsForDate: (date) => api.get(`/calendar/posts/${date}`),

  // Get events for specific date
  getEventsForDate: (date) => api.get(`/calendar/events/${date}`),
};