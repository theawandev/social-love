// backend/src/jobs/monthly-email.job.js
const { User, Event } = require('../models');
const { sendMonthlyEventsEmail } = require('../services/email.service');

const processMonthlyEmails = async (job) => {
  try {
    console.log('Processing monthly events emails...');

    // Get all active users
    const users = await User.findAll({
      where: { is_active: true },
      attributes: ['id', 'email', 'first_name', 'username', 'country_code']
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let emailsSent = 0;

    for (const user of users) {
      try {
        // Get events for user's country this month
        const events = await Event.findAll({
          where: {
            country_code: user.country_code,
            event_date: {
              $gte: new Date(currentYear, currentMonth - 1, 1),
              $lt: new Date(currentYear, currentMonth, 1)
            }
          },
          order: [['event_date', 'ASC']],
          limit: 10
        });

        if (events.length > 0) {
          await sendMonthlyEventsEmail(user, events);
          emailsSent++;
        }

        // Add small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send email to user ${user.id}:`, error);
      }
    }

    console.log(`Monthly emails job completed. Sent ${emailsSent} emails.`);
    return { emailsSent, totalUsers: users.length };
  } catch (error) {
    console.error('Monthly emails job failed:', error);
    throw error;
  }
};

module.exports = { processMonthlyEmails };