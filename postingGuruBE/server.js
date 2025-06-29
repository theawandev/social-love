const app = require('./src/app');
const logger = require('./src/utils/logger');
const { reportMemoryUsage } = require('./src/utils/performance');

const PORT = process.env.PORT || 5000;

// Report initial memory usage
reportMemoryUsage('Server startup');

// Start server
const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    apiUrl: `http://localhost:${ PORT }/api`,
    uploadsUrl: `http://localhost:${ PORT }/uploads`,
    nodeVersion: process.version,
    platform: process.platform
  });

  // Report memory usage after startup
  setTimeout(() => reportMemoryUsage('Server ready'), 1000);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${ signal } received, initiating graceful shutdown`);

  try {
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connections
    await require('./src/config/database').sequelize.close();
    logger.info('Database connections closed');

    // Clean up job queues
    const { cleanup } = require('./src/jobs/queue');
    await cleanup();

    // Close Redis connection
    const redis = require('./src/config/redis');
    await redis.quit();
    logger.info('Redis connection closed');

    logger.info('Graceful shutdown completed');
    process.exit(0);
  }
  catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception - shutting down', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection - shutting down', {
    reason: reason?.message || reason,
    promise: promise.toString()
  });
  process.exit(1);
});

// Memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;

  // Log warning if memory usage is high
  if (heapUsedMB > 500) {
    logger.warn('High memory usage detected', {
      heapUsed: `${ heapUsedMB.toFixed(2) }MB`,
      rss: `${ (usage.rss / 1024 / 1024).toFixed(2) }MB`
    });
  }
}, 60000); // Check every minute

module.exports = server;