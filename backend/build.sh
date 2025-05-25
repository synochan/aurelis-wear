#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Create static directory if it doesn't exist
mkdir -p static

# Print debug information
echo "Build completed successfully" 