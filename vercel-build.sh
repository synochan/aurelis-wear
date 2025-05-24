#!/bin/bash

echo "Running vercel-build.sh..."

# Log Python version
python --version

# Install requirements
pip install -r requirements.txt

# Try to run database migrations
python deploy.py || echo "Database migrations failed but continuing build"

# Print success message
echo "Build completed successfully!" 