#!/bin/bash

# Script to prepare and deploy to Vercel

# Ensure we're in the project root
echo "Working directory: $(pwd)"

# Create a public directory to ensure static assets are properly handled
mkdir -p frontend/public

# Copy the 404.html to the public directory for better error handling
cp frontend/public/404.html frontend/public/404.html 2>/dev/null || :

# Ensure the frontend/.env file has the correct API URL
cat > frontend/.env << EOF
VITE_API_URL=https://aurelis-wear-api.onrender.com
EOF

# Build the frontend locally to verify it works
echo "Building frontend to verify..."
cd frontend
npm install
npm run build

echo "Done!"
echo ""
echo "To deploy to Vercel, run:"
echo "vercel --prod"
echo ""
echo "Make sure you have the Vercel CLI installed (npm i -g vercel)" 