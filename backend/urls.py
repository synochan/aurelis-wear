"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from products.views import (
    ProductViewSet, FeaturedProductsView, CategoryViewSet,
    ColorListView, SizeListView
)
from authentication.views import (
    RegisterView, LoginView, LogoutView, UserView, 
    ChangePasswordView, verify_email, resend_verification
)
from cart.views import CartViewSet, CartItemViewSet
from orders.views import OrderViewSet
from payments.views import StripeConfigView, CreatePaymentIntentView, PaymentConfirmationView

# Health check view
def health_check(request):
    """
    Simple health check endpoint to verify the API is working
    """
    return JsonResponse({
        'status': 'healthy',
        'environment': 'production' if not settings.DEBUG else 'development'
    })

# Root health check
def root_health_check(request):
    """
    Root endpoint that redirects to health check
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'Aurelis Wear API is running',
        'api_version': '1.0',
        'environment': 'production' if not settings.DEBUG else 'development',
        'documentation': '/api/'
    })

# Create a router for viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')

# API URL Patterns
api_urlpatterns = [
    # Products
    path('featured-products/', FeaturedProductsView.as_view(), name='featured-products'),
    path('colors/', ColorListView.as_view(), name='colors-list'),
    path('sizes/', SizeListView.as_view(), name='sizes-list'),
    
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/user/', UserView.as_view(), name='user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/verify-email/<str:token>/', verify_email, name='verify-email'),
    path('auth/resend-verification/', resend_verification, name='resend-verification'),
    
    # Payments
    path('payments/config/', StripeConfigView.as_view(), name='stripe-config'),
    path('payments/create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('payments/confirm-payment/', PaymentConfirmationView.as_view(), name='confirm-payment'),
    
    # Include router URLs
    path('', include(router.urls)),
]

urlpatterns = [
    path('', root_health_check, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include(api_urlpatterns)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 