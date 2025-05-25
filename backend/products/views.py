from rest_framework import viewsets, generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Product, Category, Color, Size
from .serializers import ProductListSerializer, ProductDetailSerializer, CategorySerializer
from rest_framework.response import Response

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

class FeaturedProductsView(generics.ListAPIView):
    """
    API endpoint for featured products
    """
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Use a simpler, more robust approach
        featured = Product.objects.filter(is_featured=True)
        return featured if featured.exists() else Product.objects.all()[:4]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

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