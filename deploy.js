// Main deployment script for both frontend and backend
const { execSync } = require('child_process');

console.log('Starting deployment of Aurelis Wear application...');
console.log('---------------------------------------------');

// First deploy the backend
try {
  console.log('Step 1: Deploying backend API to aurelis-wear-api.vercel.app');
  console.log('---------------------------------------------');
  execSync('node deploy-backend.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Backend deployment failed:', error.message);
  process.exit(1);
}

console.log('\n');
console.log('---------------------------------------------');

// Then deploy the frontend
try {
  console.log('Step 2: Deploying frontend to aurelis-wear.vercel.app');
  console.log('---------------------------------------------');
  execSync('node deploy-frontend.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Frontend deployment failed:', error.message);
  process.exit(1);
}

console.log('\n');
console.log('---------------------------------------------');
console.log('Deployment complete!');
console.log('Frontend: https://aurelis-wear.vercel.app');
console.log('Backend API: https://aurelis-wear-api.vercel.app');
console.log('---------------------------------------------'); 