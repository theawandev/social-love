// backend/src/app.js (Updated with Sequelize)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const { sequelize, connectDB } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const Queue = require('bull');
const PostPublisherJob = require('./jobs/post-publisher.job');
const { processMonthlyEmails } = require('./jobs/monthly-email.job');
require('dotenv').config();

const app = express();

// Initialize database connection
connectDB();

// Sync database models (in development)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true }).then(() => {
    console.log('📊 Database models synchronized');
  }).catch(error => {
    console.error('❌ Database sync failed:', error);
  });
}

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport middleware
app.use(passport.initialize());

// Static files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

// Initialize job queues
const postQueue = new Queue('post publishing', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD
  }
});

const emailQueue = new Queue('email notifications', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD
  }
});

// Process jobs
postQueue.process('publish-post', PostPublisherJob.process);
emailQueue.process('monthly-events-email', processMonthlyEmails);

// Queue event listeners
postQueue.on('completed', (job, result) => {
  console.log(`✅ Post publishing job ${ job.id } completed:`, result);
});

postQueue.on('failed', (job, err) => {
  console.error(`❌ Post publishing job ${ job.id } failed:`, err);
});

emailQueue.on('completed', (job, result) => {
  console.log(`✅ Email job ${ job.id } completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${ job.id } failed:`, err);
});

// Schedule monthly email job (first day of every month at 9 AM)
emailQueue.add('monthly-events-email', {}, {
  repeat: { cron: '0 9 1 * *' },
  removeOnComplete: 5,
  removeOnFail: 10
});

module.exports = app;