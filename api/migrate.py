#!/usr/bin/env python
"""
Script to run Django migrations on Vercel deployment.
This file should be invoked during the build process.
"""
import os
import sys
import traceback
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
        
        # Print database configuration (without sensitive data)
        from django.conf import settings
        db_settings = settings.DATABASES.get('default', {})
        print(f"Database engine: {db_settings.get('ENGINE')}")
        print(f"Database name: {db_settings.get('NAME')}")
        print(f"Database host: {db_settings.get('HOST')}")
        
        from django.core.management import call_command
        
        print("Running migrations...")
        call_command('migrate')
        
        # Create superuser if needed
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Check if we need to create a superuser (only on initial setup)
        if not User.objects.filter(username='admin').exists():
            print("Creating superuser...")
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password=os.environ.get('ADMIN_PASSWORD', 'admin12345')
            )
            print("Superuser created successfully!")
        
        print("Migrations completed successfully!")
        return True
    except Exception as e:
        print(f"Error running migrations: {str(e)}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print(f"Starting migration script from {os.path.abspath(__file__)}")
    print(f"Python version: {sys.version}")
    print(f"PYTHONPATH: {sys.path}")
    success = run_migrations()
    sys.exit(0 if success else 1) 