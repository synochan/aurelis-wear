"""
This file contains helper functions for Vercel deployment.
It is not used in development.
"""

def print_deployment_info():
    """Print basic information about the deployment environment."""
    from django.conf import settings
    import sys
    
    print("Python version:", sys.version)
    print("DEBUG mode:", settings.DEBUG)
    print("ALLOWED_HOSTS:", settings.ALLOWED_HOSTS)
    print("DATABASE engine:", settings.DATABASES['default']['ENGINE'])
    print("STATIC_ROOT:", settings.STATIC_ROOT)
    
    return "Deployment info printed" 