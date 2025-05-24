# api/index.py
import os
import sys

# Add the backend directory to the path (adjust path if needed)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from backend.wsgi import get_wsgi_application
application = get_wsgi_application()

def handler(environ, start_response):
    return application(environ, start_response)
