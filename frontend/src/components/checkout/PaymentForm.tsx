import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import api from '@/api/config.ts';
import { useNavigate } from 'react-router-dom';

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  clientSecret?: string;
  orderId: string;
}

const PaymentForm = ({ onSuccess, onError, clientSecret, orderId }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!clientSecret) {
      setErrorMessage("Missing payment intent secret. Please try again.");
      onError("Missing payment intent secret");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Get the CardElement
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setErrorMessage("Can't find card element");
      setIsProcessing(false);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {},
        },
      });

      if (result.error) {
        console.error("Payment error:", result.error);
        setErrorMessage(result.error.message || 'Payment confirmation failed');
        onError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Call the API to confirm the payment on the server
        await api.post('/api/payments/confirm-payment/', {
          payment_intent_id: result.paymentIntent.id,
          order_id: orderId
        });

        // Payment succeeded
        onSuccess();

        // Navigate to order confirmation
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      onError(err.message || 'Payment failed');

      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Card element options
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Get client secret from Stripe Elements if not provided directly
  useEffect(() => {
    if (!clientSecret && stripe) {
      // Try to access options from the Stripe elements configuration
      const stripeJs = (window as any).Stripe;
      if (stripeJs && stripeJs.__elements) {
        // Do nothing - clientSecret should be passed from parent
      }
    }
  }, [clientSecret, stripe]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="card-element" className="block text-sm font-medium mb-2">
              Credit or debit card
            </label>
            <div className="p-3 border rounded-md">
              <CardElement id="card-element" options={cardElementOptions} />
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}

          <Button 
            type="submit"
            className="w-full"
            disabled={!stripe || isProcessing || !clientSecret}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </form>

      <div className="text-sm text-gray-500">
        <p>Test card: 4242 4242 4242 4242</p>
        <p>Expiration: Any future date</p>
        <p>CVC: Any 3 digits</p>
        <p>ZIP: Any 5 digits</p>
      </div>
    </div>
  );
}

export default PaymentForm;
