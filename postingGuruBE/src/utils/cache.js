const redis = require('../config/redis');
const { deepClone } = require('./helpers');
const logger = require('./logger');

const DEFAULT_TTL = 3600; // 1 hour in seconds

const set = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const serializedValue = JSON.stringify(value);
    await redis.setex(key, ttl, serializedValue);
    logger.debug('Cache set', { key, ttl });
    return true;
  } catch (error) {
    logger.error('Cache set error', { key, error: error.message });
    return false;
  }
};

const get = async (key) => {
  try {
    const value = await redis.get(key);
    if (value) {
      logger.debug('Cache hit', { key });
      return JSON.parse(value);
    }
    logger.debug('Cache miss', { key });
    return null;
  } catch (error) {
    logger.error('Cache get error', { key, error: error.message });
    return null;
  }
};

const del = async (key) => {
  try {
    const result = await redis.del(key);
    logger.debug('Cache delete', { key, deleted: result > 0 });
    return result > 0;
  } catch (error) {
    logger.error('Cache delete error', { key, error: error.message });
    return false;
  }
};

const exists = async (key) => {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Cache exists error', { key, error: error.message });
    return false;
  }
};

const flush = async () => {
  try {
    await redis.flushdb();
    logger.info('Cache flushed');
    return true;
  } catch (error) {
    logger.error('Cache flush error', { error: error.message });
    return false;
  }
};

const mget = async (keys) => {
  try {
    const values = await redis.mget(keys);
    const result = {};

    keys.forEach((key, index) => {
      const value = values[index];
      result[key] = value ? JSON.parse(value) : null;
    });

    logger.debug('Cache mget', { keys: keys.length });
    return result;
  } catch (error) {
    logger.error('Cache mget error', { keys, error: error.message });
    return {};
  }
};

const mset = async (keyValuePairs, ttl = DEFAULT_TTL) => {
  try {
    const pipeline = redis.pipeline();

    Object.entries(keyValuePairs).forEach(([key, value]) => {
      const serializedValue = JSON.stringify(value);
      pipeline.setex(key, ttl, serializedValue);
    });

    await pipeline.exec();
    logger.debug('Cache mset', { keys: Object.keys(keyValuePairs).length, ttl });
    return true;
  } catch (error) {
    logger.error('Cache mset error', { error: error.message });
    return false;
  }
};

const increment = async (key, amount = 1) => {
  try {
    const result = await redis.incrby(key, amount);
    logger.debug('Cache increment', { key, amount, newValue: result });
    return result;
  } catch (error) {
    logger.error('Cache increment error', { key, error: error.message });
    return null;
  }
};

// Cache wrapper for functions
const cacheWrapper = (fn, keyGenerator, ttl = DEFAULT_TTL) => {
  return async (...args) => {
    const cacheKey = keyGenerator(...args);

    // Try to get from cache first
    const cachedResult = await get(cacheKey);
    if (cachedResult !== null) {
      return deepClone(cachedResult);
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      await set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      logger.error('Cache wrapper execution error', {
        cacheKey,
        error: error.message
      });
      throw error;
    }
  };
};

module.exports = {
  set,
  get,
  del,
  exists,
  flush,
  mget,
  mset,
  increment,
  cacheWrapper,
  DEFAULT_TTL
};