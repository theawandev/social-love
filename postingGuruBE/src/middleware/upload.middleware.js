const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { FILE_LIMITS } = require('../utils/constants');
const { sanitizeFilename, formatFileSize } = require('../utils/helpers');
const { generateThumbnail } = require('../utils/file-converter');
const { validateFileType, validateFileSize } = require('../utils/validator');
const logger = require('../utils/logger');

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      logger.error('Upload directory creation failed', { error: error.message });
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename using utility
    const sanitizedName = sanitizeFilename(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(sanitizedName).toLowerCase();
    const baseName = path.basename(sanitizedName, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter using utility functions
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv', 'video/webm'
  ];

  if (validateFileType(file.mimetype, allowedTypes)) {
    cb(null, true);
  } else {
    logger.warn('Invalid file type attempted', {
      mimetype: file.mimetype,
      originalName: file.originalname
    });
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
      // Validate file size using utility
      if (!validateFileSize(file.size, 100 * 1024 * 1024)) {
        throw new Error(`File ${file.originalname} is too large`);
      }

      logger.info('Processing uploaded file', {
        originalName: file.originalname,
        filename: file.filename,
        size: formatFileSize(file.size),
        mimetype: file.mimetype
      });

      // Generate thumbnail for images
      if (file.mimetype.startsWith('image/')) {
        try {
          await generateThumbnail(file.path);
        } catch (thumbnailError) {
          logger.warn('Thumbnail generation failed', {
            filename: file.filename,
            error: thumbnailError.message
          });
        }
      }
    }

    next();
  } catch (error) {
    logger.error('File processing error', { error: error.message });

    // Clean up uploaded files on error
    for (const file of req.files || []) {
      try {
        await fs.unlink(file.path);
      } catch (cleanupError) {
        logger.error('File cleanup error', {
          filename: file.filename,
          error: cleanupError.message
        });
      }
    }

    res.status(500).json({ error: 'File processing failed' });
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