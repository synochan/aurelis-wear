// Script to verify frontend build output
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const frontendDir = 'frontend';

console.log('Verifying frontend build process...');

try {
  // Ensure we're in the project root
  const rootDir = process.cwd();
  console.log(`Current directory: ${rootDir}`);
  
  // Change to frontend directory
  process.chdir(frontendDir);
  console.log(`Moved to frontend directory: ${process.cwd()}`);
  
  // Clean any existing build output
  if (fs.existsSync('dist')) {
    console.log('Cleaning existing dist directory...');
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Run build command
  console.log('Running build command...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verify dist directory exists
  if (fs.existsSync('dist')) {
    console.log('✅ SUCCESS: dist directory was created by build process');
    
    // List contents of dist
    console.log('Contents of dist directory:');
    const distFiles = fs.readdirSync('dist');
    distFiles.forEach(file => {
      const stats = fs.statSync(path.join('dist', file));
      if (stats.isDirectory()) {
        console.log(`- 📁 ${file}/`);
      } else {
        console.log(`- 📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      }
    });
    
    // Check for index.html
    if (fs.existsSync('dist/index.html')) {
      console.log('✅ Found index.html in dist directory');
    } else {
      console.error('❌ ERROR: index.html not found in dist directory');
    }
    
    // Check for assets directory
    if (fs.existsSync('dist/assets')) {
      console.log('✅ Found assets directory');
    } else {
      console.warn('⚠️ Warning: assets directory not found in dist');
    }
    
  } else {
    console.error('❌ ERROR: dist directory was NOT created by build process');
    process.exit(1);
  }

  console.log('Build verification completed successfully!');
} catch (error) {
  console.error('Error during build verification:', error);
  process.exit(1);
} 