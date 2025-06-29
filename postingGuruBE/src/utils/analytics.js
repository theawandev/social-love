const { groupBy, formatNumber } = require('./helpers');
const logger = require('./logger');

const calculateEngagementRate = (likes, comments, shares, followers) => {
  if (!followers || followers === 0) return 0;
  const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0);
  return ((totalEngagement / followers) * 100).toFixed(2);
};

const calculateReachRate = (reach, followers) => {
  if (!followers || followers === 0) return 0;
  return ((reach / followers) * 100).toFixed(2);
};

const getBestPerformingPosts = (posts, metric = 'engagement') => {
  return posts
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, 10);
};

const getPostPerformanceByPlatform = (posts) => {
  const grouped = groupBy(posts, 'platform');
  const performance = {};

  Object.keys(grouped).forEach(platform => {
    const platformPosts = grouped[platform];
    const totalPosts = platformPosts.length;
    const avgEngagement = platformPosts.reduce((sum, post) =>
      sum + (post.engagement || 0), 0) / totalPosts;
    const avgReach = platformPosts.reduce((sum, post) =>
      sum + (post.reach || 0), 0) / totalPosts;

    performance[platform] = {
      totalPosts,
      avgEngagement: formatNumber(Math.round(avgEngagement)),
      avgReach: formatNumber(Math.round(avgReach)),
      bestPost: getBestPerformingPosts(platformPosts, 'engagement')[0]
    };
  });

  return performance;
};

const getOptimalPostingTimes = (posts) => {
  const timeSlots = {};

  posts.forEach(post => {
    if (post.published_at) {
      const hour = new Date(post.published_at).getHours();
      const timeSlot = `${hour}:00-${hour + 1}:00`;

      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = { posts: 0, totalEngagement: 0 };
      }

      timeSlots[timeSlot].posts++;
      timeSlots[timeSlot].totalEngagement += (post.engagement || 0);
    }
  });

  // Calculate average engagement per time slot
  Object.keys(timeSlots).forEach(slot => {
    timeSlots[slot].avgEngagement =
      timeSlots[slot].totalEngagement / timeSlots[slot].posts;
  });

  // Sort by average engagement
  return Object.entries(timeSlots)
    .sort(([,a], [,b]) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5)
    .map(([time, data]) => ({ time, ...data }));
};

const generatePerformanceReport = (posts, period = '30d') => {
  try {
    const now = new Date();
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    const filteredPosts = posts.filter(post =>
      post.published_at && new Date(post.published_at) >= startDate
    );

    const totalPosts = filteredPosts.length;
    const totalEngagement = filteredPosts.reduce((sum, post) =>
      sum + (post.engagement || 0), 0);
    const totalReach = filteredPosts.reduce((sum, post) =>
      sum + (post.reach || 0), 0);

    const report = {
      period,
      summary: {
        totalPosts,
        totalEngagement: formatNumber(totalEngagement),
        totalReach: formatNumber(totalReach),
        avgEngagementPerPost: totalPosts > 0 ?
          formatNumber(Math.round(totalEngagement / totalPosts)) : 0
      },
      platformPerformance: getPostPerformanceByPlatform(filteredPosts),
      bestPerformingPosts: getBestPerformingPosts(filteredPosts),
      optimalPostingTimes: getOptimalPostingTimes(filteredPosts),
      generatedAt: now.toISOString()
    };

    logger.info('Performance report generated', {
      period,
      postsAnalyzed: totalPosts
    });

    return report;
  } catch (error) {
    logger.error('Performance report generation failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  calculateEngagementRate,
  calculateReachRate,
  getBestPerformingPosts,
  getPostPerformanceByPlatform,
  getOptimalPostingTimes,
  generatePerformanceReport
};