"""
Simple script to test Django configuration for Vercel deployment
"""
import os
import sys
import json

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.dirname(current_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

def handler(event, context):
    """
    Test handler for Vercel serverless function
    """
    # Print available environment variables (without sensitive data)
    env_info = {k: v for k, v in os.environ.items() 
               if not any(secret in k.lower() for secret in ['key', 'password', 'secret', 'token'])}
    
    # Print system path
    path_info = sys.path
    
    # Try to import Django
    try:
        import django
        django_info = {
            'version': django.__version__,
            'path': django.__file__,
            'installed': True
        }
    except ImportError:
        django_info = {
            'installed': False,
            'error': 'Django could not be imported'
        }
    
    # Try to import the wsgi application
    try:
        from wsgi import application
        wsgi_info = {
            'imported': True,
            'type': str(type(application))
        }
    except ImportError as e:
        wsgi_info = {
            'imported': False,
            'error': str(e)
        }
    
    # Try to find key Django files
    files_check = {}
    for filename in ['wsgi.py', 'urls.py', 'settings.py']:
        file_path = os.path.join(current_dir, filename)
        files_check[filename] = os.path.exists(file_path)
    
    # Return diagnostic information
    result = {
        'status': 'test_ok',
        'environment': env_info,
        'django': django_info,
        'wsgi': wsgi_info,
        'files': files_check,
        'python_path': path_info
    }
    
    return {
        'statusCode': 200,
        'body': json.dumps(result),
        'headers': {
            'Content-Type': 'application/json'
        }
    }

if __name__ == '__main__':
    # If run directly, print the handler output
    print(json.dumps(handler({}, {}), indent=2)) 