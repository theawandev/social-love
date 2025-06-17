// backend/scripts/migrate.js
const { sequelize } = require('../src/config/database');
const fs = require('fs').promises;
const path = require('path');

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');

    // Ensure database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ force: process.env.FORCE_SYNC === 'true' });
    console.log('✅ Database tables synchronized');

    // Run custom SQL migrations if any
    const migrationsDir = path.join(__dirname, '../src/database/migrations');
    try {
      const migrationFiles = await fs.readdir(migrationsDir);
      const sqlFiles = migrationFiles.filter(file => file.endsWith('.sql'));

      for (const file of sqlFiles.sort()) {
        console.log(`📄 Running migration: ${file}`);
        const sqlContent = await fs.readFile(path.join(migrationsDir, file), 'utf8');
        await sequelize.query(sqlContent);
        console.log(`✅ Migration completed: ${file}`);
      }
    } catch (error) {
      console.log('ℹ️ No additional SQL migrations found or error reading migrations directory');
    }

    console.log('🎉 Database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;


