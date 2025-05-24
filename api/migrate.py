#!/usr/bin/env python
"""
Script to run Django migrations on Vercel deployment.
This file should be invoked during the build process.
"""
import os
import sys
import subprocess
import django

# Add the project root directory to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

def run_migrations():
    """Run Django migrations"""
    try:
        print("Setting up Django...")
        django.setup()
        
        from django.core.management import call_command
        
        print("Running migrations...")
        call_command('migrate')
        
        print("Migrations completed successfully!")
        return True
    except Exception as e:
        print(f"Error running migrations: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1) 