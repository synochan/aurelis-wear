from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'currency', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class PaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    payment_method_id = serializers.CharField(required=False, allow_null=True)
    
    # Include any additional fields you want from the client (e.g., for saving payment method)
    save_payment_method = serializers.BooleanField(default=False)
    
class PaymentConfirmationSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField() 