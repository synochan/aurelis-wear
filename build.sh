#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python deploy.py

# Print success message
echo "Build completed successfully!" 