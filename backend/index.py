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
                # Fix path for Django
                original_path = self.path
                path_info = original_path
                
                # Debug path handling
                print(f"Original request path: {original_path}")
                
                # Keep /api prefix if present, otherwise add it (except for root path)
                if not path_info.startswith('/api') and path_info != '/':
                    path_info = f'/api{path_info}'
                
                # Handle root path
                if path_info == '/':
                    path_info = '/api/health/'
                
                print(f"Adjusted path for Django: {path_info}")
                
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                request_body = self.rfile.read(content_length) if content_length > 0 else b''
                
                # Log request info
                print(f"Request: {self.command} {path_info}")
                print(f"Headers: {dict(self.headers)}")
                if request_body and content_length < 1000:  # Don't log large bodies
                    try:
                        print(f"Body: {request_body.decode('utf-8')}")
                    except:
                        print(f"Body: (binary data, {len(request_body)} bytes)")
                
                # Create a WSGI environment
                environ = {
                    'wsgi.input': io.BytesIO(request_body),
                    'wsgi.errors': sys.stderr,
                    'wsgi.version': (1, 0),
                    'wsgi.multithread': False,
                    'wsgi.multiprocess': False,
                    'wsgi.run_once': False,
                    'wsgi.url_scheme': 'https',
                    'REQUEST_METHOD': self.command,
                    'PATH_INFO': path_info,
                    'QUERY_STRING': self.path.split('?')[1] if '?' in self.path else '',
                    'CONTENT_TYPE': self.headers.get('Content-Type', ''),
                    'CONTENT_LENGTH': str(content_length),
                    'SERVER_NAME': 'vercel',
                    'SERVER_PORT': '443',
                }
                
                # Add HTTP headers to the environment
                for key, value in self.headers.items():
                    environ[f'HTTP_{key.upper().replace("-", "_")}'] = value
                
                # Add CORS headers to response
                response_headers = []
                
                # Define start_response callback with CORS headers
                def start_response(status, headers):
                    nonlocal response_headers
                    response_headers = headers
                    
                    # Get status code
                    code = int(status.split(' ')[0])
                    self.send_response(code)
                    
                    # Add CORS headers
                    cors_headers = [
                        ('Access-Control-Allow-Origin', '*'),
                        ('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS'),
                        ('Access-Control-Allow-Headers', 'Content-Type,Authorization'),
                    ]
                    
                    # Send all headers
                    all_headers = headers + cors_headers
                    for header, value in all_headers:
                        self.send_header(header, value)
                    
                    self.end_headers()
                
                # Process the request through Django WSGI app
                response = django_app(environ, start_response)
                
                # Write response body
                response_body = b''
                for chunk in response:
                    response_body += chunk
                    self.wfile.write(chunk)
                
                # Log response
                print(f"Response status: {response_headers[0][1] if response_headers else 'unknown'}")
                print(f"Response headers: {response_headers}")
                if len(response_body) < 1000:  # Don't log large responses
                    try:
                        print(f"Response body: {response_body.decode('utf-8')}")
                    except:
                        print(f"Response body: (binary data, {len(response_body)} bytes)")
                    
            except Exception as e:
                # Log the error
                print(f"ERROR: {str(e)}")
                traceback.print_exc()
                
                # Return a 500 error response with debug info
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_info = {
                    "code": "500",
                    "message": "A server error has occurred",
                    "details": str(e),
                    "path": self.path,
                    "method": self.command
                }
                
                # In debug mode, add more information
                if os.environ.get('DEBUG', 'False') == 'True':
                    error_info.update({
                        "traceback": traceback.format_exc(),
                        "adjusted_path": path_info if 'path_info' in locals() else None,
                        "debug_info": {k: v for k, v in debug_info.items() if k != 'env'}
                    })
                
                self.wfile.write(json.dumps(error_info, default=str).encode())
                
except Exception as e:
    # If Django setup fails, create a simple diagnostic handler
    debug_info.update({
        "error": str(e),
        "traceback": traceback.format_exc()
    })
    
    class handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_diagnostic_error()
        
        def do_POST(self):
            self.send_diagnostic_error()
        
        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.send_header('Access-Control-Max-Age', '86400')  # 24 hours
            self.end_headers()
        
        def send_diagnostic_error(self):
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_info = {
                "code": "500",
                "message": "Django initialization failed",
                "details": str(debug_info.get("error", "Unknown error")),
                "path": self.path,
                "method": self.command
            }
            
            # In debug mode, add more information
            if os.environ.get('DEBUG', 'False') == 'True':
                error_info.update({
                    "django_setup_failed": True,
                    "traceback": debug_info.get("traceback", "No traceback available"),
                    "debug_info": {k: v for k, v in debug_info.items() if k not in ['env', 'traceback', 'error']}
                })
            
            self.wfile.write(json.dumps(error_info, default=str).encode())
