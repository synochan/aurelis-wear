import os
import django
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from products.models import Category, Color, Size, Product, ProductImage
from authentication.models import UserProfile

def create_sample_data():
    print("Creating sample data...")
    
    # Create categories
    categories = [
        {"name": "Shirts", "slug": "shirts"},
        {"name": "Pants", "slug": "pants"},
        {"name": "Shoes", "slug": "shoes"},
        {"name": "Accessories", "slug": "accessories"},
    ]
    
    for cat_data in categories:
        Category.objects.get_or_create(
            slug=cat_data["slug"],
            defaults={"name": cat_data["name"]}
        )
    
    # Create colors
    colors = [
        {"name": "Black", "hex_value": "#000000"},
        {"name": "White", "hex_value": "#FFFFFF"},
        {"name": "Red", "hex_value": "#FF0000"},
        {"name": "Blue", "hex_value": "#0062FF"},
        {"name": "Green", "hex_value": "#00A86B"},
    ]
    
    for color_data in colors:
        Color.objects.get_or_create(
            hex_value=color_data["hex_value"],
            defaults={"name": color_data["name"]}
        )
    
    # Create sizes
    sizes = ["XS", "S", "M", "L", "XL", "XXL"]
    for size_name in sizes:
        Size.objects.get_or_create(name=size_name)
    
    # Get all created objects
    all_categories = Category.objects.all()
    all_colors = Color.objects.all()
    all_sizes = Size.objects.all()
    
    # Create products
    products = [
        {
            "name": "Classic Cotton T-Shirt",
            "price": 29.99,
            "description": "A comfortable classic cotton t-shirt perfect for everyday wear.",
            "category": "shirts",
            "is_new": True,
            "is_featured": True,
        },
        {
            "name": "Performance Running Shoes",
            "price": 129.99,
            "description": "Lightweight and responsive running shoes for maximum performance.",
            "category": "shoes",
            "is_new": True,
            "discount_percentage": 15,
        },
        {
            "name": "Slim Fit Jeans",
            "price": 79.99,
            "description": "Modern slim fit jeans with stretch for comfort.",
            "category": "pants",
            "is_featured": True,
        },
        {
            "name": "Leather Belt",
            "price": 49.99,
            "description": "Premium leather belt with classic buckle.",
            "category": "accessories",
        },
        {
            "name": "Wool Sweater",
            "price": 89.99,
            "description": "Warm and cozy wool sweater for cold weather.",
            "category": "shirts",
            "discount_percentage": 10,
        },
    ]
    
    for product_data in products:
        category_slug = product_data.pop("category")
        category = Category.objects.get(slug=category_slug)
        
        product, created = Product.objects.get_or_create(
            name=product_data["name"],
            defaults={
                **product_data,
                "category": category
            }
        )
        
        if created:
            # Add random colors (2-4)
            product_colors = random.sample(list(all_colors), random.randint(2, min(4, len(all_colors))))
            product.colors.add(*product_colors)
            
            # Add random sizes (3-6)
            product_sizes = random.sample(list(all_sizes), random.randint(3, min(6, len(all_sizes))))
            product.sizes.add(*product_sizes)
            
            # Create placeholder image
            ProductImage.objects.create(
                product=product,
                is_primary=True
            )
    
    # Create a test user
    user, created = User.objects.get_or_create(
        username="testuser",
        defaults={
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    
    if created:
        user.set_password("password123")
        user.save()
        # Profile is created automatically via signal
    
    print("Sample data created successfully!")

if __name__ == "__main__":
    create_sample_data() 