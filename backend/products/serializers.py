from rest_framework import serializers
from .models import Product, Category, Color, Size, ProductImage

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_value']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name', 'size_type']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']

class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    colors = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'image',
            'is_new', 'discount_percentage', 'colors'
        ]
    
    def get_colors(self, obj):
        return [color.hex_value for color in obj.colors.all()]
    
    def get_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image and hasattr(primary_image.image, 'url'):
            return self.context['request'].build_absolute_uri(primary_image.image.url)
        
        # If no primary image, return the first image or placeholder
        first_image = obj.images.first()
        if first_image and first_image.image and hasattr(first_image.image, 'url'):
            return self.context['request'].build_absolute_uri(first_image.image.url)
        
        return "/placeholder.svg"

class ProductDetailSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    colors = ColorSerializer(many=True)
    sizes = SizeSerializer(many=True)
    images = ProductImageSerializer(many=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'description', 'category',
            'colors', 'sizes', 'is_new', 'discount_percentage',
            'in_stock', 'images'
        ] 