from django.shortcuts import render
import stripe
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer, PaymentIntentSerializer, PaymentConfirmationSerializer

# Configure Stripe with the secret key
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeConfigView(APIView):
    def get(self, request):
        """Return the Stripe publishable key"""
        return Response({
            'publishableKey': settings.STRIPE_PUBLISHABLE_KEY
        })

class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a payment intent for an order"""
        serializer = PaymentIntentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        order_id = serializer.validated_data['order_id']
        
        try:
            # Get the order
            order = Order.objects.get(id=order_id, user=request.user)
            
            # Check if order already has a payment
            if hasattr(order, 'payment') and order.payment.status == 'completed':
                return Response(
                    {"error": "This order has already been paid for"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create or update the payment record
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    'amount': order.total_price,
                    'currency': 'usd',
                }
            )
            
            # If payment exists but failed, update it
            if not created and payment.status == 'failed':
                payment.status = 'pending'
                payment.save()
            
            # Create a payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(float(order.total_price) * 100),  # Convert to cents
                currency='usd',
                metadata={
                    'order_id': order.id,
                    'user_id': request.user.id
                }
            )
            
            # Save the payment intent ID
            payment.stripe_payment_intent_id = intent.id
            payment.save()
            
            return Response({
                'clientSecret': intent.client_secret,
                'paymentId': payment.id
            })
            
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found or does not belong to you"},
                status=status.HTTP_404_NOT_FOUND
            )
        except stripe.error.StripeError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PaymentConfirmationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Confirm a payment"""
        serializer = PaymentConfirmationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        payment_intent_id = serializer.validated_data['payment_intent_id']
        
        try:
            # Retrieve the payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            # Find the corresponding payment in our database
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
                
                # Verify the payment belongs to the authenticated user
                if payment.order.user != request.user:
                    return Response(
                        {"error": "This payment does not belong to you"},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Update payment status based on intent status
                if intent.status == 'succeeded':
                    payment.status = 'completed'
                    payment.save()
                    
                    # Update order status
                    order = payment.order
                    order.status = 'processing'
                    order.payment_status = True
                    order.save()
                    
                    return Response({
                        'status': 'success',
                        'orderId': order.id
                    })
                else:
                    payment.status = 'failed'
                    payment.save()
                    return Response({
                        'status': 'failed',
                        'message': f"Payment failed with status: {intent.status}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
            except Payment.DoesNotExist:
                return Response(
                    {"error": "Payment record not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except stripe.error.StripeError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
