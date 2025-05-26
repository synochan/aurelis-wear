from rest_framework import serializers
from .models import Product, Category, ProductImage, Color, Size
import cloudinary

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
                    return obj.image.url
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
                        return f"https://res.cloudinary.com/aurelis/image/upload/{obj.image}"
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
    category_name = serializers.CharField(source='category.name')
    category_slug = serializers.CharField(source='category.slug')
    image_url = serializers.SerializerMethodField()
    discount_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'discount_price', 'category_name', 
            'category_slug', 'image_url', 'is_new', 'is_featured', 
            'discount_percentage', 'in_stock'
        ]
    
    def get_image_url(self, obj):
        # Get primary image or first image
        request = self.context.get('request')
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image and hasattr(primary_image.image, 'url'):
            return request.build_absolute_uri(primary_image.image.url) if request else primary_image.image.url
        return None
    
    def get_discount_price(self, obj):
        if obj.discount_percentage:
            return round(obj.price * (1 - obj.discount_percentage / 100), 2)
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    images = ProductImageSerializer(many=True)
    colors = ColorSerializer(many=True)
    sizes = SizeSerializer(many=True)
    discount_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'discount_price', 'description',
            'category', 'colors', 'sizes', 'images', 'is_new', 
            'is_featured', 'discount_percentage', 'in_stock',
            'created_at', 'updated_at'
        ]
    
    def get_discount_price(self, obj):
        if obj.discount_percentage:
            return round(obj.price * (1 - obj.discount_percentage / 100), 2)
        return None 