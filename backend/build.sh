#!/bin/bash

# Exit on error
set -e

# Install dependencies
pip install -r requirements.txt

# Collect static files (if needed)
python manage.py collectstatic --noinput

echo "Build completed for Django backend application" 