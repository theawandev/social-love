// services/calendar.js
import api from './api';

export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  createEvent: (data) => api.post('/calendar/events', data),
  updateEvent: (id, data) => api.put(`/calendar/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/calendar/events/${id}`),
  getMonthlyEvents: (year, month) => api.get(`/calendar/monthly/${year}/${month}`),
};






