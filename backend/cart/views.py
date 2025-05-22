from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product, Color, Size
import logging
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

# Set up logger
logger = logging.getLogger(__name__)

class CartViewSet(viewsets.GenericViewSet):
    """
    API endpoint for managing user's shopping cart
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer
    
    def get_queryset(self):
        """
        This should never return multiple carts per user
        """
        if not self.request.user.is_authenticated:
            logger.warning("Unauthenticated user attempted to access cart")
            return Cart.objects.none()
        return Cart.objects.filter(user=self.request.user)
    
    def get_object(self):
        """
        Get the user's cart, creating one if it doesn't exist
        """
        if not self.request.user.is_authenticated:
            logger.warning("Unauthenticated user attempted to get cart object")
            return None
            
        try:
            # Get or create cart for the current user
            cart, created = Cart.objects.get_or_create(user=self.request.user)
            if created:
                logger.info(f"Created new cart for user {self.request.user.id}")
            return cart
        except Exception as e:
            logger.error(f"Error accessing cart for user {self.request.user.id}: {str(e)}")
            return None
    
    def list(self, request):
        """
        Retrieve the user's cart
        """
        try:
            # Ensure user is authenticated
            if not request.user.is_authenticated:
                logger.warning("Unauthenticated user attempted to list cart")
                return Response(
                    {"error": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            cart = self.get_object()
            if not cart:
                return Response(
                    {"error": "Could not retrieve cart"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            serializer = self.get_serializer(cart, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving cart: {str(e)}")
            return Response(
                {"error": "Could not retrieve cart information"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=["post"])
    def clear(self, request):
        """
        Clear all items from the cart
        """
        try:
            # Ensure user is authenticated
            if not request.user.is_authenticated:
                logger.warning("Unauthenticated user attempted to clear cart")
                return Response(
                    {"error": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            cart = self.get_object()
            if not cart:
                return Response(
                    {"error": "Could not retrieve cart"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            cart.items.all().delete()
            serializer = self.get_serializer(cart, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error clearing cart: {str(e)}")
            return Response(
                {"error": "Could not clear the cart"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CartItemViewSet(viewsets.GenericViewSet):
    """
    API endpoint for managing cart items
    """
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartItemSerializer
    
    def get_cart(self):
        """
        Get or create a cart for the current user
        """
        if not self.request.user.is_authenticated:
            logger.warning("Unauthenticated user attempted to get cart")
            return None
            
        try:
            cart, created = Cart.objects.get_or_create(user=self.request.user)
            if created:
                logger.info(f"Created new cart for user {self.request.user.id}")
            return cart
        except Exception as e:
            logger.error(f"Error getting cart: {str(e)}")
            return None
    
    def get_queryset(self):
        """
        Get all cart items for the current user's cart
        """
        if not self.request.user.is_authenticated:
            logger.warning("Unauthenticated user attempted to access cart items")
            return CartItem.objects.none()
        return CartItem.objects.filter(cart__user=self.request.user)
    
    def create(self, request):
        """
        Add an item to the cart
        """
        try:
            # Ensure user is authenticated
            if not request.user.is_authenticated:
                logger.warning("Unauthenticated user attempted to add to cart")
                return Response(
                    {"error": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            # Get the user's cart
            cart = self.get_cart()
            if not cart:
                return Response(
                    {"error": "Could not access cart"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            # Log the incoming request data
            logger.info(f"Add to cart request data: {request.data}")
            
            # Validate incoming data
            serializer = self.get_serializer(data=request.data, context={'request': request})
            if not serializer.is_valid():
                logger.warning(f"Invalid cart item data: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Get validated data
            try:
                product = serializer.validated_data['product']
                color = serializer.validated_data['color']
                size = serializer.validated_data['size']
                quantity = serializer.validated_data.get('quantity', 1)
            except KeyError as e:
                logger.error(f"Missing required field in cart item data: {e}")
                return Response(
                    {"error": f"Missing required field: {e}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Debug logs
            logger.info(f"Adding to cart: product={product.id}, color={color.id}, size={size.id}, quantity={quantity}")
            
            # Check if the item already exists in the cart
            try:
                cart_item = CartItem.objects.get(
                    cart=cart,
                    product=product,
                    color=color,
                    size=size
                )
                # Update quantity if item exists
                logger.info(f"Item already exists in cart, updating quantity from {cart_item.quantity} to {cart_item.quantity + quantity}")
                cart_item.quantity += quantity
                cart_item.save()
            except CartItem.DoesNotExist:
                # Create new item if it doesn't exist
                logger.info(f"Creating new cart item")
                cart_item = CartItem.objects.create(
                    cart=cart,
                    product=product,
                    color=color,
                    size=size,
                    quantity=quantity
                )
            except Exception as e:
                logger.error(f"Error processing cart item: {str(e)}")
                return Response(
                    {"error": f"Error processing cart item: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Return the updated cart
            cart_serializer = CartSerializer(cart, context={'request': request})
            return Response(cart_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error adding item to cart: {str(e)}")
            return Response(
                {"error": f"Could not add item to cart: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, pk=None):
        """
        Update a cart item's quantity
        """
        try:
            # Ensure user is authenticated
            if not request.user.is_authenticated:
                logger.warning("Unauthenticated user attempted to update cart item")
                return Response(
                    {"error": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get the cart item, ensuring it belongs to the current user
            try:
                cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
            except Exception as e:
                logger.warning(f"Cart item not found or doesn't belong to user: {pk}, {str(e)}")
                return Response(
                    {"error": "Cart item not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Only quantity can be updated
            try:
                quantity = int(request.data.get('quantity', 1))
            except (TypeError, ValueError) as e:
                logger.warning(f"Invalid quantity value: {request.data.get('quantity')}")
                return Response(
                    {"error": "Invalid quantity value"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if quantity <= 0:
                # If quantity is 0 or less, remove the item
                logger.info(f"Removing cart item {pk} due to quantity <= 0")
                cart_item.delete()
            else:
                # Update the quantity
                logger.info(f"Updating cart item {pk} quantity from {cart_item.quantity} to {quantity}")
                cart_item.quantity = quantity
                cart_item.save()
            
            # Return the updated cart
            cart = self.get_cart()
            cart_serializer = CartSerializer(cart, context={'request': request})
            return Response(cart_serializer.data)
        except CartItem.DoesNotExist:
            logger.warning(f"Cart item not found: {pk}")
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating cart item: {str(e)}")
            return Response(
                {"error": f"Could not update cart item: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def partial_update(self, request, pk=None):
        """
        Partially update a cart item (same as update for our use case)
        """
        return self.update(request, pk)
    
    def destroy(self, request, pk=None):
        """
        Remove an item from the cart
        """
        try:
            # Ensure user is authenticated
            if not request.user.is_authenticated:
                logger.warning("Unauthenticated user attempted to remove cart item")
                return Response(
                    {"error": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get the cart item, ensuring it belongs to the current user    
            try:
                cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
            except Exception as e:
                logger.warning(f"Cart item not found or doesn't belong to user: {pk}, {str(e)}")
                return Response(
                    {"error": "Cart item not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
            logger.info(f"Removing cart item {pk}")
            cart_item.delete()
            
            # Return the updated cart
            cart = self.get_cart()
            cart_serializer = CartSerializer(cart, context={'request': request})
            return Response(cart_serializer.data)
        except CartItem.DoesNotExist:
            logger.warning(f"Cart item not found to delete: {pk}")
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error removing cart item: {str(e)}")
            return Response(
                {"error": f"Could not remove item from cart: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 