#!/bin/bash

# Install required packages
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Print completion message
echo "Build completed successfully"