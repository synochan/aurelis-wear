from http.server import BaseHTTPRequestHandler
import os
import sys

# Add the project directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
sys.path.append(os.path.dirname(parent_dir))

try:
    # Print diagnostic information
    print(f"Python version: {sys.version}")
    print(f"Current directory: {current_dir}")
    print(f"Parent directory: {parent_dir}")
    print(f"Python path: {sys.path}")
    print(f"Directory contents: {os.listdir(parent_dir)}")
    
    # Try to import Django libraries
    import django
    from django.core.wsgi import get_wsgi_application
    from django.http import HttpResponse
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    application = get_wsgi_application()
    
    print("Django imported successfully!")
except Exception as e:
    print(f"Error importing Django: {str(e)}")

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            
            # Try to import Django now
            import django
            
            # Send basic information
            response = f"""
            Aurelis Wear API is running!
            Python version: {sys.version}
            Django version: {django.get_version()}
            Path: {self.path}
            Environment: {os.environ.get('VERCEL_ENV', 'development')}
            """
            
            self.wfile.write(response.encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(f"Error: {str(e)}".encode()) 