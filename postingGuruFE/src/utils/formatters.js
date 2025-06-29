// utils/formatter.js
import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date, options = {}) => {
  const { relative = false, ...formatOptions } = options;

  if (relative) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }

  return format(new Date(date), formatOptions.format || 'MMM d, yyyy');
};

export const formatTime = (date, format = 'HH:mm') => {
  return format(new Date(date), format);
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM d, yyyy \'at\' h:mm a');
};

export const formatNumber = (number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatPlatformName = (platform) => {
  const names = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    youtube: 'YouTube',
  };
  return names[platform] || capitalizeFirst(platform);
};