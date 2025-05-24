#!/usr/bin/env python
"""Django migration script to run during Vercel deployment."""
import os
import sys
import subprocess
import django
from django.conf import settings
from django.core.management import call_command

def run_migrations():
    """Run database migrations and create a superuser if needed."""
    print("Setting up Django environment...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    
    print("Running migrations...")
    call_command('migrate')
    
    print("Migrations completed successfully!")
    
    # Load sample data after migrations
    try:
        from backend.load_sample_data import load_sample_data
        load_sample_data()
    except Exception as e:
        print(f"Error loading sample data: {str(e)}")
    
    return True

if __name__ == "__main__":
    # Add the parent directory to the path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    run_migrations() 