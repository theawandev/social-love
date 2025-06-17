// backend/server.js (Updated)
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${ PORT }`);
  console.log(`📊 Environment: ${ process.env.NODE_ENV || 'development' }`);
  console.log(`🔗 API URL: http://localhost:${ PORT }/api`);
  console.log(`📁 Uploads: http://localhost:${ PORT }/uploads`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${ signal } received, shutting down gracefully`);
  try {
    await require('./src/config/database').sequelize.close();
    console.log('Database connections closed');
    process.exit(0);
  }
  catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});