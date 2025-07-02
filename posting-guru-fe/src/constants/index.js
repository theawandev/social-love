// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
};

// Social Media Platforms
export const PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
};

export const PLATFORM_NAMES = {
  [PLATFORMS.FACEBOOK]: 'Facebook',
  [PLATFORMS.INSTAGRAM]: 'Instagram',
  [PLATFORMS.LINKEDIN]: 'LinkedIn',
  [PLATFORMS.TIKTOK]: 'TikTok',
  [PLATFORMS.YOUTUBE]: 'YouTube',
};

export const PLATFORM_COLORS = {
  [PLATFORMS.FACEBOOK]: '#1877f2',
  [PLATFORMS.INSTAGRAM]: '#833ab4',
  [PLATFORMS.LINKEDIN]: '#0077b5',
  [PLATFORMS.TIKTOK]: '#000000',
  [PLATFORMS.YOUTUBE]: '#ff0000',
};

// Post Types
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

// Platform-specific post types
export const PLATFORM_POST_TYPES = {
  [PLATFORMS.FACEBOOK]: [POST_TYPES.TEXT, POST_TYPES.IMAGE, POST_TYPES.VIDEO, POST_TYPES.CAROUSEL],
  [PLATFORMS.INSTAGRAM]: [POST_TYPES.TEXT, POST_TYPES.IMAGE, POST_TYPES.VIDEO, POST_TYPES.REEL, POST_TYPES.CAROUSEL],
  [PLATFORMS.LINKEDIN]: [POST_TYPES.TEXT, POST_TYPES.IMAGE, POST_TYPES.VIDEO, POST_TYPES.CAROUSEL],
  [PLATFORMS.TIKTOK]: [POST_TYPES.VIDEO, POST_TYPES.SHORT],
  [PLATFORMS.YOUTUBE]: [POST_TYPES.VIDEO, POST_TYPES.SHORT],
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  POSTS: '/posts',
  POSTS_CREATE: '/posts/create',
  POSTS_SCHEDULED: '/posts/scheduled',
  POSTS_DRAFTS: '/posts/drafts',
  POSTS_HISTORY: '/posts/history',
  POSTS_CALENDAR: '/posts/calendar',
  ACCOUNTS: '/accounts',
  SETTINGS: '/settings',
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  UR: 'ur',
};

export const LANGUAGE_NAMES = {
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.UR]: 'اردو',
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILES: 10,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  FULL: 'MMMM dd, yyyy hh:mm a',
  TIME: 'hh:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// Dashboard Config
export const DASHBOARD_CONFIG = {
  RECENT_POSTS_LIMIT: 5,
  UPCOMING_EVENTS_LIMIT: 5,
  CHARTS_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

// Query Keys for React Query
export const QUERY_KEYS = {
  USER: 'user',
  POSTS: 'posts',
  POST: 'post',
  SOCIAL_ACCOUNTS: 'socialAccounts',
  DASHBOARD: 'dashboard',
  EVENTS: 'events',
  AI_USAGE: 'aiUsage',
  CALENDAR: 'calendar',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  FILE_TOO_LARGE: 'File size is too large.',
  INVALID_FILE_TYPE: 'Invalid file type.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  POST_SCHEDULED: 'Post scheduled successfully!',
  ACCOUNT_CONNECTED: 'Account connected successfully!',
  ACCOUNT_DISCONNECTED: 'Account disconnected successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
};

// AI Configuration
export const AI_CONFIG = {
  TEXT_GENERATION: {
    MAX_PROMPT_LENGTH: 500,
    MIN_PROMPT_LENGTH: 10,
  },
  IMAGE_GENERATION: {
    MAX_PROMPT_LENGTH: 400,
    MIN_PROMPT_LENGTH: 10,
    SIZES: ['512x512', '1024x1024', '1024x1792', '1792x1024'],
    STYLES: ['realistic', 'artistic', 'cartoon', 'abstract'],
  },
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  THEME: 'theme',
  LANGUAGE: 'language',
  USER_PREFERENCES: 'userPreferences',
};

// Event Types
export const EVENT_TYPES = {
  HOLIDAY: 'holiday',
  OBSERVANCE: 'observance',
  SEASONAL: 'seasonal',
};

// Account Types
export const ACCOUNT_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business',
  PAGE: 'page',
};