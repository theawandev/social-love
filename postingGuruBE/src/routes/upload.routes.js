// backend/src/routes/upload.routes.js
const express = require('express');
const { uploadMiddleware } = require('../middleware/upload.middleware');
const { verifyToken } = require('../middleware/auth.middleware');
const fileUploadService = require('../services/file-upload.service');
const ApiResponse = require('../utils/response');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Upload single file
router.post('/single', uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`
    };

    res.json(ApiResponse.success(fileData, 'File uploaded successfully'));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(ApiResponse.error('Upload failed'));
  }
});

// Upload multiple files
router.post('/multiple', uploadMiddleware, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(ApiResponse.error('No files uploaded'));
    }

    const filesData = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }));

    res.json(ApiResponse.success(filesData, 'Files uploaded successfully'));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(ApiResponse.error('Upload failed'));
  }
});

// Delete uploaded file
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    await fileUploadService.deleteFile(filename);
    res.json(ApiResponse.success(null, 'File deleted successfully'));
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json(ApiResponse.error('Failed to delete file'));
  }
});

module.exports = router;