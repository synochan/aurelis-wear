import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/api/hooks';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import api from '@/api/config';

// Initialize Stripe (we'll load the publishable key from the API)
let stripePromise: Promise<any> | null = null;

// Define shipping info interface for storage
interface SavedShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const SHIPPING_INFO_STORAGE_KEY = 'aurelis_saved_shipping_info';

const Checkout = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: cartItems, isLoading } = useCart();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedShippingInfo, setSavedShippingInfo] = useState<SavedShippingInfo | null>(null);

  // Initialize Stripe with the publishable key
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const response = await api.get('/payments/config/');
        const publishableKey = response.data.publishableKey;
        
        if (!stripePromise && publishableKey) {
          stripePromise = loadStripe(publishableKey);
        }
      } catch (error) {
        console.error('Failed to load Stripe configuration:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize payment system. Please try again later.',
          variant: 'destructive',
        });
      }
    };
    
    initializeStripe();
    
    // Load saved shipping info from localStorage if available
    const savedInfo = localStorage.getItem(SHIPPING_INFO_STORAGE_KEY);
    if (savedInfo) {
      try {
        setSavedShippingInfo(JSON.parse(savedInfo));
      } catch (error) {
        console.error('Failed to parse saved shipping info', error);
      }
    }
  }, [toast]);

  // Handle empty cart
  useEffect(() => {
    if (!isLoading && (!cartItems || cartItems.length === 0)) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Add items before checkout.',
      });
      navigate('/cart');
    }
  }, [cartItems, isLoading, navigate, toast]);

  // Calculate total price 
  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Add tax (8%)
    const tax = subtotal * 0.08;
    
    // Add shipping (free over ₱100)
    const shippingFee = subtotal > 100 ? 0 : 7.99;
    
    // Return total (rounded to 2 decimal places)
    return Math.round((subtotal + tax + shippingFee) * 100) / 100;
  };

  // Create an order from the cart
  const createOrder = async (shippingInfo: any) => {
    setIsProcessing(true);
    
    try {
      // Save shipping info for future use
      localStorage.setItem(SHIPPING_INFO_STORAGE_KEY, JSON.stringify(shippingInfo));
      
      // Format shipping address as text
      const formattedShippingAddress = `
${shippingInfo.firstName} ${shippingInfo.lastName}
${shippingInfo.address}
${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}
${shippingInfo.country}
Phone: ${shippingInfo.phone}
      `.trim();
      
      // Calculate the total price (this should match what's displayed in OrderSummary)
      const totalPrice = calculateTotal();
      
      // Call the API to create an order
      const orderData = {
        payment_method: 'credit_card',
        shipping_address: formattedShippingAddress,
        billing_address: formattedShippingAddress,
        status: 'pending',
        payment_status: false,
        total_price: totalPrice,
      };
      
      const response = await api.post('/orders/', orderData);
      
      setOrderId(response.data.id);
      setShippingDetails(shippingInfo);
      setStep('payment');
      
      // Create a payment intent
      const paymentResponse = await api.post('/payments/create-payment-intent/', {
        order_id: response.data.id,
      });
      
      setClientSecret(paymentResponse.data.clientSecret);
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      let errorMessage = 'Failed to create your order. Please try again.';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        
        // Handle different types of validation errors
        if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join(', ');
        } else if (typeof error.response.data === 'string') {
          // For HTML error responses (like 500 errors), extract error message if possible
          if (error.response.data.includes('exception_value')) {
            const errorMatch = error.response.data.match(/<pre class="exception_value">(.*?)<\/pre>/);
            if (errorMatch && errorMatch[1]) {
              errorMessage = `Server error: ${errorMatch[1]}`;
            } else {
              errorMessage = 'A server error occurred. Please try again.';
            }
          } else {
            errorMessage = error.response.data;
          }
        } else if (Object.keys(error.response.data || {}).length > 0) {
          // Format field errors
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          
          errorMessage = `Validation failed: ${fieldErrors}`;
        }
      }
      
      toast({
        title: 'Order Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful',
      description: 'Your order has been placed successfully!',
    });
    
    // Redirect to order confirmation page
    navigate(`/order-confirmation/${orderId}`);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error || 'There was an issue processing your payment. Please try again.',
      variant: 'destructive',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Loading your cart...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'shipping' ? (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your shipping details</CardDescription>
              </CardHeader>
              <CardContent>
                <ShippingForm 
                  onSubmit={createOrder} 
                  isProcessing={isProcessing}
                  initialValues={savedShippingInfo || undefined} 
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Complete your purchase</CardDescription>
              </CardHeader>
              <CardContent>
                {clientSecret && stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm 
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      clientSecret={clientSecret}
                    />
                  </Elements>
                ) : (
                  <div>Loading payment form...</div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('shipping')}>
                  Back to Shipping
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <OrderSummary cartItems={cartItems || []} shippingDetails={shippingDetails} />
        </div>
      </div>
    </div>
  );
};

export default Checkout; 