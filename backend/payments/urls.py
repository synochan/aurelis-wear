from django.urls import path
from .views import StripeConfigView, CreatePaymentIntentView, PaymentConfirmationView

urlpatterns = [
    path('config/', StripeConfigView.as_view(), name='stripe-config'),
    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('confirm-payment/', PaymentConfirmationView.as_view(), name='confirm-payment'),
] 