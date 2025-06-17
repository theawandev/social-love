// backend/src/utils/logger.js
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = logLevels[process.env.LOG_LEVEL] || logLevels.INFO;

const formatMessage = (level, message, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '';
  return `[${ timestamp }] [${ level }] ${ message } ${ metaString }\n`;
};

const writeToFile = (level, message, metadata) => {
  if (process.env.NODE_ENV === 'production') {
    const logFile = path.join(logsDir, `${ level.toLowerCase() }.log`);
    const formattedMessage = formatMessage(level, message, metadata);
    fs.appendFileSync(logFile, formattedMessage);
  }
};

const error = (message, metadata = {}) => {
  if (currentLogLevel >= logLevels.ERROR) {
    console.error(`❌ [ERROR] ${ message }`, metadata);
    writeToFile('ERROR', message, metadata);
  }
};

const warn = (message, metadata = {}) => {
  if (currentLogLevel >= logLevels.WARN) {
    console.warn(`⚠️ [WARN] ${ message }`, metadata);
    writeToFile('WARN', message, metadata);
  }
};

const info = (message, metadata = {}) => {
  if (currentLogLevel >= logLevels.INFO) {
    console.log(`ℹ️ [INFO] ${ message }`, metadata);
    writeToFile('INFO', message, metadata);
  }
};

const debug = (message, metadata = {}) => {
  if (currentLogLevel >= logLevels.DEBUG) {
    console.log(`🐛 [DEBUG] ${ message }`, metadata);
    writeToFile('DEBUG', message, metadata);
  }
};

const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${ req.method } ${ req.url } - ${ res.statusCode } - ${ duration }ms`;
    const metadata = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    if (res.statusCode >= 400) {
      error(message, metadata);
    }
    else {
      info(message, metadata);
    }
  });

  next();
};

module.exports = {
  error,
  warn,
  info,
  debug,
  logRequest
};