from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import traceback

# Configure paths and environment
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Debug information
debug_info = {
    "python_version": sys.version,
    "sys_path": sys.path,
    "current_dir": current_dir,
    "files": os.listdir(current_dir) if os.path.exists(current_dir) else "directory not found",
    "env": dict(os.environ)
}

try:
    # Initialize Django
    import django
    django.setup()
    
    # Import WSGI application
    from wsgi import application as django_app
    import io
    
    debug_info.update({
        "django_version": django.__version__,
        "django_path": django.__file__,
        "django_setup": "success"
    })
    
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
                # Create a WSGI environment
                content_length = int(self.headers.get('Content-Length', 0))
                environ = {
                    'wsgi.input': io.BytesIO(self.rfile.read(content_length)),
                    'wsgi.errors': sys.stderr,
                    'wsgi.version': (1, 0),
                    'wsgi.multithread': False,
                    'wsgi.multiprocess': False,
                    'wsgi.run_once': False,
                    'wsgi.url_scheme': 'https',
                    'REQUEST_METHOD': self.command,
                    'PATH_INFO': self.path,
                    'QUERY_STRING': self.path.split('?')[1] if '?' in self.path else '',
                    'CONTENT_TYPE': self.headers.get('Content-Type', ''),
                    'CONTENT_LENGTH': str(content_length),
                    'SERVER_NAME': 'vercel',
                    'SERVER_PORT': '443',
                }
                
                # Add HTTP headers to the environment
                for key, value in self.headers.items():
                    environ[f'HTTP_{key.upper().replace("-", "_")}'] = value
                    
                # Define start_response callback
                def start_response(status, headers):
                    code = int(status.split(' ')[0])
                    self.send_response(code)
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
                traceback.print_exc()
                
                # Return a 500 error response with debug info
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                error_info = {
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                    "debug_info": debug_info
                }
                
                self.wfile.write(json.dumps(error_info, default=str).encode())
                
except Exception as e:
    # If Django setup fails, create a simple diagnostic handler
    debug_info.update({
        "error": str(e),
        "traceback": traceback.format_exc()
    })
    
    class handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(debug_info, default=str).encode())
