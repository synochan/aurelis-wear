import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/api/hooks.ts';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import api from '@/api/config.ts';

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
  const [stripeConfig, setStripeConfig] = useState<any>(null);

  // Initialize Stripe with the publishable key
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const response = await api.get('/api/payments/config/');
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

  // Get Stripe configuration
  const fetchStripeConfig = async () => {
    try {
      const response = await api.get('/api/payments/config/');
      setStripeConfig(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching Stripe config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment configuration',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create order in the backend
  const createOrder = async (orderData: any) => {
    try {
      const response = await api.post('/api/orders/', orderData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Handle specific error messages from the API
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Check if there are field-specific errors
        if (typeof errorData === 'object') {
          // Format field-specific errors
          const errorMessages = Object.entries(errorData)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('; ');
          
          throw new Error(`Order validation failed: ${errorMessages}`);
        }
      }
      
      throw new Error('Failed to create order. Please try again.');
    }
  };

  // Create payment intent
  const createPaymentIntent = async (orderId: number, amount: number) => {
    try {
      const paymentResponse = await api.post('/api/payments/create-payment-intent/', {
        order_id: orderId,
        amount: amount
      });
      return paymentResponse.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to initialize payment');
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

  const handleShippingSubmit = async (shippingData: any) => {
    setIsProcessing(true);
    try {
      // Save shipping info for future use
      localStorage.setItem(SHIPPING_INFO_STORAGE_KEY, JSON.stringify(shippingData));
      
      // Format shipping address as text
      const formattedShippingAddress = `
${shippingData.firstName} ${shippingData.lastName}
${shippingData.address}
${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}
${shippingData.country}
Phone: ${shippingData.phone}
Email: ${shippingData.email}
      `.trim();
      
      // Calculate the total price
      const totalPrice = calculateTotal();
      
      // Create order data object with required fields
      const orderData = {
        payment_method: 'credit_card',
        shipping_address: formattedShippingAddress,
        billing_address: formattedShippingAddress, // Use same address for billing
        status: 'pending',
        payment_status: false,
        total_price: totalPrice,
        shipping_price: cartItems && cartItems.length > 0 && 
                      cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 100 
                      ? 0 : 7.99,
      };
      
      // Call API to create order
      const orderResponse = await createOrder(orderData);
      
      setOrderId(orderResponse.id);
      setShippingDetails(shippingData);
      setStep('payment');
      
      // Create payment intent
      const paymentResponse = await createPaymentIntent(orderResponse.id, totalPrice);
      setClientSecret(paymentResponse.clientSecret);
      
    } catch (error) {
      console.error('Error during checkout process:', error);
      toast({
        title: 'Checkout Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
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
                  onSubmit={handleShippingSubmit} 
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
                      orderId={orderId?.toString() || ''}
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