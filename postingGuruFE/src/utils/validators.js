// utils/validation.js - Complete validation utilities
import { z } from 'zod';

// Basic validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

export const postContentSchema = z
  .string()
  .min(1, 'Content is required')
  .max(2200, 'Content must be less than 2200 characters');

export const urlSchema = z.string().url('Invalid URL');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// File validation functions
export const validateImage = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

  if (file.size > maxSize) {
    throw new Error('Image size must be less than 10MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Image type must be JPEG, PNG, GIF, WebP, or SVG');
  }

  return true;
};

export const validateVideo = (file) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm', 'video/ogg'];

  if (file.size > maxSize) {
    throw new Error('Video size must be less than 100MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Video type must be MP4, MOV, AVI, QuickTime, WebM, or OGG');
  }

  return true;
};

export const validateDocument = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ];

  if (file.size > maxSize) {
    throw new Error('Document size must be less than 50MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Document type must be PDF, Word, Excel, PowerPoint, or Text file');
  }

  return true;
};

export const validateAudio = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'];

  if (file.size > maxSize) {
    throw new Error('Audio size must be less than 50MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Audio type must be MP3, WAV, OGG, AAC, or FLAC');
  }

  return true;
};

// Multiple file validation
export const validateMultipleFiles = (files, options = {}) => {
  const {
    maxFiles = 10,
    maxTotalSize = 200 * 1024 * 1024, // 200MB total
    allowedTypes = ['image', 'video', 'document', 'audio']
  } = options;

  if (files.length > maxFiles) {
    throw new Error(`Maximum ${ maxFiles } files allowed`);
  }

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  if (totalSize > maxTotalSize) {
    throw new Error(`Total file size must be less than ${ formatFileSize(maxTotalSize) }`);
  }

  files.forEach((file, index) => {
    try {
      const fileType = file.type.split('/')[0];

      switch (fileType) {
        case 'image':
          if (allowedTypes.includes('image')) validateImage(file);
          else throw new Error('Image files not allowed');
          break;
        case 'video':
          if (allowedTypes.includes('video')) validateVideo(file);
          else throw new Error('Video files not allowed');
          break;
        case 'audio':
          if (allowedTypes.includes('audio')) validateAudio(file);
          else throw new Error('Audio files not allowed');
          break;
        default:
          if (allowedTypes.includes('document')) validateDocument(file);
          else throw new Error('Document files not allowed');
      }
    }
    catch (error) {
      throw new Error(`File ${ index + 1 } (${ file.name }): ${ error.message }`);
    }
  });

  return true;
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Social media platform content validation
export const validateSocialMediaContent = (content, platform) => {
  const limits = {
    twitter: 280,
    facebook: 63206,
    instagram: 2200,
    linkedin: 3000,
    tiktok: 2200,
    youtube: 5000,
  };

  const limit = limits[platform?.toLowerCase()] || 2200;

  if (content.length > limit) {
    throw new Error(`Content exceeds ${ platform } character limit of ${ limit.toLocaleString() }`);
  }

  // Check for platform-specific requirements
  switch (platform?.toLowerCase()) {
    case 'twitter':
      // Twitter-specific validations
      const twitterMentions = (content.match(/@\w+/g) || []).length;
      if (twitterMentions > 10) {
        throw new Error('Twitter posts cannot mention more than 10 users');
      }
      break;

    case 'instagram':
      // Instagram hashtag limit
      const hashtags = (content.match(/#\w+/g) || []).length;
      if (hashtags > 30) {
        throw new Error('Instagram posts cannot have more than 30 hashtags');
      }
      break;

    case 'linkedin':
      // LinkedIn professional content check
      if (content.toLowerCase().includes('buy now') || content.toLowerCase().includes('click here')) {
        console.warn('LinkedIn content should maintain professional tone');
      }
      break;
  }

  return true;
};

// URL validation with additional checks
export const validateSocialUrl = (url, platform) => {
  const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  if (!urlPattern.test(url)) {
    throw new Error('Invalid URL format');
  }

  const platformDomains = {
    facebook: ['facebook.com', 'fb.com'],
    instagram: ['instagram.com'],
    twitter: ['twitter.com', 'x.com'],
    linkedin: ['linkedin.com'],
    youtube: ['youtube.com', 'youtu.be'],
    tiktok: ['tiktok.com']
  };

  if (platform && platformDomains[platform]) {
    const domain = new URL(url).hostname.replace('www.', '');
    if (!platformDomains[platform].some(d => domain.includes(d))) {
      throw new Error(`URL must be from ${ platform }`);
    }
  }

  return true;
};

// Form validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const postSchema = z.object({
  content: postContentSchema,
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  scheduledFor: z.date().optional(),
  tags: z.array(z.string()).optional(),
  caption: z.string().max(500, 'Caption too long').optional(),
});

export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: urlSchema.optional().or(z.literal('')),
  timezone: z.string().optional(),
});

