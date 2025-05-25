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
        source: "/assets/(.*)", 
        destination: "/assets/$1" 
      },
      { 
        source: "/(.*)", 
        destination: "/index.html" 
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
  
  // First, build locally to verify the dist directory is created
  try {
    console.log('Building frontend locally to verify dist directory...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Check if dist directory exists
    if (fs.existsSync('dist')) {
      console.log('✅ dist directory successfully created');
    } else {
      console.error('❌ dist directory was not created by the build process');
      process.exit(1);
    }
  } catch (buildError) {
    console.error('Error during local build:', buildError);
    process.exit(1);
  }
  
  // Deploy to Vercel
  execSync(`vercel --prod --yes --name ${projectName}`, { stdio: 'inherit' });
  
  // Clean up
  fs.unlinkSync('vercel.config.json');
  
  console.log('Frontend deployment complete!');
  console.log('Frontend URL: https://aurelis-wear.vercel.app');
} catch (error) {
  console.error('Error deploying frontend:', error);
  process.exit(1);
} 