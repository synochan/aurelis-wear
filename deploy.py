#!/usr/bin/env python

"""
Database migration script for Vercel deployment.
This script runs migrations for the Django app when deployed to Vercel.
"""

import os
import sys
import django
from django.core.management import call_command

def main():
    """Run database migrations."""
    print("Starting database migration...")
    
    # Configure Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    # Add the current directory to the path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    # Setup Django
    django.setup()
    
    try:
        # Run migrations
        print("Running migrations...")
        call_command('migrate')
        print("Migrations completed successfully!")
        
        # You could add more commands here if needed
        # For example: loading fixtures, creating superuser, etc.
        
        return 0  # Success
    except Exception as e:
        print(f"Error during migration: {e}")
        return 1  # Failure

if __name__ == "__main__":
    sys.exit(main()) 