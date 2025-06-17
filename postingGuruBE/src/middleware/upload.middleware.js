// backend/src/middleware/upload.middleware.js
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const { FILE_LIMITS } = require('../utils/constants');

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'video/mp4': true,
    'video/mov': true,
    'video/avi': true,
    'video/wmv': true,
    'video/flv': true,
    'video/webm': true,
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Max 10 files per request
  }
});

// Process uploaded files
const processFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    for (const file of req.files) {
      // Generate thumbnail for videos and large images
      if (file.mimetype.startsWith('image/')) {
        await generateImageThumbnail(file);
      } else if (file.mimetype.startsWith('video/')) {
        await generateVideoThumbnail(file);
      }

      // Validate file size based on platform requirements
      // This would be implemented based on target platforms
      // For now, we'll use general limits
    }

    next();
  } catch (error) {
    console.error('File processing error:', error);
    // Clean up uploaded files on error
    for (const file of req.files) {
      try {
        await fs.unlink(file.path);
        if (file.thumbnailPath) {
          await fs.unlink(file.thumbnailPath);
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
    res.status(500).json({ error: 'File processing failed' });
  }
};

// Generate image thumbnail
const generateImageThumbnail = async (file) => {
  try {
    const thumbnailDir = path.join(path.dirname(file.path), 'thumbnails');
    await fs.mkdir(thumbnailDir, { recursive: true });

    const thumbnailPath = path.join(thumbnailDir, `thumb_${file.filename}`);

    await sharp(file.path)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    file.thumbnailPath = thumbnailPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    // Don't throw error, thumbnails are optional
  }
};

// Generate video thumbnail (placeholder - would need ffmpeg)
const generateVideoThumbnail = async (file) => {
  try {
    // This would require ffmpeg to extract frame from video
    // For now, we'll skip video thumbnails
    console.log('Video thumbnail generation not implemented yet');
  } catch (error) {
    console.error('Video thumbnail generation error:', error);
  }
};

// Middleware chain for file uploads
const uploadMiddleware = [
  upload.array('files', 10), // Max 10 files with field name 'files'
  processFiles
];

module.exports = {
  uploadMiddleware,
  upload
};