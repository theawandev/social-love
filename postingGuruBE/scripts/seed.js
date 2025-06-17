// backend/scripts/seed.js
const { sequelize } = require('../src/config/database');
const { seedEvents } = require('../src/database/seeds/events.seed');

const runSeeds = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Ensure database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Run seeds
    await seedEvents();

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeds();
}

module.exports = runSeeds;