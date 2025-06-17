// backend/src/utils/timezone.js
const moment = require('moment-timezone');

const convertToUserTimezone = (utcDate, userTimezone = 'UTC') => {
  return moment.utc(utcDate).tz(userTimezone).format();
};

const convertToUTC = (localDate, userTimezone = 'UTC') => {
  return moment.tz(localDate, userTimezone).utc().format();
};

const getOptimalPostingTimes = (platform, timezone = 'UTC') => {
  // Optimal posting times based on research (in 24-hour format)
  const optimalTimes = {
    facebook: [
      { hour: 9, minute: 0 },  // 9:00 AM
      { hour: 13, minute: 0 }, // 1:00 PM
      { hour: 15, minute: 0 }  // 3:00 PM
    ],
    instagram: [
      { hour: 11, minute: 0 }, // 11:00 AM
      { hour: 14, minute: 0 }, // 2:00 PM
      { hour: 17, minute: 0 }  // 5:00 PM
    ],
    linkedin: [
      { hour: 8, minute: 0 },  // 8:00 AM
      { hour: 12, minute: 0 }, // 12:00 PM
      { hour: 17, minute: 0 }  // 5:00 PM
    ],
    tiktok: [
      { hour: 6, minute: 0 },  // 6:00 AM
      { hour: 10, minute: 0 }, // 10:00 AM
      { hour: 19, minute: 0 }  // 7:00 PM
    ],
    youtube: [
      { hour: 14, minute: 0 }, // 2:00 PM
      { hour: 16, minute: 0 }, // 4:00 PM
      { hour: 20, minute: 0 }  // 8:00 PM
    ]
  };

  const times = optimalTimes[platform] || optimalTimes.facebook;

  return times.map(time => {
    const localTime = moment.tz(timezone).hour(time.hour).minute(time.minute);
    return {
      local: localTime.format('HH:mm'),
      utc: localTime.utc().format('HH:mm'),
      timestamp: localTime.utc().format()
    };
  });
};

const getNextOptimalTime = (platform, timezone = 'UTC') => {
  const optimalTimes = getOptimalPostingTimes(platform, timezone);
  const now = moment.tz(timezone);

  for (const time of optimalTimes) {
    const timeToday = moment.tz(timezone)
      .hour(parseInt(time.local.split(':')[0]))
      .minute(parseInt(time.local.split(':')[1]))
      .second(0);

    if (timeToday.isAfter(now)) {
      return timeToday.utc().format();
    }
  }

  // If no time today, return first time tomorrow
  const firstTime = optimalTimes[0];
  const tomorrow = moment.tz(timezone)
    .add(1, 'day')
    .hour(parseInt(firstTime.local.split(':')[0]))
    .minute(parseInt(firstTime.local.split(':')[1]))
    .second(0);

  return tomorrow.utc().format();
};

const isValidTimezone = (timezone) => {
  return moment.tz.names().includes(timezone);
};

const getTimezoneOffset = (timezone) => {
  return moment.tz(timezone).format('Z');
};

const formatDateForDisplay = (date, timezone = 'UTC', format = 'YYYY-MM-DD HH:mm') => {
  return moment.utc(date).tz(timezone).format(format);
};

module.exports = {
  convertToUserTimezone,
  convertToUTC,
  getOptimalPostingTimes,
  getNextOptimalTime,
  isValidTimezone,
  getTimezoneOffset,
  formatDateForDisplay
};