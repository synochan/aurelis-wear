#!/bin/bash

# Exit on error
set -e

# Echo commands
set -x

echo "Starting Django backend build process"

# Install dependencies
pip install -r requirements.txt

# Run manifest.py to ensure all Python modules are properly detected
echo "Running manifest.py to prepare Python modules for deployment..."
python manifest.py

# Collect static files (if needed)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Make the build script executable (just in case)
chmod +x build.sh

echo "Build completed for Django backend application" 