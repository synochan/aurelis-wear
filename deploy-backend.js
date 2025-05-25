// Script to deploy backend to Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const projectName = 'aurelis-wear-api';
const backendDir = 'backend';

console.log('Starting backend deployment to Vercel...');

try {
  // Ensure we're in the project root
  const rootDir = process.cwd();
  console.log(`Current directory: ${rootDir}`);
  
  // Make sure vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'inherit' });
  } catch (error) {
    console.log('Installing Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }
  
  // Create temporary backend deployment configuration
  const backendConfig = {
    name: projectName,
    scope: 'personal',
    regions: ['cdg1'],
    public: false,
    builds: [
      { src: "index.py", use: "@vercel/python" }
    ],
    routes: [
      { src: "/(.*)", dest: "index.py" }
    ],
    env: {
      PYTHON_VERSION: '3.9',
      DJANGO_SETTINGS_MODULE: 'backend.settings',
      DEBUG: 'False',
      ALLOWED_HOSTS: '.vercel.app,aurelis-wear-api.vercel.app,localhost,127.0.0.1',
      FRONTEND_URL: 'https://aurelis-wear.vercel.app'
    }
  };
  
  // Write temporary vercel.json
  const tempConfigPath = path.join(backendDir, 'vercel.config.json');
  fs.writeFileSync(tempConfigPath, JSON.stringify(backendConfig, null, 2));
  
  console.log('Deploying backend to Vercel...');
  
  // Change to backend directory
  process.chdir(backendDir);
  
  // Deploy to Vercel
  execSync(`vercel --prod --yes --name ${projectName}`, { stdio: 'inherit' });
  
  // Clean up
  fs.unlinkSync('vercel.config.json');
  
  console.log('Backend deployment complete!');
  console.log('Backend API URL: https://aurelis-wear-api.vercel.app');
} catch (error) {
  console.error('Error deploying backend:', error);
  process.exit(1);
} 