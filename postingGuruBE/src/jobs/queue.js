// backend/src/jobs/queue.js
const Queue = require('bull');
const redis = require('../config/redis');
const PostPublisherJob = require('./post-publisher.job');
const { processMonthlyEmails } = require('./monthly-email.job');

// Queue configurations
const queueConfig = {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
};

// Create queues
const postQueue = new Queue('post publishing', queueConfig);
const emailQueue = new Queue('email notifications', queueConfig);
const maintenanceQueue = new Queue('maintenance tasks', queueConfig);

// Process jobs
postQueue.process('publish-post', 5, PostPublisherJob.process); // Process up to 5 jobs concurrently
emailQueue.process('monthly-events-email', 1, processMonthlyEmails);
emailQueue.process('post-failure-notification', 10, async (job) => {
  // Handle individual post failure notifications
  const { user, post, error } = job.data;
  const notificationService = require('../services/notification.service');
  await notificationService.sendPostFailureNotification(user, post, error);
});

// Queue event listeners
const setupQueueListeners = (queue, queueName) => {
  queue.on('completed', (job, result) => {
    console.log(`✅ ${ queueName } job ${ job.id } completed:`, result);
  });

  queue.on('failed', (job, err) => {
    console.error(`❌ ${ queueName } job ${ job.id } failed:`, err.message);
  });

  queue.on('stalled', (job) => {
    console.warn(`⚠️ ${ queueName } job ${ job.id } stalled`);
  });

  queue.on('progress', (job, progress) => {
    console.log(`📊 ${ queueName } job ${ job.id } progress: ${ progress }%`);
  });
};

// Setup listeners for all queues
setupQueueListeners(postQueue, 'Post Publishing');
setupQueueListeners(emailQueue, 'Email Notifications');
setupQueueListeners(maintenanceQueue, 'Maintenance');

// Schedule recurring jobs
const scheduleRecurringJobs = () => {
  // Monthly email reminders (first day of every month at 9 AM)
  emailQueue.add('monthly-events-email', {}, {
    repeat: { cron: '0 9 1 * *' },
    removeOnComplete: 5,
    removeOnFail: 10
  });

  // Daily cleanup of old jobs (every day at 2 AM)
  maintenanceQueue.add('cleanup-old-jobs', {}, {
    repeat: { cron: '0 2 * * *' },
    removeOnComplete: 1,
    removeOnFail: 3
  });

  console.log('📅 Recurring jobs scheduled');
};

// Queue management functions
const addPostPublishJob = async (postId, scheduledAt) => {
  const delay = scheduledAt.getTime() - Date.now();

  if (delay <= 0) {
    // Publish immediately
    return await postQueue.add('publish-post', { postId }, queueConfig.defaultJobOptions);
  }

  // Schedule for later
  return await postQueue.add('publish-post', { postId }, {
    ...queueConfig.defaultJobOptions,
    delay
  });
};

const cancelPostPublishJob = async (postId) => {
  const jobs = await postQueue.getJobs(['delayed', 'waiting']);
  const postJob = jobs.find(job => job.data.postId === postId);

  if (postJob) {
    await postJob.remove();
    console.log(`🗑️ Cancelled scheduled post ${ postId }`);
    return true;
  }

  return false;
};

const getQueueStats = async () => {
  try {
    const [postStats, emailStats, maintenanceStats] = await Promise.all([
      getQueueStatistics(postQueue),
      getQueueStatistics(emailQueue),
      getQueueStatistics(maintenanceQueue)
    ]);

    return {
      posts: postStats,
      emails: emailStats,
      maintenance: maintenanceStats,
      timestamp: new Date().toISOString()
    };
  }
  catch (error) {
    console.error('Get queue stats error:', error);
    return null;
  }
};

const getQueueStatistics = async (queue) => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
    queue.getDelayed()
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length
  };
};

// Cleanup function for graceful shutdown
const cleanup = async () => {
  console.log('🧹 Cleaning up job queues...');
  await Promise.all([
    postQueue.close(),
    emailQueue.close(),
    maintenanceQueue.close()
  ]);
  console.log('✅ Job queues cleaned up');
};

// Initialize recurring jobs when module is loaded
scheduleRecurringJobs();

module.exports = {
  postQueue,
  emailQueue,
  maintenanceQueue,
  addPostPublishJob,
  cancelPostPublishJob,
  getQueueStats,
  cleanup
};