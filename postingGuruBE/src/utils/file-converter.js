// backend/src/utils/file-converter.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const convertImageFormat = async (inputPath, outputFormat = 'jpeg', quality = 85) => {
  try {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, `.${outputFormat}`);

    let sharpInstance = sharp(inputPath);

    switch (outputFormat.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      default:
        throw new Error(`Unsupported output format: ${outputFormat}`);
    }

    await sharpInstance.toFile(outputPath);

    // Delete original if different from output
    if (inputPath !== outputPath) {
      await fs.unlink(inputPath);
    }

    return outputPath;
  } catch (error) {
    console.error('Image conversion error:', error);
    throw new Error('Failed to convert image');
  }
};

const resizeImage = async (inputPath, width, height, fit = 'cover') => {
  try {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, `_${width}x${height}${ext}`);

    await sharp(inputPath)
      .resize(width, height, { fit })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Image resize error:', error);
    throw new Error('Failed to resize image');
  }
};

const optimizeImage = async (inputPath, maxWidth = 1920, quality = 85) => {
  try {
    const optimizedPath = inputPath.replace(path.extname(inputPath), '_optimized.jpg');

    await sharp(inputPath)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality })
      .toFile(optimizedPath);

    // Replace original with optimized version
    await fs.unlink(inputPath);
    await fs.rename(optimizedPath, inputPath);

    return inputPath;
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
};

const generateThumbnail = async (inputPath, size = 300) => {
  try {
    const ext = path.extname(inputPath);
    const thumbnailPath = inputPath.replace(ext, `_thumb${ext}`);

    await sharp(inputPath)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

const getImageMetadata = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      density: metadata.density
    };
  } catch (error) {
    console.error('Get image metadata error:', error);
    throw new Error('Failed to get image metadata');
  }
};

const convertHeicToJpeg = async (inputPath) => {
  try {
    const outputPath = inputPath.replace(/\.heic$/i, '.jpg');

    await sharp(inputPath)
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    await fs.unlink(inputPath);

    return outputPath;
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw new Error('Failed to convert HEIC to JPEG');
  }
};

module.exports = {
  convertImageFormat,
  resizeImage,
  optimizeImage,
  generateThumbnail,
  getImageMetadata,
  convertHeicToJpeg
};