"""
Proxy file to forward requests to the backend handler.
This file exists solely to satisfy Vercel's serverless function pattern.
"""

import os
import sys
import json
from http.server import BaseHTTPRequestHandler

# Add the parent directory to the path so we can import from backend
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Set up environment variables
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Define a fallback handler in case the backend import fails
class FallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_error_response()
    
    def do_POST(self):
        self.send_error_response()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def send_error_response(self):
        self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_message = {
            "error": "Backend handler not available",
            "details": "The serverless function could not import the backend handler"
        }
        self.wfile.write(json.dumps(error_message).encode('utf-8'))

# Try to import the handler from the backend module
try:
    from backend.index import handler
except ImportError as e:
    print(f"Error importing backend handler: {str(e)}")
    # Use the fallback handler if import fails
    handler = FallbackHandler 