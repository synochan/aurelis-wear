from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product, Color, Size
from products.serializers import ProductListSerializer, ColorSerializer, SizeSerializer
import logging

# Set up logger
logger = logging.getLogger(__name__)

class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)
    color_id = serializers.IntegerField(write_only=True)
    size_id = serializers.IntegerField(write_only=True)
    product = ProductListSerializer(read_only=True)
    color = ColorSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    name = serializers.CharField(source='product.name', read_only=True)
    price = serializers.DecimalField(
        source='product.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product_id', 'color_id', 'size_id', 'product', 'color', 
            'size', 'quantity', 'name', 'price', 'image'
        ]
    
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.product.images.exists():
            image = obj.product.images.first().image
            if request is not None:
                return request.build_absolute_uri(image.url)
            return image.url
        return None
    
    def validate(self, data):
        try:
            # Validate product exists
            try:
                product_id = data.get('product_id')
                if not product_id:
                    raise serializers.ValidationError({"product_id": "Product ID is required"})
                
                try:
                    product = Product.objects.get(pk=product_id)
                except Product.DoesNotExist:
                    logger.warning(f"Product not found: {product_id}")
                    raise serializers.ValidationError({"product_id": f"Product with ID {product_id} does not exist"})
                
                # Validate color exists and is valid for this product
                color_id = data.get('color_id')
                if not color_id:
                    raise serializers.ValidationError({"color_id": "Color ID is required"})
                
                try:
                    color = Color.objects.get(pk=color_id)
                    if not product.colors.filter(pk=color_id).exists():
                        logger.warning(f"Color {color_id} not available for product {product_id}")
                        raise serializers.ValidationError({
                            "color_id": f"Color {color.name} is not available for this product"
                        })
                except Color.DoesNotExist:
                    logger.warning(f"Color not found: {color_id}")
                    raise serializers.ValidationError({"color_id": f"Color with ID {color_id} does not exist"})
                
                # Validate size exists and is valid for this product
                size_id = data.get('size_id')
                if not size_id:
                    raise serializers.ValidationError({"size_id": "Size ID is required"})
                
                try:
                    size = Size.objects.get(pk=size_id)
                    if not product.sizes.filter(pk=size_id).exists():
                        logger.warning(f"Size {size_id} not available for product {product_id}")
                        raise serializers.ValidationError({
                            "size_id": f"Size {size.name} is not available for this product"
                        })
                except Size.DoesNotExist:
                    logger.warning(f"Size not found: {size_id}")
                    raise serializers.ValidationError({"size_id": f"Size with ID {size_id} does not exist"})
                
                # Validate quantity
                quantity = data.get('quantity', 1)
                if quantity <= 0:
                    logger.warning(f"Invalid quantity: {quantity}")
                    raise serializers.ValidationError({"quantity": "Quantity must be greater than 0"})
                
                # Add validated objects to data
                data['product'] = product
                data['color'] = color
                data['size'] = size
                
                return data
            except KeyError as e:
                logger.error(f"Missing required field: {str(e)}")
                raise serializers.ValidationError({str(e): f"This field is required"})
            
        except Exception as e:
            logger.error(f"Unexpected error validating cart item: {str(e)}")
            if isinstance(e, serializers.ValidationError):
                raise
            raise serializers.ValidationError({"error": str(e)})

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(source='items.all', many=True, read_only=True)
    total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count']
    
    def get_total(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())
    
    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all()) 