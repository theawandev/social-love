// backend/src/utils/validator.js
const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validateUsername = (username) => {
  // Username should be 3-50 characters, alphanumeric and underscores only
  return /^[a-zA-Z0-9_]{3,50}$/.test(username);
};

const validatePassword = (password) => {
  // Password should be at least 6 characters with at least one uppercase, lowercase, and number
  return password.length >= 6 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);
};

const validateUrl = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

const validateUUID = (uuid) => {
  return validator.isUUID(uuid, 4);
};

const validatePostContent = (content, maxLength = 10000) => {
  return content && content.trim().length > 0 && content.length <= maxLength;
};

const validateDate = (date) => {
  return validator.isISO8601(date) && new Date(date) > new Date();
};

const validateCountryCode = (countryCode) => {
  return /^[A-Z]{2}$/.test(countryCode);
};

const validateTimezone = (timezone) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};

const sanitizeString = (str, maxLength = 255) => {
  if (!str) return '';
  return validator.escape(str.trim()).substring(0, maxLength);
};

const validateFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

const validateFileSize = (size, maxSize) => {
  return size <= maxSize;
};

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateUrl,
  validateUUID,
  validatePostContent,
  validateDate,
  validateCountryCode,
  validateTimezone,
  sanitizeString,
  validateFileType,
  validateFileSize
};