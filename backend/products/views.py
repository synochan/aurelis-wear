from rest_framework import viewsets, generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductListSerializer, ProductDetailSerializer, CategorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for browsing products
    """
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_new', 'in_stock']
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