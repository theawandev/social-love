const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { FILE_LIMITS } = require('../utils/constants');
const { formatFileSize, sanitizeFilename, isImage, isVideo } = require('../utils/helpers');
const { convertImageFormat, resizeImage, optimizeImage, generateThumbnail } = require('../utils/file-converter');
const logger = require('../utils/logger');

const uploadProfileImage = async (file) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    await fs.mkdir(uploadDir, { recursive: true });

    const sanitizedOriginalName = sanitizeFilename(file.originalname);
    const filename = `profile_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
    const outputPath = path.join(uploadDir, filename);

    // Resize and optimize profile image
    await sharp(file.path)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // Delete original file
    await fs.unlink(file.path);

    logger.info('Profile image processed', {
      originalName: sanitizedOriginalName,
      newFileName: filename,
      originalSize: formatFileSize(file.size)
    });

    return `/uploads/profiles/${filename}`;
  } catch (error) {
    logger.error('Profile image upload error', { error: error.message });
    throw new Error('Failed to upload profile image');
  }
};

const processUploadedFile = async (file) => {
  try {
    const { mimetype, path: filePath } = file;

    logger.info('Processing uploaded file', {
      fileName: file.filename,
      type: mimetype,
      size: formatFileSize(file.size)
    });

    if (isImage(file.filename)) {
      return await processImage(file);
    } else if (isVideo(file.filename)) {
      return await processVideo(file);
    }

    return file;
  } catch (error) {
    logger.error('File processing error', { error: error.message, fileName: file.filename });
    throw error;
  }
};

const processImage = async (file) => {
  try {
    // Generate thumbnail
    await generateThumbnail(file.path);

    // Optimize if too large
    const stats = await fs.stat(file.path);
    if (stats.size > 2 * 1024 * 1024) { // If larger than 2MB
      await optimizeImage(file.path);
      logger.info('Image optimized', { fileName: file.filename, originalSize: formatFileSize(stats.size) });
    }

    return file;
  } catch (error) {
    logger.error('Image processing error', { error: error.message, fileName: file.filename });
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

    logger.info('Video validated', { fileName: file.filename, size: formatFileSize(stats.size) });

    return file;
  } catch (error) {
    logger.error('Video processing error', { error: error.message, fileName: file.filename });
    throw error;
  }
};

const deleteFile = async (filename) => {
  try {
    const sanitizedFilename = sanitizeFilename(filename);
    const filePath = path.join(__dirname, '../../uploads', sanitizedFilename);
    const thumbnailPath = path.join(path.dirname(filePath), 'thumbnails', `thumb_${sanitizedFilename}`);

    // Delete main file
    try {
      await fs.unlink(filePath);
      logger.info('Main file deleted', { filename: sanitizedFilename });
    } catch (error) {
      logger.warn('Main file not found', { filename: sanitizedFilename });
    }

    // Delete thumbnail if exists
    try {
      await fs.unlink(thumbnailPath);
      logger.info('Thumbnail deleted', { filename: sanitizedFilename });
    } catch (error) {
      logger.warn('Thumbnail not found', { filename: sanitizedFilename });
    }

    return true;
  } catch (error) {
    logger.error('Delete file error', { error: error.message, filename });
    throw new Error('Failed to delete file');
  }
};

const validateFile = (file, platform) => {
  const limits = FILE_LIMITS[platform];
  if (!limits) {
    return { valid: true };
  }

  const fileType = isImage(file.originalname) ? 'image' : isVideo(file.originalname) ? 'video' : 'unknown';
  const platformLimits = limits[fileType];

  if (!platformLimits) {
    return { valid: false, error: `${fileType} not supported on ${platform}` };
  }

  // Check file size
  if (file.size > platformLimits.maxSize) {
    return {
      valid: false,
      error: `File too large. Max size for ${platform} ${fileType}: ${formatFileSize(platformLimits.maxSize)}`
    };
  }

  // Check file format
  const fileExtension = path.extname(file.originalname).slice(1).toLowerCase();
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
      formattedSize: formatFileSize(stats.size),
      extension,
      isImage: isImage(filePath),
      isVideo: isVideo(filePath),
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