import os
import django
import sys
import cloudinary
import cloudinary.uploader
from pathlib import Path

# Set up Django environment
sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from products.models import ProductImage
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def migrate_images_to_cloudinary():
    """Migrate existing product images to Cloudinary."""
    print("Starting migration of product images to Cloudinary...")
    
    # Configure Cloudinary (should be already configured in Django settings)
    if not all([settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'),
                settings.CLOUDINARY_STORAGE.get('API_KEY'),
                settings.CLOUDINARY_STORAGE.get('API_SECRET')]):
        print("Cloudinary settings not found. Please check your configuration.")
        return
    
    # Get all product images
    images = ProductImage.objects.all()
    print(f"Found {images.count()} product images to migrate")
    
    for i, img in enumerate(images):
        # Skip if it's already a Cloudinary URL
        if img.image and not hasattr(img.image, 'url') or (hasattr(img.image, 'url') and 'cloudinary' in img.image.url):
            print(f"Image {i+1}/{images.count()} is already a Cloudinary URL. Skipping...")
            continue
            
        try:
            # Path to the local image file
            local_path = img.image.path if hasattr(img.image, 'path') else None
            
            if local_path and os.path.exists(local_path):
                print(f"Uploading image {i+1}/{images.count()} to Cloudinary...")
                
                # Upload to Cloudinary
                result = cloudinary.uploader.upload(
                    local_path,
                    folder='products',
                    use_filename=True,
                    unique_filename=True
                )
                
                # Update the model with the Cloudinary ID
                img.image = result['public_id']
                img.save()
                
                print(f"Successfully migrated image {i+1} to Cloudinary: {result['secure_url']}")
            else:
                print(f"Image {i+1}/{images.count()} not found on local filesystem.")
                
        except Exception as e:
            print(f"Error migrating image {i+1}/{images.count()}: {e}")
    
    print("Migration completed!")

if __name__ == '__main__':
    migrate_images_to_cloudinary() 