from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product, Color, Size
from cart.models import Cart

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField(read_only=True)
    color_value = serializers.CharField(source='color.hex_value', read_only=True)
    size_value = serializers.CharField(source='size.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'color', 'color_value', 'size', 'size_value',
            'quantity', 'price', 'subtotal'
        ]
        read_only_fields = ['price', 'subtotal']
    
    def get_product_image(self, obj):
        primary_image = obj.product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.product.images.first()
        if primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'payment_method', 'payment_status',
            'shipping_address', 'billing_address', 'shipping_price',
            'total_price', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.filter(user=user).first()
        
        if not cart or not cart.items.exists():
            raise serializers.ValidationError("Your cart is empty.")
        
        # Calculate the total price of all items in the cart
        items_total = sum(item.subtotal for item in cart.items.all())
        
        # Make a safe copy of validated_data to avoid modifying the original
        cleaned_data = validated_data.copy()
        
        # Extract shipping_price from validated_data to avoid passing it twice
        shipping_price = cleaned_data.pop('shipping_price', 0)
        
        # Remove any fields that we'll set explicitly to avoid duplication errors
        # These are fields we might pass from frontend but also set explicitly in code
        for field in ['user', 'items']:
            if field in cleaned_data:
                cleaned_data.pop(field)
        
        # If total_price is not provided, calculate it
        if 'total_price' not in cleaned_data:
            cleaned_data['total_price'] = items_total + shipping_price
        
        # Create the order
        try:
            order = Order.objects.create(
                user=user,
                shipping_price=shipping_price,
                **cleaned_data
            )
            
            # Create order items from cart items
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    color=cart_item.color,
                    size=cart_item.size,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                )
            
            # Clear the cart
            cart.items.all().delete()
            
            return order
        except Exception as e:
            print(f"Error creating order: {e}")
            print(f"Validated data: {cleaned_data}")
            raise serializers.ValidationError(f"Failed to create order: {str(e)}") 