from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing orders
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an order if it's still pending
        """
        order = self.get_object()
        if order.status == 'pending':
            order.status = 'cancelled'
            order.save()
            return Response({'status': 'Order cancelled'})
        return Response(
            {'error': 'Cannot cancel this order'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get most recent order
        """
        recent_order = self.get_queryset().first()
        if recent_order:
            serializer = self.get_serializer(recent_order)
            return Response(serializer.data)
        return Response(
            {'message': 'No orders found'}, 
            status=status.HTTP_404_NOT_FOUND
        ) 