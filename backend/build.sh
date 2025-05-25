#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Load sample data if needed (uncomment if you want to load sample data)
# python load_sample_data.py

# Create static directory if it doesn't exist
mkdir -p static

# Print debug information
echo "Build completed successfully" 