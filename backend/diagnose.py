#!/usr/bin/env python
"""
Diagnostic script to analyze Django project setup
"""
import os
import sys
import importlib

def print_header(title):
    print("\n" + "="*60)
    print(f" {title} ".center(60, '='))
    print("="*60)

def main():
    print_header("ENVIRONMENT")
    print(f"Current directory: {os.getcwd()}")
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    
    print_header("PYTHON PATH")
    for path in sys.path:
        print(f"- {path}")
    
    print_header("DIRECTORY CONTENTS")
    for item in sorted(os.listdir('.')):
        if os.path.isdir(item):
            print(f"DIR: {item}/")
        else:
            print(f"FILE: {item}")
    
    print_header("DJANGO SETTINGS")
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        import django
        django.setup()
        from django.conf import settings
        
        print(f"Settings module: {settings.SETTINGS_MODULE}")
        print(f"BASE_DIR: {settings.BASE_DIR}")
        print(f"Debug mode: {settings.DEBUG}")
        
        print("\nINSTALLED_APPS:")
        for app in settings.INSTALLED_APPS:
            try:
                module = importlib.import_module(app)
                print(f"✅ {app} - Found at {getattr(module, '__file__', 'Unknown')}")
            except ImportError as e:
                print(f"❌ {app} - Import Error: {str(e)}")
        
    except Exception as e:
        print(f"Error loading Django settings: {str(e)}")
    
    print_header("TRYING PRODUCTS MODULE")
    try:
        import products
        print(f"✅ Products module found at {products.__file__}")
    except ImportError as e:
        print(f"❌ Products module import error: {str(e)}")
        
        # Try various paths
        possible_paths = [
            'products',
            'backend.products',
            'backend.backend.products'
        ]
        
        for path in possible_paths:
            print(f"\nTrying to import {path}...")
            try:
                module = importlib.import_module(path)
                print(f"✅ Success! Module found at {module.__file__}")
            except ImportError as e:
                print(f"❌ Failed: {str(e)}")
                
if __name__ == "__main__":
    main() 