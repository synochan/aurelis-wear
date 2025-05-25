#!/bin/bash
# Comprehensive cleanup script for Aurelis Wear codebase

echo "Starting cleanup of Aurelis Wear codebase..."

# Remove Vercel-specific files and directories
echo "Removing Vercel-specific files and directories..."
rm -rf backend/.vercel
rm -f backend/.vercel-config.json
rm -f backend/.vercelignore
rm -f .env.vercel

# Remove redundant API directory (serverless functions no longer needed)
echo "Removing redundant API directory..."
rm -rf backend/api

# Remove cache and build artifacts
echo "Removing cache and build files..."
rm -rf backend/__pycache__
rm -rf backend/*/__pycache__
rm -rf backend/*/*/__pycache__
rm -rf backend/*/*/*/__pycache__
rm -rf frontend/.vercel
rm -rf frontend/dist
rm -rf frontend/node_modules

# Remove SQLite database (since we're using Neon PostgreSQL)
echo "Removing SQLite database..."
rm -f backend/db.sqlite3

# Remove any remaining temp files
echo "Removing temporary files..."
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete
find . -name "*.pyd" -delete
find . -name "__pycache__" -delete
find . -name ".DS_Store" -delete
find . -name "*.log" -delete

# Remove duplicate configuration files
echo "Removing duplicate configuration files..."
rm -f backend/requirements-minimal.txt  # Keep only requirements.txt

echo "Cleanup complete!" 