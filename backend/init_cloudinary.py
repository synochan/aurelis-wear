import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings

def check_cloudinary_setup():
    """Check Cloudinary configuration and connection."""
    print("Checking Cloudinary configuration...")
    
    # Get Cloudinary configuration
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME', settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'))
    api_key = os.environ.get('CLOUDINARY_API_KEY', settings.CLOUDINARY_STORAGE.get('API_KEY'))
    api_secret = os.environ.get('CLOUDINARY_API_SECRET', settings.CLOUDINARY_STORAGE.get('API_SECRET'))
    
    print(f"Cloud Name: {cloud_name}")
    print(f"API Key: {'*' * len(api_key) if api_key else 'Not set'}")
    print(f"API Secret: {'*' * 8 if api_secret else 'Not set'}")
    
    if not all([cloud_name, api_key, api_secret]):
        print("ERROR: Missing Cloudinary credentials!")
        return False
    
    # Configure Cloudinary
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True
    )
    
    # Test Cloudinary connection
    try:
        print("Testing Cloudinary connection...")
        result = cloudinary.api.ping()
        print(f"Cloudinary connection successful: {result}")
        
        # Check if the products folder exists, create if not
        print("Ensuring 'products' folder exists...")
        folders = cloudinary.api.root_folders()
        product_folder_exists = any(folder.get('name') == 'products' for folder in folders.get('folders', []))
        
        if not product_folder_exists:
            print("Creating 'products' folder...")
            cloudinary.api.create_folder('products')
        
        return True
    except Exception as e:
        print(f"ERROR: Cloudinary connection failed: {str(e)}")
        return False

if __name__ == '__main__':
    if check_cloudinary_setup():
        print("Cloudinary setup is complete and working correctly.")
    else:
        print("WARNING: Cloudinary setup is incomplete or not working correctly.") 