// backend/src/services/file-upload.service.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { FILE_LIMITS } = require('../utils/constants');

const uploadProfileImage = async (file) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `profile_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
    const outputPath = path.join(uploadDir, filename);

    // Resize and optimize profile image
    await sharp(file.path)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // Delete original file
    await fs.unlink(file.path);

    return `/uploads/profiles/${filename}`;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw new Error('Failed to upload profile image');
  }
};

const processUploadedFile = async (file) => {
  try {
    const { mimetype, path: filePath } = file;

    if (mimetype.startsWith('image/')) {
      return await processImage(file);
    } else if (mimetype.startsWith('video/')) {
      return await processVideo(file);
    }

    return file;
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
};

const processImage = async (file) => {
  try {
    const thumbnailDir = path.join(path.dirname(file.path), 'thumbnails');
    await fs.mkdir(thumbnailDir, { recursive: true });

    const thumbnailPath = path.join(thumbnailDir, `thumb_${file.filename}`);

    // Generate thumbnail
    await sharp(file.path)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    file.thumbnailPath = thumbnailPath;

    // Optimize original image if too large
    const stats = await fs.stat(file.path);
    if (stats.size > 2 * 1024 * 1024) { // If larger than 2MB
      await sharp(file.path)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(file.path + '_optimized');

      await fs.unlink(file.path);
      await fs.rename(file.path + '_optimized', file.path);
    }

    return file;
  } catch (error) {
    console.error('Image processing error:', error);
    return file; // Return original file if processing fails
  }
};

const processVideo = async (file) => {
  try {
    // For video processing, you would typically use ffmpeg
    // For now, we'll just validate the file
    const stats = await fs.stat(file.path);

    // Check file size limits based on platform
    const maxSize = 100 * 1024 * 1024; // 100MB general limit
    if (stats.size > maxSize) {
      throw new Error('Video file too large');
    }

    return file;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
};

const deleteFile = async (filename) => {
  try {
    const filePath = path.join(__dirname, '../../uploads', filename);
    const thumbnailPath = path.join(path.dirname(filePath), 'thumbnails', `thumb_${filename}`);

    // Delete main file
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.log('Main file not found:', filePath);
    }

    // Delete thumbnail if exists
    try {
      await fs.unlink(thumbnailPath);
    } catch (error) {
      console.log('Thumbnail not found:', thumbnailPath);
    }

    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    throw new Error('Failed to delete file');
  }
};

const validateFile = (file, platform) => {
  const limits = FILE_LIMITS[platform];
  if (!limits) {
    return { valid: true };
  }

  const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
  const platformLimits = limits[fileType];

  if (!platformLimits) {
    return { valid: false, error: `${fileType} not supported on ${platform}` };
  }

  // Check file size
  if (file.size > platformLimits.maxSize) {
    return {
      valid: false,
      error: `File too large. Max size for ${platform} ${fileType}: ${platformLimits.maxSize / 1024 / 1024}MB`
    };
  }

  // Check file format
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  if (!platformLimits.formats.includes(fileExtension)) {
    return {
      valid: false,
      error: `Format not supported. Allowed formats for ${platform} ${fileType}: ${platformLimits.formats.join(', ')}`
    };
  }

  return { valid: true };
};

const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return {
      size: stats.size,
      extension,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    throw new Error('File not found');
  }
};

module.exports = {
  uploadProfileImage,
  processUploadedFile,
  deleteFile,
  validateFile,
  getFileInfo
};