"""
WSGI config for aurelis_wear_shop project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

# Add the project directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.dirname(current_dir))

# Print current environment for debugging
print(f"Python version: {sys.version}")
print(f"Current directory: {current_dir}")
print(f"Python path: {sys.path}")
print(f"Environment variables: {list(os.environ.keys())}")

try:
    from django.core.wsgi import get_wsgi_application
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    application = get_wsgi_application()
    
    # For Vercel serverless deployment
    app = application
    
    print("Django WSGI application initialized successfully!")
except Exception as e:
    print(f"Error initializing Django: {str(e)}")
    raise 