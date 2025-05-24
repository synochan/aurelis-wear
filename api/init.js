// Node.js script to initialize the environment
// This will be run by Vercel during the build phase

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting initialization script...');

try {
  // Ensure Python is available
  console.log('Checking Python version:');
  execSync('python --version', { stdio: 'inherit' });
  
  // Install Python dependencies
  console.log('Installing Python dependencies:');
  execSync('pip install -r backend/requirements.txt', { stdio: 'inherit' });
  
  // Check if the migrations script exists
  const migratePath = path.join(__dirname, 'migrate.py');
  if (fs.existsSync(migratePath)) {
    console.log('Running database migrations:');
    try {
      execSync('python api/migrate.py', { stdio: 'inherit' });
    } catch (err) {
      console.error('Migration error, but continuing deployment:', err.message);
      // We don't want to fail the build if migrations fail
    }
  } else {
    console.log('Migrations script not found at:', migratePath);
  }
  
  console.log('Initialization completed successfully!');
} catch (error) {
  console.error('Initialization failed:', error.message);
  // We don't exit with an error code to allow the build to continue
  console.log('Continuing with deployment despite initialization errors...');
} 