export const socialAccountSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok']),
  accountName: z.string().min(1, 'Account name is required'),
  profileUrl: z.string().url('Invalid profile URL').optional(),
});

// Password strength checker
export const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    score,
    strength,
    checks,
    suggestions: [
      !checks.length && 'Use at least 8 characters',
      !checks.lowercase && 'Add lowercase letters',
      !checks.uppercase && 'Add uppercase letters',
      !checks.number && 'Add numbers',
      !checks.special && 'Add special characters',
    ].filter(Boolean)
  };
};

// Email validation with domain checking
export const validateEmailDomain = async (email) => {
  const domain = email.split('@')[1];

  // List of known disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'throwaway.email'
  ];

  if (disposableDomains.includes(domain)) {
    throw new Error('Disposable email addresses are not allowed');
  }

  return true;
};

// Rate limiting validation
export const validateRateLimit = (key, limit = 5, windowMs = 60000) => {
  const now = Date.now();
  const requests = JSON.parse(localStorage.getItem(`rate_limit_${ key }`) || '[]');

  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);

  if (validRequests.length >= limit) {
    throw new Error(`Too many requests. Please wait ${ Math.ceil(windowMs / 1000) } seconds.`);
  }

  // Add current request
  validRequests.push(now);
  localStorage.setItem(`rate_limit_${ key }`, JSON.stringify(validRequests));

  return true;
};

// Helper function for file size formatting
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Comprehensive validation function for posts
export const validatePost = (postData) => {
  const errors = [];

  // Content validation
  try {
    validateSocialMediaContent(postData.content, postData.platforms?.[0]);
  }
  catch (error) {
    errors.push(error.message);
  }

  // Media validation
  if (postData.media && postData.media.length > 0) {
    try {
      validateMultipleFiles(postData.media, {
        maxFiles: 10,
        allowedTypes: ['image', 'video']
      });
    }
    catch (error) {
      errors.push(error.message);
    }
  }

  // Schedule validation
  if (postData.scheduledFor) {
    const scheduleDate = new Date(postData.scheduledFor);
    const now = new Date();

    if (scheduleDate <= now) {
      errors.push('Scheduled time must be in the future');
    }

    // Don't allow scheduling more than 1 year in advance
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (scheduleDate > oneYearFromNow) {
      errors.push('Cannot schedule more than 1 year in advance');
    }
  }

  // Platform-specific validations
  if (postData.platforms) {
    postData.platforms.forEach(platform => {
      try {
        validateSocialMediaContent(postData.content, platform);
      }
      catch (error) {
        errors.push(`${ platform }: ${ error.message }`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return true;
};

export const validateHashtags = (tags) => {
  const hashtagRegex = /^[a-zA-Z0-9_]{1,30}$/;
  return tags.every(tag => hashtagRegex.test(tag));
};


export default {
  emailSchema,
  passwordSchema,
  nameSchema,
  postContentSchema,
  urlSchema,
  phoneSchema,
  validateImage,
  validateVideo,
  validateDocument,
  validateAudio,
  validateMultipleFiles,
  sanitizeInput,
  sanitizeHtml,
  validateSocialMediaContent,
  validateSocialUrl,
  loginSchema,
  registerSchema,
  postSchema,
  profileSchema,
  socialAccountSchema,
  checkPasswordStrength,
  validateEmailDomain,
  validateRateLimit,
  validatePost,
  validateHashtags
};