// backend/src/services/notification.service.js
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendPostFailureNotification = async (user, post, error) => {
  try {
    if (!process.env.SMTP_USER) {
      console.log('Email service not configured, skipping notification');
      return;
    }

    const transporter = createTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">❌ Post Publishing Failed</h2>
        <p>Hi ${user.first_name || user.username},</p>
        <p>We encountered an issue while publishing your post:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <strong>Post Title:</strong> ${post.title || 'Untitled'}<br>
          <strong>Content:</strong> ${post.content.substring(0, 100)}...<br>
          <strong>Error:</strong> ${error}
        </div>
        <p>Please review your post and try again, or contact support if the issue persists.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/posts/scheduled" 
             style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Post
          </a>
        </p>
        <p>Best regards,<br>Social Media Scheduler Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@socialmediascheduler.com',
      to: user.email,
      subject: '❌ Post Publishing Failed',
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Failure notification sent to ${user.email}`);
  } catch (error) {
    console.error('Send failure notification error:', error);
  }
};

const sendWelcomeEmail = async (user) => {
  try {
    if (!process.env.SMTP_USER) return;

    const transporter = createTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">🎉 Welcome to Social Media Scheduler!</h2>
        <p>Hi ${user.first_name || user.username},</p>
        <p>Welcome to Social Media Scheduler! We're excited to help you manage your social media presence more effectively.</p>
        <h3>Getting Started:</h3>
        <ol>
          <li>Connect your social media accounts</li>
          <li>Create your first post</li>
          <li>Schedule posts for optimal times</li>
          <li>Use AI to generate engaging content</li>
        </ol>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Get Started
          </a>
        </p>
        <p>Best regards,<br>The Social Media Scheduler Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@socialmediascheduler.com',
      to: user.email,
      subject: '🎉 Welcome to Social Media Scheduler!',
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Send welcome email error:', error);
  }
};

const sendMonthlyEventsEmail = async (user, events) => {
  try {
    if (!process.env.SMTP_USER) return;

    const transporter = createTransporter();

    const eventsList = events.map(event =>
      `<li><strong>${event.name}</strong> - ${event.event_date}</li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">🎉 Upcoming Events This Month</h2>
        <p>Hi ${user.first_name || user.username},</p>
        <p>Here are the upcoming events for this month in ${user.country_code}:</p>
        <ul style="list-style-type: none; padding: 0;">
          ${eventsList}
        </ul>
        <p>Don't forget to schedule your social media posts for these special occasions!</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Create Posts Now
          </a>
        </p>
        <p>Best regards,<br>Social Media Scheduler Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@socialmediascheduler.com',
      to: user.email,
      subject: '🎉 Monthly Events Reminder - Schedule Your Posts!',
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Monthly events email sent to ${user.email}`);
  } catch (error) {
    console.error('Send monthly events email error:', error);
  }
};

const sendPostSuccessNotification = async (user, post, platforms) => {
  try {
    if (!process.env.SMTP_USER) return;

    const transporter = createTransporter();

    const platformsList = platforms.map(p => p.platform).join(', ');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ Post Published Successfully!</h2>
        <p>Hi ${user.first_name || user.username},</p>
        <p>Your post has been successfully published to: <strong>${platformsList}</strong></p>
        <div style="background: #f0f9ff; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <strong>Post Title:</strong> ${post.title || 'Untitled'}<br>
          <strong>Content:</strong> ${post.content.substring(0, 100)}...
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/posts/history" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Post History
          </a>
        </p>
        <p>Best regards,<br>Social Media Scheduler Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@socialmediascheduler.com',
      to: user.email,
      subject: '✅ Post Published Successfully!',
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send success notification error:', error);
  }
};

module.exports = {
  sendPostFailureNotification,
  sendWelcomeEmail,
  sendMonthlyEventsEmail,
  sendPostSuccessNotification
};