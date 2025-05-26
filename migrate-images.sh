#!/bin/bash

# Script to migrate images to Cloudinary

echo "Installing required packages..."
cd backend
pip install cloudinary django-cloudinary-storage

echo "Running migration script..."
python migrate_to_cloudinary.py

echo "Migration completed!" 