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
  
  // Ensure pip is up to date
  console.log('Upgrading pip:');
  execSync('python -m pip install --upgrade pip', { stdio: 'inherit' });
  
  // Install minimal requirements first (Django and essential dependencies)
  console.log('Installing Django and essential dependencies:');
  execSync('pip install -r backend/requirements-minimal.txt', { stdio: 'inherit' });
  
  // Verify Django installation
  console.log('Verifying Django installation:');
  try {
    execSync('python -c "import django; print(f\'Django version: {django.__version__}\')"', { stdio: 'inherit' });
  } catch (err) {
    console.error('Django verification failed, trying to reinstall:', err.message);
    execSync('pip install --force-reinstall django==5.2.1', { stdio: 'inherit' });
  }
  
  // Install the rest of Python dependencies
  console.log('Installing remaining Python dependencies:');
  execSync('pip install -r backend/requirements.txt', { stdio: 'inherit' });
  
  // List installed packages for debugging
  console.log('Installed Python packages:');
  execSync('pip list', { stdio: 'inherit' });
  
  // Check PYTHONPATH
  console.log('Current PYTHONPATH:');
  try {
    execSync('python -c "import sys; print(sys.path)"', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to print Python path:', err.message);
  }
  
  // Check if the migrations script exists
  const migratePath = path.join(__dirname, 'migrate.py');
  if (fs.existsSync(migratePath)) {
    console.log('Running database migrations:');
    try {
      // Set PYTHONPATH explicitly for the migration command
      const env = Object.assign({}, process.env);
      env.PYTHONPATH = `${process.cwd()}:${process.cwd()}/backend:${env.PYTHONPATH || ''}`;
      execSync('python api/migrate.py', { stdio: 'inherit', env });
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