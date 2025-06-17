// backend/src/services/email.service.js
const nodemailer = require('nodemailer');

// Create transporter
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

// Send monthly events email
const sendMonthlyEventsEmail = async (user, events) => {
  try {
    const transporter = createTransporter();

    const eventsList = events.map(event =>
      `<li><strong>${event.name}</strong> - ${event.event_date}</li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 Upcoming Events This Month</h2>
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
    console.log(`Monthly events email sent to ${user.email}`);
  } catch (error) {
    console.error('Send email error:', error);
    throw error;
  }
};

// Send post failure notification
const sendPostFailureNotification = async (user, post, error) => {
  try {
    const transporter = createTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>❌ Post Publishing Failed</h2>
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
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@socialmediascheduler.com',
      to: user.email,
      subject: '❌ Post Publishing Failed',
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Send failure notification error:', error);
  }
};

module.exports = {
  sendMonthlyEventsEmail,
  sendPostFailureNotification
};

