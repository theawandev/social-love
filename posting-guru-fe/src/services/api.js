import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, ROUTES } from '../constants';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data; // Return just the data
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;

      // Handle unauthorized errors
      if (status === 401) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        window.location.href = ROUTES.LOGIN;
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      // Handle validation errors
      if (status === 400 && data.errors) {
        return Promise.reject({
          message: data.message || 'Validation failed',
          errors: data.errors,
        });
      }

      // Handle other API errors
      return Promise.reject(new Error(data.message || 'An error occurred'));
    }

    // Handle network errors
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle other errors
    return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  googleCallback: (token) => api.get(`/auth/google/callback?token=${token}`),
};

// Posts API endpoints
export const postsAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  publishPost: (id) => api.post(`/posts/${id}/publish`),
  cancelPost: (id) => api.post(`/posts/${id}/cancel`),
};

// Social Accounts API endpoints
export const socialAccountsAPI = {
  getAccounts: () => api.get('/social-accounts'),
  addAccount: (data) => api.post('/social-accounts', data),
  updateAccount: (id, data) => api.put(`/social-accounts/${id}`, data),
  removeAccount: (id) => api.delete(`/social-accounts/${id}`),
};

// Dashboard API endpoints
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getEvents: (params) => api.get('/dashboard/events', { params }),
};

// Calendar API endpoints
export const calendarAPI = {
  getCalendarData: (params) => api.get('/calendar/data', { params }),
  getPostsForDate: (date) => api.get(`/calendar/posts/${date}`),
  getEventsForDate: (date) => api.get(`/calendar/events/${date}`),
};

// AI API endpoints
export const aiAPI = {
  generateText: (data) => api.post('/ai/generate/text', data),
  generateImage: (data) => api.post('/ai/generate/image', data),
  getUsage: () => api.get('/ai/usage'),
};

// Upload API endpoints
export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (filename) => api.delete(`/upload/${filename}`),
};

// Export the configured axios instance
export default api;