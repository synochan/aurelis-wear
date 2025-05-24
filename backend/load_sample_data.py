#!/usr/bin/env python
"""Script to load sample data into the database."""
import os
import sys
import django
from django.contrib.auth.models import User
from django.db import connections

def is_database_empty():
    """Check if the database is empty (no products)."""
    from products.models import Product
    return Product.objects.count() == 0

def load_sample_data():
    """Load sample data into the database if it's empty."""
    print("Setting up Django environment...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    
    # Check if database is empty before loading data
    if is_database_empty():
        print("Database is empty. Loading sample data...")
        
        # Create superuser if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            print("Created superuser 'admin' with password 'admin123'")
        
        # Import and run the sample data script
        try:
            from sample_data import load_data
            load_data()
            print("Sample data loaded successfully!")
        except Exception as e:
            print(f"Error loading sample data: {str(e)}")
    else:
        print("Database already contains data. Skipping sample data loading.")
    
    return True

if __name__ == "__main__":
    # Add the parent directory to the path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    load_sample_data() 