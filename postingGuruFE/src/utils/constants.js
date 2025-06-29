// src/utils/constants.js
export const PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
};

export const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  CAROUSEL: 'carousel',
  REEL: 'reel',
  SHORT: 'short',
};

export const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
  PARTIALLY_PUBLISHED: 'partially_published',
};

export const PLATFORM_COLORS = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  youtube: '#FF0000',
};

export const FILE_LIMITS = {
  facebook: {
    image: { maxSize: 8 * 1024 * 1024, formats: ['jpeg', 'jpg', 'png', 'gif'] },
    video: { maxSize: 1024 * 1024 * 1024, formats: ['mp4', 'mov', 'avi'] },
  },
  instagram: {
    image: { maxSize: 8 * 1024 * 1024, formats: ['jpeg', 'jpg', 'png'] },
    video: { maxSize: 100 * 1024 * 1024, formats: ['mp4', 'mov'] },
  },
  linkedin: {
    image: { maxSize: 8 * 1024 * 1024, formats: ['jpeg', 'jpg', 'png', 'gif'] },
    video: { maxSize: 200 * 1024 * 1024, formats: ['mp4', 'mov', 'wmv'] },
  },
  tiktok: {
    video: { maxSize: 500 * 1024 * 1024, formats: ['mp4', 'mov', 'mpeg'] },
  },
  youtube: {
    video: { maxSize: 2 * 1024 * 1024 * 1024, formats: ['mp4', 'mov', 'avi'] },
  },
};