// Script to deploy frontend to Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const projectName = 'aurelis-wear';
const frontendDir = 'frontend';

console.log('Starting frontend deployment to Vercel...');

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
  
  // Create temporary frontend deployment configuration
  const frontendConfig = {
    name: projectName,
    scope: 'personal',
    regions: ['cdg1'],
    public: false,
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install',
    framework: 'vite',
    rewrites: [
      { 
        source: '/(.*)', 
        destination: '/index.html' 
      }
    ],
    env: {
      VITE_API_URL: 'https://aurelis-wear-api.vercel.app'
    }
  };
  
  // Write temporary vercel.json
  const tempConfigPath = path.join(frontendDir, 'vercel.config.json');
  fs.writeFileSync(tempConfigPath, JSON.stringify(frontendConfig, null, 2));
  
  console.log('Deploying frontend to Vercel...');
  
  // Change to frontend directory
  process.chdir(frontendDir);
  
  // Deploy to Vercel
  execSync(`vercel --prod --confirm --name ${projectName}`, { stdio: 'inherit' });
  
  // Clean up
  fs.unlinkSync('vercel.config.json');
  
  console.log('Frontend deployment complete!');
  console.log('Frontend URL: https://aurelis-wear.vercel.app');
} catch (error) {
  console.error('Error deploying frontend:', error);
  process.exit(1);
} 