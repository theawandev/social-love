// src/utils/helpers.js
import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns';

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (date, options = {}) => {
  const dateObj = new Date(date);

  if (options.relative) {
    if (isToday(dateObj)) return 'Today';
    if (isYesterday(dateObj)) return 'Yesterday';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  return format(dateObj, options.format || 'MMM dd, yyyy HH:mm');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export const extractHashtags = (text) => {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  return text.match(hashtagRegex) || [];
};

export const extractMentions = (text) => {
  const mentionRegex = /@[a-zA-Z0-9_]+/g;
  return text.match(mentionRegex) || [];
};

export const validateFile = (file, platform, type) => {
  const limits = FILE_LIMITS[platform]?.[type];
  if (!limits) return { valid: false, error: 'Unsupported platform or file type' };

  if (file.size > limits.maxSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${formatFileSize(limits.maxSize)}`,
    };
  }

  const extension = file.name.split('.').pop().toLowerCase();
  if (!limits.formats.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported format. Allowed: ${limits.formats.join(', ')}`,
    };
  }

  return { valid: true };
};