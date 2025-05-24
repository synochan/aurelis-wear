import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler

# Print system path for debugging
print(f"Initial sys.path: {sys.path}")

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Add paths to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)
sys.path.insert(0, os.path.join(parent_dir, 'backend'))
print(f"Updated sys.path: {sys.path}")

try:
    print("Attempting to import Django...")
    import django
    print(f"Django imported successfully: {django.__version__}")
    
    from django.core.wsgi import get_wsgi_application
    import io

    # Create the WSGI application
    django_app = get_wsgi_application()
    print("Django application initialized successfully")
except Exception as e:
    print(f"Error initializing Django application: {str(e)}")
    traceback.print_exc()
    raise e

# Vercel serverless handler
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.handle_request()
        
    def do_POST(self):
        self.handle_request()
        
    def do_PUT(self):
        self.handle_request()
        
    def do_DELETE(self):
        self.handle_request()
        
    def do_OPTIONS(self):
        # Handle preflight CORS requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')  # 24 hours
        self.end_headers()
        
    def handle_request(self):
        try:
            # Log request details for debugging
            print(f"Handling {self.command} request for path: {self.path}")
            
            # Create a WSGI environment
            environ = {
                'wsgi.input': io.BytesIO(self.rfile.read(int(self.headers.get('Content-Length', 0)))),
                'wsgi.errors': sys.stderr,
                'wsgi.version': (1, 0),
                'wsgi.multithread': False,
                'wsgi.multiprocess': False,
                'wsgi.run_once': False,
                'wsgi.url_scheme': 'https',
                'REQUEST_METHOD': self.command,
                'PATH_INFO': self.path.split('?')[0],
                'QUERY_STRING': self.path.split('?')[1] if '?' in self.path else '',
                'CONTENT_TYPE': self.headers.get('Content-Type', ''),
                'CONTENT_LENGTH': self.headers.get('Content-Length', ''),
                'SERVER_NAME': 'vercel',
                'SERVER_PORT': '443',
            }
            
            # Add HTTP headers to the environment
            for key, value in self.headers.items():
                environ[f'HTTP_{key.upper().replace("-", "_")}'] = value
                
            # Define start_response callback
            def start_response(status, headers):
                status_code = int(status.split(' ')[0])
                self.send_response(status_code)
                for header, value in headers:
                    self.send_header(header, value)
                self.end_headers()
                
            # Process the request through Django WSGI app
            response = django_app(environ, start_response)
            
            # Write response body
            for chunk in response:
                self.wfile.write(chunk)
                
        except Exception as e:
            # Log the error
            print(f"Error handling request: {str(e)}")
            traceback.print_exc()
            
            # Return a 500 error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(f'{{"error": "Internal Server Error: {str(e)}"}}'.encode('utf-8'))
