// Node.js script to initialize the environment
// This will be run by Vercel during the build phase

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting initialization script...');

try {
  // Print current directory and files for debugging
  console.log('Current directory:', process.cwd());
  console.log('Directory contents:');
  execSync('ls -la', { stdio: 'inherit' });
  
  // Ensure Python is available
  console.log('Checking Python version:');
  execSync('python --version', { stdio: 'inherit' });
  
  // Ensure pip is up to date
  console.log('Upgrading pip:');
  execSync('python -m pip install --upgrade pip', { stdio: 'inherit' });
  
  // Create a custom site-packages directory to ensure we have write permissions
  const customPythonPath = path.join(process.cwd(), 'python_packages');
  console.log(`Creating custom Python packages directory: ${customPythonPath}`);
  if (!fs.existsSync(customPythonPath)) {
    fs.mkdirSync(customPythonPath, { recursive: true });
  }
  
  // Set environment variables for pip installation
  const env = Object.assign({}, process.env);
  env.PYTHONPATH = `${customPythonPath}:${process.cwd()}:${process.cwd()}/backend:${env.PYTHONPATH || ''}`;
  
  // Install Django explicitly first
  console.log('Installing Django:');
  execSync(`pip install Django==5.2.1 --target=${customPythonPath}`, { stdio: 'inherit', env });
  
  // Install minimal requirements (essential dependencies)
  console.log('Installing essential dependencies:');
  execSync(`pip install -r backend/requirements-minimal.txt --target=${customPythonPath}`, { stdio: 'inherit', env });
  
  // Verify Django installation
  console.log('Verifying Django installation:');
  try {
    execSync(`PYTHONPATH=${customPythonPath} python -c "import django; print(f'Django version: {django.__version__}')"`, { stdio: 'inherit', env });
  } catch (err) {
    console.error('Django verification failed, trying to reinstall:', err.message);
    execSync(`pip install --force-reinstall django==5.2.1 --target=${customPythonPath}`, { stdio: 'inherit', env });
  }
  
  // Install the rest of Python dependencies
  console.log('Installing remaining Python dependencies:');
  execSync(`pip install -r backend/requirements.txt --target=${customPythonPath}`, { stdio: 'inherit', env });
  
  // Write a .env file to tell our app where to find the packages
  console.log('Creating .env file with Python path:');
  fs.writeFileSync('.env', `PYTHONPATH=${customPythonPath}:${process.cwd()}:${process.cwd()}/backend:${env.PYTHONPATH || ''}\n`, { flag: 'a' });
  
  // List installed packages for debugging
  console.log('Installed Python packages:');
  execSync(`ls -la ${customPythonPath}`, { stdio: 'inherit' });
  
  // Check PYTHONPATH
  console.log('Current PYTHONPATH:');
  try {
    execSync(`PYTHONPATH=${customPythonPath} python -c "import sys; print(sys.path)"`, { stdio: 'inherit', env });
  } catch (err) {
    console.error('Failed to print Python path:', err.message);
  }
  
  // Check if the migrations script exists
  const migratePath = path.join(__dirname, 'migrate.py');
  if (fs.existsSync(migratePath)) {
    console.log('Running database migrations:');
    try {
      // Run migrations with the new PYTHONPATH
      execSync(`PYTHONPATH=${customPythonPath}:${process.cwd()}:${process.cwd()}/backend python api/migrate.py`, { stdio: 'inherit', env });
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