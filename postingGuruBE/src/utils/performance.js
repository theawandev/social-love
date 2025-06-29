const logger = require('./logger');

// Performance monitoring decorator
const monitor = (name) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const start = process.hrtime.bigint();
      const memBefore = process.memoryUsage();

      try {
        const result = await originalMethod.apply(this, args);
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        const memAfter = process.memoryUsage();

        logger.info('Performance monitor', {
          operation: `${name}.${propertyKey}`,
          duration: `${duration.toFixed(2)}ms`,
          memoryDelta: {
            rss: ((memAfter.rss - memBefore.rss) / 1024 / 1024).toFixed(2) + 'MB',
            heapUsed: ((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2) + 'MB'
          }
        });

        return result;
      } catch (error) {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000;

        logger.error('Performance monitor - operation failed', {
          operation: `${name}.${propertyKey}`,
          duration: `${duration.toFixed(2)}ms`,
          error: error.message
        });

        throw error;
      }
    };

    return descriptor;
  };
};

// Simple performance timing utility
const time = (label) => {
  const start = process.hrtime.bigint();

  return {
    end: () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000;
      logger.info('Performance timing', {
        label,
        duration: `${duration.toFixed(2)}ms`
      });
      return duration;
    }
  };
};

// Memory usage reporter
const reportMemoryUsage = (label = 'Memory Usage') => {
  const usage = process.memoryUsage();
  logger.info(label, {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)}MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`
  });
};

// Database query performance monitoring
const monitorDbQuery = (query, params = {}) => {
  const timer = time(`DB Query: ${query.substring(0, 50)}...`);

  return {
    end: (rowCount = 0) => {
      const duration = timer.end();
      logger.info('Database query completed', {
        query: query.substring(0, 100),
        params: Object.keys(params).length,
        rowCount,
        duration: `${duration.toFixed(2)}ms`
      });
    }
  };
};

// API endpoint performance middleware
const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint();
  const startMem = process.memoryUsage();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000;
    const endMem = process.memoryUsage();

    logger.info('API Performance', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      memoryDelta: `${((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
      userAgent: req.get('User-Agent')?.substring(0, 50)
    });
  });

  next();
};

module.exports = {
  monitor,
  time,
  reportMemoryUsage,
  monitorDbQuery,
  performanceMiddleware
};
