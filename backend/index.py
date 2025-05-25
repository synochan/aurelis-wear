from http.server import BaseHTTPRequestHandler
import os
import sys

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        
        # Print system information
        info = f"""
        Aurelis Wear API (Simple Version)
        
        Python version: {sys.version}
        Current directory: {os.getcwd()}
        Path: {self.path}
        Environment variables: {list(os.environ.keys())}
        Python path: {sys.path}
        Directory contents: {os.listdir('.')}
        """
        
        self.wfile.write(info.encode()) 