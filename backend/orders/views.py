from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Order
from .serializers import OrderSerializer
from cart.models import Cart

# Create your views here.

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing orders
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return only orders for the current authenticated user
        """
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """
        Create a new order for the current authenticated user
        """
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        Return the most recent incomplete order for the current user
        """
        order = Order.objects.filter(
            user=request.user, 
            status__in=['pending', 'processing']
        ).order_by('-created_at').first()
        
        if order:
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        return Response({"detail": "No active orders found."}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an order if it's still in 'pending' or 'processing' status
        """
        order = self.get_object()
        if order.status in ['pending', 'processing']:
            order.status = 'cancelled'
            order.save()
            return Response({"status": "Order cancelled successfully"})
        return Response(
            {"detail": "Cannot cancel an order that has already been shipped or delivered."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """
        Create a new order from the user's cart
        """
        # Check if the cart exists and has items
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the order
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return Response(
            {"detail": "Order created successfully.", "order": serializer.data},
            status=status.HTTP_201_CREATED
        )
