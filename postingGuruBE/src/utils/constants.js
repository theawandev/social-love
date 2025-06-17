// backend/src/utils/constants.js
const PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube'
};

const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  CAROUSEL: 'carousel',
  REEL: 'reel',
  SHORT: 'short'
};

const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
  PARTIALLY_PUBLISHED: 'partially_published'
};

const ACCOUNT_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business',
  PAGE: 'page'
};

const EVENT_TYPES = {
  HOLIDAY: 'holiday',
  OBSERVANCE: 'observance',
  SEASONAL: 'seasonal'
};

const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

const AI_PROVIDERS = {
  OPENAI: 'openai',
  CLAUDE: 'claude',
  GEMINI: 'gemini'
};

const PLATFORM_POST_TYPES = {
  [PLATFORMS.FACEBOOK]: [POST_TYPES.TEXT, POST_TYPES.IMAGE, POST_TYPES.VIDEO, POST_TYPES.CAROUSEL],
  [PLATFORMS.INSTAGRAM]: [POST_TYPES.TEXT, POST_TYPES.IMAGE, POST_TYPES.VIDEO, POST_TYPES.REEL, POST_TYPES.CAROUSEL],
  [PLATFORMS.LINKEDIN]: [POST_TYPES.TEXT, POST_TYPES.IMAGE, POST_TYPES.VIDEO, POST_TYPES.CAROUSEL],
  [PLATFORMS.TIKTOK]: [POST_TYPES.VIDEO, POST_TYPES.SHORT],
  [PLATFORMS.YOUTUBE]: [POST_TYPES.VIDEO, POST_TYPES.SHORT]
};

const FILE_LIMITS = {
  [PLATFORMS.FACEBOOK]: {
    image: {
      maxSize: 8 * 1024 * 1024, // 8MB
      formats: ['jpeg', 'jpg', 'png', 'gif'],
      maxCount: 10
    },
    video: {
      maxSize: 1024 * 1024 * 1024, // 1GB
      formats: ['mp4', 'mov', 'avi'],
      maxCount: 1
    }
  },
  [PLATFORMS.INSTAGRAM]: {
    image: {
      maxSize: 8 * 1024 * 1024, // 8MB
      formats: ['jpeg', 'jpg', 'png'],
      maxCount: 10
    },
    video: {
      maxSize: 100 * 1024 * 1024, // 100MB
      formats: ['mp4', 'mov'],
      maxCount: 1
    }
  },
  [PLATFORMS.LINKEDIN]: {
    image: {
      maxSize: 8 * 1024 * 1024, // 8MB
      formats: ['jpeg', 'jpg', 'png', 'gif'],
      maxCount: 9
    },
    video: {
      maxSize: 200 * 1024 * 1024, // 200MB
      formats: ['mp4', 'mov', 'wmv'],
      maxCount: 1
    }
  },
  [PLATFORMS.TIKTOK]: {
    video: {
      maxSize: 500 * 1024 * 1024, // 500MB
      formats: ['mp4', 'mov', 'mpeg', 'flv', 'avi'],
      maxCount: 1
    }
  },
  [PLATFORMS.YOUTUBE]: {
    video: {
      maxSize: 2 * 1024 * 1024 * 1024, // 2GB
      formats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
      maxCount: 1
    }
  }
};

const COUNTRIES = {
  US: { name: 'United States', timezone: 'America/New_York' },
  PK: { name: 'Pakistan', timezone: 'Asia/Karachi' },
  IN: { name: 'India', timezone: 'Asia/Kolkata' },
  UK: { name: 'United Kingdom', timezone: 'Europe/London' },
  CA: { name: 'Canada', timezone: 'America/Toronto' },
  AU: { name: 'Australia', timezone: 'Australia/Sydney' },
  DE: { name: 'Germany', timezone: 'Europe/Berlin' },
  FR: { name: 'France', timezone: 'Europe/Paris' },
  JP: { name: 'Japan', timezone: 'Asia/Tokyo' },
  BR: { name: 'Brazil', timezone: 'America/Sao_Paulo' },
  AE: { name: 'United Arab Emirates', timezone: 'Asia/Dubai' },
  SG: { name: 'Singapore', timezone: 'Asia/Singapore' },
  ZA: { name: 'South Africa', timezone: 'Africa/Johannesburg' },
  MX: { name: 'Mexico', timezone: 'America/Mexico_City' },
  RU: { name: 'Russia', timezone: 'Europe/Moscow' }
};

const AI_GENERATION_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: { text: 5, image: 2, monthly: true },
  [SUBSCRIPTION_TIERS.BASIC]: { text: 50, image: 20, monthly: true },
  [SUBSCRIPTION_TIERS.PRO]: { text: 200, image: 100, monthly: true },
  [SUBSCRIPTION_TIERS.ENTERPRISE]: { text: -1, image: -1, monthly: false } // unlimited
};

const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  RATE_LIMITED: 'Rate limit exceeded',
  INTERNAL_ERROR: 'Internal server error',

  // Auth specific
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',

  // Post specific
  POST_NOT_FOUND: 'Post not found',
  POST_ALREADY_PUBLISHED: 'Post already published',
  INVALID_SCHEDULE_TIME: 'Invalid schedule time',

  // Account specific
  ACCOUNT_NOT_FOUND: 'Social account not found',
  ACCOUNT_ALREADY_EXISTS: 'Social account already connected',
  INVALID_PLATFORM: 'Invalid social media platform',

  // File specific
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_UPLOAD_FAILED: 'File upload failed',

  // AI specific
  AI_LIMIT_EXCEEDED: 'AI generation limit exceeded',
  AI_SERVICE_UNAVAILABLE: 'AI service temporarily unavailable'
};

const MIME_TYPES = {
  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',

  // Videos
  MP4: 'video/mp4',
  MOV: 'video/quicktime',
  AVI: 'video/x-msvideo',
  WMV: 'video/x-ms-wmv',
  FLV: 'video/x-flv',
  WEBM: 'video/webm',

  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  HASHTAG: /#[a-zA-Z0-9_]+/g,
  MENTION: /@[a-zA-Z0-9_]+/g,
  URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

const QUEUE_JOBS = {
  PUBLISH_POST: 'publish-post',
  MONTHLY_EMAIL: 'monthly-events-email',
  POST_FAILURE_NOTIFICATION: 'post-failure-notification',
  CLEANUP_OLD_JOBS: 'cleanup-old-jobs',
  TOKEN_REFRESH: 'token-refresh'
};

module.exports = {
  PLATFORMS,
  POST_TYPES,
  POST_STATUS,
  ACCOUNT_TYPES,
  EVENT_TYPES,
  SUBSCRIPTION_TIERS,
  AI_PROVIDERS,
  PLATFORM_POST_TYPES,
  FILE_LIMITS,
  COUNTRIES,
  AI_GENERATION_LIMITS,
  HTTP_STATUS_CODES,
  ERROR_MESSAGES,
  MIME_TYPES,
  REGEX_PATTERNS,
  QUEUE_JOBS
};