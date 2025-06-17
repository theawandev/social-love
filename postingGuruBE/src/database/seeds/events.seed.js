// backend/src/database/seeds/events.seed.js
const { Event } = require('../../models');

const eventsData = [
  // US Events
  { name: "New Year's Day", description: "Start of the new year", event_date: "2024-01-01", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Martin Luther King Jr. Day", description: "Civil rights leader commemoration", event_date: "2024-01-15", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Presidents' Day", description: "Federal holiday honoring presidents", event_date: "2024-02-19", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Memorial Day", description: "Honoring military personnel who died", event_date: "2024-05-27", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Independence Day", description: "Declaration of Independence", event_date: "2024-07-04", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Labor Day", description: "Celebration of workers", event_date: "2024-09-02", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Columbus Day", description: "Christopher Columbus arrival", event_date: "2024-10-14", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Veterans Day", description: "Honoring military veterans", event_date: "2024-11-11", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Thanksgiving", description: "Day of thanksgiving", event_date: "2024-11-28", event_type: "holiday", country_code: "US", is_recurring: true },
  { name: "Christmas Day", description: "Christian holiday", event_date: "2024-12-25", event_type: "holiday", country_code: "US", is_recurring: true },

  // Pakistan Events
  { name: "Kashmir Day", description: "Solidarity with Kashmir", event_date: "2024-02-05", event_type: "holiday", country_code: "PK", is_recurring: true },
  { name: "Pakistan Day", description: "Pakistan Resolution Day", event_date: "2024-03-23", event_type: "holiday", country_code: "PK", is_recurring: true },
  { name: "Labour Day", description: "International Workers' Day", event_date: "2024-05-01", event_type: "holiday", country_code: "PK", is_recurring: true },
  { name: "Independence Day", description: "Independence from British rule", event_date: "2024-08-14", event_type: "holiday", country_code: "PK", is_recurring: true },
  { name: "Iqbal Day", description: "Allama Iqbal's birthday", event_date: "2024-11-09", event_type: "holiday", country_code: "PK", is_recurring: true },
  { name: "Quaid-e-Azam Birthday", description: "Muhammad Ali Jinnah's birthday", event_date: "2024-12-25", event_type: "holiday", country_code: "PK", is_recurring: true },

  // India Events
  { name: "Republic Day", description: "Constitution came into effect", event_date: "2024-01-26", event_type: "holiday", country_code: "IN", is_recurring: true },
  { name: "Independence Day", description: "Independence from British rule", event_date: "2024-08-15", event_type: "holiday", country_code: "IN", is_recurring: true },
  { name: "Gandhi Jayanti", description: "Mahatma Gandhi's birthday", event_date: "2024-10-02", event_type: "holiday", country_code: "IN", is_recurring: true },

  // International/Seasonal Events
  { name: "Valentine's Day", description: "Day of love", event_date: "2024-02-14", event_type: "observance", country_code: "US", is_recurring: true },
  { name: "International Women's Day", description: "Celebrating women", event_date: "2024-03-08", event_type: "observance", country_code: "US", is_recurring: true },
  { name: "Earth Day", description: "Environmental awareness", event_date: "2024-04-22", event_type: "observance", country_code: "US", is_recurring: true },
  { name: "Mother's Day", description: "Honoring mothers", event_date: "2024-05-12", event_type: "observance", country_code: "US", is_recurring: true },
  { name: "Father's Day", description: "Honoring fathers", event_date: "2024-06-16", event_type: "observance", country_code: "US", is_recurring: true },
  { name: "Halloween", description: "Trick or treat", event_date: "2024-10-31", event_type: "observance", country_code: "US", is_recurring: true },
  { name: "Black Friday", description: "Shopping day", event_date: "2024-11-29", event_type: "observance", country_code: "US", is_recurring: true },
  { name: "Cyber Monday", description: "Online shopping day", event_date: "2024-12-02", event_type: "observance", country_code: "US", is_recurring: true },

  // Seasonal Events
  { name: "Spring Equinox", description: "First day of spring", event_date: "2024-03-20", event_type: "seasonal", country_code: "US", is_recurring: true },
  { name: "Summer Solstice", description: "Longest day of year", event_date: "2024-06-21", event_type: "seasonal", country_code: "US", is_recurring: true },
  { name: "Autumn Equinox", description: "First day of autumn", event_date: "2024-09-22", event_type: "seasonal", country_code: "US", is_recurring: true },
  { name: "Winter Solstice", description: "Shortest day of year", event_date: "2024-12-21", event_type: "seasonal", country_code: "US", is_recurring: true }
];

const seedEvents = async () => {
  try {
    console.log('🌱 Seeding events...');

    // Clear existing events
    await Event.destroy({ where: {} });

    // Insert new events
    await Event.bulkCreate(eventsData);

    console.log(`✅ Successfully seeded ${eventsData.length} events`);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }
};

module.exports = { seedEvents, eventsData };