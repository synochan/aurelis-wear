"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from products.views import ProductViewSet, FeaturedProductsView, CategoryViewSet
from authentication.views import RegisterView, LoginView, UserView
from cart.views import CartViewSet, CartItemViewSet
from orders.views import OrderViewSet  # Import OrderViewSet

# Create a router for viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart/items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')  # Register orders endpoint

# Define URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('api/', include([
        path('', include(router.urls)),
        path('auth/register/', RegisterView.as_view(), name='register'),
        path('auth/login/', LoginView.as_view(), name='login'),
        path('auth/user/', UserView.as_view(), name='user-profile'),
        path('payments/', include('payments.urls')),  # Include payment URLs
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
