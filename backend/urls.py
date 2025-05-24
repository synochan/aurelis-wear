"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from products.views import ProductViewSet, FeaturedProductsView, CategoryViewSet
from authentication.views import RegisterView, LoginView, UserView, LogoutView, ChangePasswordView
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

# Create a router for viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', include(router.urls)),
        path('health/', health_check, name='health-check'),
        path('products/featured/', FeaturedProductsView.as_view(), name='featured-products'),
        path('auth/register/', RegisterView.as_view(), name='register'),
        path('auth/login/', LoginView.as_view(), name='login'),
        path('auth/logout/', LogoutView.as_view(), name='logout'),
        path('auth/user/', UserView.as_view(), name='user-profile'),
        path('auth/password/change/', ChangePasswordView.as_view(), name='password-change'),
        path('checkout/', OrderViewSet.as_view({'post': 'checkout'}), name='checkout'),
        path('payments/config/', StripeConfigView.as_view(), name='stripe-config'),
        path('payments/create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
        path('payments/confirm-payment/', PaymentConfirmationView.as_view(), name='confirm-payment'),
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 