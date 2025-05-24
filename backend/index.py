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
    
    # Import Django components needed for direct handling
    from django.contrib.auth.models import User
    from django.contrib.auth import authenticate
    from rest_framework.authtoken.models import Token
    from authentication.serializers import LoginSerializer, RegisterSerializer
    from rest_framework import status
    
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
            self.handle_request('GET')
            
        def do_POST(self):
            self.handle_request('POST')
            
        def do_PUT(self):
            self.handle_request('PUT')
            
        def do_DELETE(self):
            self.handle_request('DELETE')
            
        def do_OPTIONS(self):
            # Handle preflight CORS requests
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.send_header('Access-Control-Max-Age', '86400')  # 24 hours
            self.end_headers()
        
        def send_cors_headers(self):
            """Add CORS headers to the response"""
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            
        def send_json_response(self, status_code, data):
            """Send a JSON response with appropriate headers"""
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            
        def handle_auth_login(self):
            """Handle direct login requests"""
            try:
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                request_body = self.rfile.read(content_length) if content_length > 0 else b''
                
                # Parse JSON body
                body_data = json.loads(request_body.decode('utf-8'))
                print(f"Login request data: {body_data}")
                
                # Get username/email and password
                email = body_data.get('email')
                password = body_data.get('password')
                
                if not email or not password:
                    return self.send_json_response(400, {
                        "detail": "Email and password are required"
                    })
                
                # Find user by email
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return self.send_json_response(401, {
                        "detail": "No user found with this email address."
                    })
                
                # Authenticate user
                authenticated_user = authenticate(username=user.username, password=password)
                
                if not authenticated_user:
                    return self.send_json_response(401, {
                        "detail": "Invalid credentials."
                    })
                
                # Get or create token
                token, created = Token.objects.get_or_create(user=authenticated_user)
                
                # Send successful response
                return self.send_json_response(200, {
                    "token": token.key,
                    "user": {
                        "id": authenticated_user.id,
                        "email": authenticated_user.email,
                        "firstName": authenticated_user.first_name,
                        "lastName": authenticated_user.last_name,
                    }
                })
                
            except Exception as e:
                print(f"Login error: {str(e)}")
                traceback.print_exc()
                return self.send_json_response(500, {
                    "detail": f"Server error: {str(e)}"
                })
                
        def handle_auth_register(self):
            """Handle direct register requests"""
            try:
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                request_body = self.rfile.read(content_length) if content_length > 0 else b''
                
                # Parse JSON body
                body_data = json.loads(request_body.decode('utf-8'))
                print(f"Register request data: {body_data}")
                
                # Extract registration data
                username = body_data.get('username')
                email = body_data.get('email')
                password = body_data.get('password')
                password2 = body_data.get('password2')
                first_name = body_data.get('first_name')
                last_name = body_data.get('last_name')
                
                # Validate required fields
                if not username or not email or not password:
                    return self.send_json_response(400, {
                        "detail": "Username, email and password are required"
                    })
                
                # Validate password match
                if password != password2:
                    return self.send_json_response(400, {
                        "password2": "Password fields didn't match."
                    })
                
                # Check if email exists
                if User.objects.filter(email=email).exists():
                    return self.send_json_response(400, {
                        "email": "A user with this email already exists."
                    })
                
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )
                
                # Create token
                token, created = Token.objects.get_or_create(user=user)
                
                # Send successful response
                return self.send_json_response(201, {
                    "token": token.key,
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "firstName": user.first_name,
                        "lastName": user.last_name,
                    }
                })
                
            except Exception as e:
                print(f"Registration error: {str(e)}")
                traceback.print_exc()
                return self.send_json_response(500, {
                    "detail": f"Server error: {str(e)}"
                })
            
        def handle_request(self, method=None):
            try:
                # Use the provided method or fallback to the original request method
                request_method = method or self.command
                
                # Fix path for Django
                original_path = self.path
                path_info = original_path
                
                # Debug path handling
                print(f"Original request path: {original_path}")
                print(f"Request method: {request_method}")
                
                # Direct handling for auth endpoints to bypass Django routing issues
                if request_method == 'POST' and '/auth/login' in original_path:
                    return self.handle_auth_login()
                elif request_method == 'POST' and '/auth/register' in original_path:
                    return self.handle_auth_register()
                
                # Handle auth paths specially to ensure they work correctly
                if '/auth/login' in original_path or '/auth/register' in original_path:
                    # Make sure the path starts with /api for auth endpoints
                    if not path_info.startswith('/api'):
                        path_info = f'/api{path_info}'
                    print(f"Special handling for auth endpoint: {path_info}")
                # Keep /api prefix if present, otherwise add it (except for root path)
                elif not path_info.startswith('/api') and path_info != '/':
                    path_info = f'/api{path_info}'
                
                # Handle root path
                if path_info == '/':
                    path_info = '/api/health/'
                
                print(f"Adjusted path for Django: {path_info}")
                
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                request_body = self.rfile.read(content_length) if content_length > 0 else b''
                
                # Log request info
                print(f"Request: {request_method} {path_info}")
                print(f"Headers: {dict(self.headers)}")
                if request_body and content_length < 1000:  # Don't log large bodies
                    try:
                        body_str = request_body.decode('utf-8')
                        print(f"Body: {body_str}")
                        # Try to parse JSON for better logging
                        try:
                            body_json = json.loads(body_str)
                            print(f"Body (parsed): {json.dumps(body_json, indent=2)}")
                        except:
                            pass
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
                    'REQUEST_METHOD': request_method,  # Use the explicitly provided method
                    'PATH_INFO': path_info,
                    'QUERY_STRING': self.path.split('?')[1] if '?' in self.path else '',
                    'CONTENT_TYPE': self.headers.get('Content-Type', ''),
                    'CONTENT_LENGTH': str(content_length),
                    'SERVER_NAME': 'vercel',
                    'SERVER_PORT': '443',
                    'HTTP_HOST': self.headers.get('Host', 'vercel.app'),
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
                        resp_str = response_body.decode('utf-8')
                        print(f"Response body: {resp_str}")
                        # Try to parse JSON for better logging
                        try:
                            resp_json = json.loads(resp_str)
                            print(f"Response body (parsed): {json.dumps(resp_json, indent=2)}")
                        except:
                            pass
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
                    "method": request_method if 'request_method' in locals() else self.command
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
