from flask import Flask, request, jsonify
import sys
import os

# Print debug info
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path}")
print(f"Current directory: {os.getcwd()}")
print(f"Directory listing: {os.listdir('.')}")

# Try to diagnose Django import issue
try:
    import django
    print(f"Successfully imported Django {django.__version__}")
except ImportError as e:
    print(f"Failed to import Django: {e}")
    # Try to list pip packages
    import subprocess
    try:
        result = subprocess.run(['pip', 'list'], capture_output=True, text=True)
        print(f"Installed packages: {result.stdout}")
    except Exception as e:
        print(f"Failed to list packages: {e}")

# Create a simple Flask app as fallback
app = Flask(__name__)

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    return jsonify({
        'status': 'error', 
        'message': 'API currently unavailable - Django import error',
        'path': path,
        'method': request.method,
        'python_version': sys.version,
        'sys_path': str(sys.path)
    }), 500

# Vercel requires a handler or app
handler = app
