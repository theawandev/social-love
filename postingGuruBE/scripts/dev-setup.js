// backend/scripts/dev-setup.js
const fs = require('fs');
const path = require('path');

const setupDevelopment = async () => {
  try {
    console.log('🚀 Setting up development environment...');

    // Check if .env exists
    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../.env.example');

    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      console.log('📄 Creating .env file from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created. Please update it with your values.');
    }

    // Create uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      fs.mkdirSync(path.join(uploadsDir, 'profiles'), { recursive: true });
      fs.mkdirSync(path.join(uploadsDir, 'thumbnails'), { recursive: true });
      console.log('✅ Upload directories created');
    }

    // Create logs directory
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('✅ Logs directory created');
    }

    console.log('🎉 Development environment setup completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your .env file with database and API credentials');
    console.log('2. Run: npm run db:migrate');
    console.log('3. Run: npm run db:seed');
    console.log('4. Run: npm run dev');

  }
  catch (error) {
    console.error('❌ Development setup failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  setupDevelopment();
}

module.exports = setupDevelopment;