const cache = require('../utils/cache');
const logger = require('../utils/logger');

// Cache middleware for GET requests
const cacheMiddleware = (keyGenerator, ttl = cache.DEFAULT_TTL) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = typeof keyGenerator === 'function'
        ? keyGenerator(req)
        : keyGenerator;

      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        logger.info('Cache hit', { key: cacheKey, path: req.path });
        return res.json(cachedData);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, data, ttl).catch(error => {
            logger.error('Cache set failed', { key: cacheKey, error: error.message });
          });
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error: error.message });
      next(); // Continue without caching
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const invalidateCachePatterns = async () => {
      try {
        for (const pattern of patterns) {
          const key = typeof pattern === 'function' ? pattern(req) : pattern;
          await cache.del(key);
          logger.info('Cache invalidated', { key, method: req.method, path: req.path });
        }
      } catch (error) {
        logger.error('Cache invalidation failed', { error: error.message });
      }
    };

    // Override response methods
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCachePatterns();
      }
      return originalJson(data);
    };

    res.send = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCachePatterns();
      }
      return originalSend(data);
    };

    next();
  };
};

// User-specific cache key generator
const userCacheKey = (prefix) => (req) => `${prefix}:${req.user?.id}`;

// Query-based cache key generator
const queryCacheKey = (prefix) => (req) => {
  const queryString = Object.keys(req.query)
    .sort()
    .map(key => `${key}=${req.query[key]}`)
    .join('&');
  return `${prefix}:${req.user?.id}:${queryString}`;
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  userCacheKey,
  queryCacheKey
};