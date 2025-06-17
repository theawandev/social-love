// backend/src/jobs/post-publisher.job.js
const { Post, PostTarget, SocialAccount, User } = require('../models');
const facebookService = require('../services/social-platforms/facebook.service');
const instagramService = require('../services/social-platforms/instagram.service');
const linkedinService = require('../services/social-platforms/linkedin.service');
const tiktokService = require('../services/social-platforms/tiktok.service');
const youtubeService = require('../services/social-platforms/youtube.service');
const notificationService = require('../services/notification.service');
const { PLATFORMS, POST_STATUS } = require('../utils/constants');

// Platform service mapping
const platformServices = {
  [PLATFORMS.FACEBOOK]: facebookService,
  [PLATFORMS.INSTAGRAM]: instagramService,
  [PLATFORMS.LINKEDIN]: linkedinService,
  [PLATFORMS.TIKTOK]: tiktokService,
  [PLATFORMS.YOUTUBE]: youtubeService
};

const process = async (job) => {
  const { postId } = job.data;

  try {
    console.log(`📤 Publishing post ${postId}...`);

    // Get post with all related data
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: PostTarget,
          as: 'targets',
          include: [{
            model: SocialAccount,
            as: 'socialAccount'
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name']
        }
      ]
    });

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    if (post.status !== POST_STATUS.SCHEDULED) {
      console.log(`⚠️ Post ${postId} is not scheduled, skipping`);
      return { postId, status: 'skipped', reason: 'not_scheduled' };
    }

    const results = [];
    let hasSuccess = false;
    let hasFailure = false;

    // Publish to each target platform
    for (const target of post.targets) {
      try {
        const service = platformServices[target.socialAccount.platform];
        if (!service) {
          throw new Error(`No service found for platform ${target.socialAccount.platform}`);
        }

        console.log(`📱 Publishing to ${target.socialAccount.platform} - ${target.socialAccount.account_name}`);

        // Prepare post data
        const postData = {
          content: post.content,
          title: post.title,
          postType: post.post_type,
          scheduledAt: post.scheduled_at
        };

        // Publish post
        const result = await service.publishPost(
          target.socialAccount.access_token,
          target.socialAccount.account_id,
          postData
        );

        // Update target status
        await target.update({
          status: 'published',
          platform_post_id: result.platformPostId,
          published_at: new Date(),
          error_message: null
        });

        results.push({
          platform: target.socialAccount.platform,
          accountName: target.socialAccount.account_name,
          success: true,
          platformPostId: result.platformPostId
        });

        hasSuccess = true;
        console.log(`✅ Successfully published to ${target.socialAccount.platform}`);

      } catch (error) {
        console.error(`❌ Failed to publish to ${target.socialAccount.platform}:`, error);

        // Update target status with error
        await target.update({
          status: 'failed',
          error_message: error.message,
          published_at: null
        });

        results.push({
          platform: target.socialAccount.platform,
          accountName: target.socialAccount.account_name,
          success: false,
          error: error.message
        });

        hasFailure = true;
      }
    }

    // Determine final post status
    let finalStatus;
    if (hasSuccess && !hasFailure) {
      finalStatus = POST_STATUS.PUBLISHED;
    } else if (hasSuccess && hasFailure) {
      finalStatus = 'partially_published';
    } else {
      finalStatus = POST_STATUS.FAILED;
    }

    // Update post status
    await post.update({
      status: finalStatus,
      published_at: hasSuccess ? new Date() : null
    });

    // Send notification if there were failures
    if (hasFailure) {
      await notificationService.sendPostFailureNotification(
        post.user,
        post,
        results.filter(r => !r.success).map(r => r.error).join(', ')
      );
    }

    console.log(`✅ Post ${postId} publishing completed with status: ${finalStatus}`);

    return {
      postId,
      status: finalStatus,
      results,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    };

  } catch (error) {
    console.error(`❌ Post publisher job failed for post ${postId}:`, error);

    // Update post status to failed
    try {
      await Post.update(
        { status: POST_STATUS.FAILED },
        { where: { id: postId } }
      );
    } catch (updateError) {
      console.error('Failed to update post status:', updateError);
    }

    throw error;
  }
};

module.exports = { process };