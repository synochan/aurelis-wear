from rest_framework import serializers
from .models import Product, Category, ProductImage, Color, Size
import cloudinary
import os
from decimal import Decimal

# Get Cloudinary configuration from environment variables
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', 'dr5mrez5h')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'image_url']
    
    def get_image_url(self, obj):
        try:
            if obj.image:
                # If it's a cloudinary image
                if hasattr(obj.image, 'public_id'):
                    return f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload/{obj.image.public_id}"
                # If it has a URL attribute
                elif hasattr(obj.image, 'url'):
                    request = self.context.get('request')
                    return request.build_absolute_uri(obj.image.url) if request else obj.image.url
                # If it's a string (possibly a cloudinary path)
                elif isinstance(obj.image, str):
                    if obj.image.startswith('http'):
                        return obj.image
                    else:
                        # Assume it's a cloudinary public ID
                        return f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload/{obj.image}"
        except Exception as e:
            print(f"Error getting image URL: {e}")
        return None

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_value']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name', 'size_type']

class ProductListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True)
    image_url = serializers.SerializerMethodField()
    discount_price = serializers.SerializerMethodField()
    price_display = serializers.SerializerMethodField()
    discount_price_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'price_display', 'discount_price', 'discount_price_display', 
            'categories', 'image_url', 'is_new', 'is_featured', 
            'discount_percentage', 'in_stock'
        ]
    
    def get_image_url(self, obj):
        # Get primary image or first image
        request = self.context.get('request')
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image:
            if hasattr(primary_image.image, 'public_id'):
                return f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload/{primary_image.image.public_id}"
            elif hasattr(primary_image.image, 'url'):
                return request.build_absolute_uri(primary_image.image.url) if request else primary_image.image.url
            elif isinstance(primary_image.image, str):
                if primary_image.image.startswith('http'):
                    return primary_image.image
                else:
                    return f"https://res.cloudinary.com/{CLOUDINARY_CLOUD_NAME}/image/upload/{primary_image.image}"
        return None
    
    def get_discount_price(self, obj):
        if obj.discount_percentage:
            # Convert percentage to Decimal to avoid type errors
            discount_percent = Decimal(str(obj.discount_percentage)) / Decimal('100')
            return obj.price * (Decimal('1') - discount_percent)
        return None
    
    def get_price_display(self, obj):
        # Format price with Philippine Peso symbol
        return f"₱{obj.price}"
    
    def get_discount_price_display(self, obj):
        # Format discounted price with Philippine Peso symbol
        discount_price = self.get_discount_price(obj)
        if discount_price is not None:
            return f"₱{discount_price:.2f}"
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True)
    images = ProductImageSerializer(many=True)
    colors = ColorSerializer(many=True)
    sizes = SizeSerializer(many=True)
    discount_price = serializers.SerializerMethodField()
    price_display = serializers.SerializerMethodField()
    discount_price_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'price_display', 'discount_price', 'discount_price_display', 
            'description', 'categories', 'colors', 'sizes', 'images', 'is_new', 
            'is_featured', 'discount_percentage', 'in_stock',
            'created_at', 'updated_at'
        ]
    
    def get_discount_price(self, obj):
        if obj.discount_percentage:
            # Convert percentage to Decimal to avoid type errors
            discount_percent = Decimal(str(obj.discount_percentage)) / Decimal('100')
            return obj.price * (Decimal('1') - discount_percent)
        return None
    
    def get_price_display(self, obj):
        # Format price with Philippine Peso symbol
        return f"₱{obj.price}"
    
    def get_discount_price_display(self, obj):
        # Format discounted price with Philippine Peso symbol
        discount_price = self.get_discount_price(obj)
        if discount_price is not None:
            return f"₱{discount_price:.2f}"
        return None 