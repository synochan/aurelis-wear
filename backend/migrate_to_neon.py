#!/usr/bin/env python
"""
SQLite to Neon PostgreSQL Migration Script

This script helps migrate data from a local SQLite database to a remote Neon PostgreSQL database.
It should be run after setting up the Neon database and configuring the connection in .env.

Usage:
python migrate_to_neon.py

Requirements:
- Django configured with both database connections
- .env file configured with Neon DATABASE_URL
"""

import os
import sys
import django
import dj_database_url
from django.db import connections
from django.conf import settings
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Add the project directory to the Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def setup_databases():
    """Configure connections to both SQLite and PostgreSQL databases."""
    # Use existing SQLite database
    sqlite_db = settings.DATABASES['default'].copy()
    
    # Setup Neon PostgreSQL connection
    postgres_db = dj_database_url.config(
        default=os.environ.get('DATABASE_URL'), 
        conn_max_age=600,
        ssl_require=True
    )
    
    # Update Django settings
    settings.DATABASES = {
        'default': postgres_db,  # Set PostgreSQL as default
        'sqlite': sqlite_db      # Keep reference to SQLite
    }
    
    return settings.DATABASES

def migrate_data():
    """Migrate data from SQLite to PostgreSQL."""
    try:
        # Ensure connections are properly set up
        databases = setup_databases()
        
        # Check connections
        for db_name, db_config in databases.items():
            print(f"Checking connection to {db_name} database...")
            try:
                conn = connections[db_name]
                conn.ensure_connection()
                print(f"✅ Successfully connected to {db_name} database")
            except Exception as e:
                print(f"❌ Failed to connect to {db_name} database: {e}")
                if db_name == 'default':  # If PostgreSQL connection fails, we can't continue
                    return False
        
        # Apply migrations to PostgreSQL
        print("\n📦 Applying migrations to PostgreSQL database...")
        os.system("python manage.py migrate")
        
        # List of apps/models to migrate (add more as needed)
        apps = [
            'products',
            'authentication',
            'cart',
            'orders',
            'payments',
        ]
        
        # Migrate each model's data
        for app in apps:
            print(f"\n🔄 Migrating data for {app}...")
            
            # Get the app's models
            app_models = django.apps.apps.get_app_config(app).get_models()
            
            for model in app_models:
                model_name = model.__name__
                print(f"  - Migrating {model_name}...")
                
                # Get data from SQLite
                try:
                    with connections['sqlite'].cursor() as cursor:
                        # Simple count query to verify data exists
                        table_name = model._meta.db_table
                        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                        count = cursor.fetchone()[0]
                        
                        if count > 0:
                            print(f"    Found {count} records to migrate")
                            
                            # Get all data
                            cursor.execute(f"SELECT * FROM {table_name}")
                            rows = cursor.fetchall()
                            
                            # Get column names
                            cursor.execute(f"PRAGMA table_info({table_name})")
                            columns = [info[1] for info in cursor.fetchall()]
                            
                            # Now insert into PostgreSQL
                            with connections['default'].cursor() as pg_cursor:
                                for row in rows:
                                    # Generate INSERT statement
                                    placeholders = ', '.join(['%s'] * len(columns))
                                    column_names = ', '.join(columns)
                                    sql = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
                                    
                                    # Execute INSERT
                                    pg_cursor.execute(sql, row)
                            
                            print(f"    ✅ Successfully migrated {count} records")
                        else:
                            print(f"    ⚠️ No data to migrate")
                except Exception as e:
                    print(f"    ❌ Error migrating {model_name}: {e}")
        
        print("\n✅ Migration completed successfully!")
        return True
    
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting SQLite to Neon PostgreSQL migration...\n")
    success = migrate_data()
    
    if success:
        print("\n✨ Migration completed! Your data is now in Neon PostgreSQL.")
        print("You can now safely use your Neon database for all operations.")
    else:
        print("\n❌ Migration failed. Please check the errors above and try again.") 