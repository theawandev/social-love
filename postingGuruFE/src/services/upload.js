// src/services/upload.js
import api from './api';

export const uploadAPI = {
  // Upload single file
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Upload multiple files
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Delete file
  deleteFile: (filename) => api.delete(`/upload/${filename}`),
};