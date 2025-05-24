from http.server import BaseHTTPRequestHandler
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend'))

# Run migrations on first startup
try:
    from backend.migrate import run_migrations
    run_migrations()
except Exception as e:
    print(f"Error running migrations: {str(e)}")

# Import the Django WSGI application
from wsgi import application


class handler(BaseHTTPRequestHandler):
    def handle_one_request(self):
        """Handle a single HTTP request."""
        self.raw_requestline = self.rfile.readline(65537)
        if len(self.raw_requestline) > 65536:
            self.requestline = ''
            self.request_version = ''
            self.command = ''
            self.send_error(414)
            return
        if not self.raw_requestline:
            self.close_connection = True
            return
        
        if not self.parse_request():
            # An error code has been sent, just exit
            return
        
        # Environment variables required by WSGI
        environ = {
            'wsgi.input': self.rfile,
            'wsgi.errors': sys.stderr,
            'wsgi.version': (1, 0),
            'wsgi.multithread': False,
            'wsgi.multiprocess': False,
            'wsgi.run_once': False,
            'wsgi.url_scheme': 'https',
            'REQUEST_METHOD': self.command,
            'PATH_INFO': self.path,
            'QUERY_STRING': '',
            'CONTENT_TYPE': self.headers.get('content-type', ''),
            'CONTENT_LENGTH': self.headers.get('content-length', ''),
            'SERVER_NAME': 'vercel',
            'SERVER_PORT': '443',
            'SERVER_PROTOCOL': self.request_version,
        }
        
        # Add HTTP headers to the environment
        for key, value in self.headers.items():
            key = key.upper().replace('-', '_')
            if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                key = 'HTTP_' + key
            environ[key] = value
        
        # Handle the request
        status = '200 OK'
        headers = []
        body = []
        
        def start_response(status_str, response_headers, exc_info=None):
            nonlocal status, headers
            status = status_str
            headers = response_headers
            return body.append
        
        # Call the WSGI application
        response_iter = application(environ, start_response)
        try:
            for data in response_iter:
                body.append(data)
        finally:
            if hasattr(response_iter, 'close'):
                response_iter.close()
        
        # Send the response
        status_code = int(status.split(' ')[0])
        self.send_response(status_code)
        
        for header, value in headers:
            self.send_header(header, value)
        self.end_headers()
        
        for data in body:
            if isinstance(data, str):
                data = data.encode('utf-8')
            self.wfile.write(data)
    
    do_GET = do_POST = do_PUT = do_DELETE = do_OPTIONS = do_HEAD = lambda self: self.handle_one_request() 