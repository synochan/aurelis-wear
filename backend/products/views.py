from rest_framework import viewsets, generics, filters, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Product, Category, Color, Size
from .serializers import ProductListSerializer, ProductDetailSerializer, CategorySerializer
import logging

# Set up logger
logger = logging.getLogger(__name__)

class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category__slug')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    color = django_filters.CharFilter(field_name='colors__name', lookup_expr='icontains')
    size = django_filters.CharFilter(field_name='sizes__name', lookup_expr='iexact')
    
    class Meta:
        model = Product
        fields = ['category', 'is_new', 'in_stock', 'min_price', 'max_price', 'color', 'size']

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for browsing products
    """
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'name', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def list(self, request, *args, **kwargs):
        try:
            # Get queryset with filters applied
            queryset = self.filter_queryset(self.get_queryset())
            
            # Handle is_featured parameter separately if present
            is_featured = request.query_params.get('is_featured', None)
            if is_featured is not None:
                # Convert string parameter to boolean
                is_featured_bool = is_featured.lower() == 'true'
                queryset = queryset.filter(is_featured=is_featured_bool)
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in ProductViewSet.list: {str(e)}")
            return Response(
                {"error": "An error occurred while retrieving products"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in ProductViewSet.retrieve: {str(e)}")
            return Response(
                {"error": "An error occurred while retrieving the product"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FeaturedProductsView(generics.ListAPIView):
    """
    API endpoint for featured products
    """
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        try:
            # Use a simpler, more robust approach
            featured = Product.objects.filter(is_featured=True)
            return featured if featured.exists() else Product.objects.all()[:4]
        except Exception as e:
            logger.error(f"Error in FeaturedProductsView.get_queryset: {str(e)}")
            return Product.objects.none()  # Return empty queryset on error
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in FeaturedProductsView.list: {str(e)}")
            return Response(
                {"error": "An error occurred while retrieving featured products"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for product categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

class ColorListView(generics.ListAPIView):
    """
    API endpoint for available colors
    """
    queryset = Color.objects.all()
    serializer_class = None  # Define a serializer for Color model
    permission_classes = [permissions.AllowAny]
    
    def list(self, request, *args, **kwargs):
        colors = self.get_queryset().values('name', 'hex_value')
        return Response(colors)

class SizeListView(generics.ListAPIView):
    """
    API endpoint for available sizes
    """
    queryset = Size.objects.all()
    serializer_class = None  # Define a serializer for Size model
    permission_classes = [permissions.AllowAny]
    
    def list(self, request, *args, **kwargs):
        sizes = self.get_queryset().values('name', 'size_type')
        return Response(sizes) 