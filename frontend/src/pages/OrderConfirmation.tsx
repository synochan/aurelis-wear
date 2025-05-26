import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/api';
import { formatCurrency } from '@/utils/formatters';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`api/orders/${orderId}/`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-4xl text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button asChild className="mt-4">
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderPrice = (value: any) => {
    if (value === undefined || value === null) return '$0.00';
    const price = parseFloat(value);
    return isNaN(price) ? '$0.00' : `$${price.toFixed(2)}`;
  };

  // Calculate subtotal from items if available
  const calculateSubtotal = () => {
    if (!orderDetails?.items?.length) return 0;
    return orderDetails.items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  // Helper to format currency
  const formatPeso = (amount: number) => formatCurrency(amount);

  const subtotal = orderDetails?.subtotal || calculateSubtotal();
  const shippingCost = orderDetails?.shipping_price || 0;
  const tax = orderDetails?.tax || (subtotal * 0.08); // Default tax rate of 8% if not provided
  const total = orderDetails?.total_price || (subtotal + shippingCost + tax);

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
          </div>
          <CardTitle className="text-center text-2xl md:text-3xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-500">
              Thank you for your purchase. Your order has been confirmed and will be shipped shortly.
            </p>
            <p className="font-medium mt-2">
              Order Number: #{orderId}
            </p>
          </div>
          
          {orderDetails && (
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Order Summary</h3>
              
              <div className="space-y-2">
                {orderDetails.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product_name || 'Product'} {item.size_value && `(${item.size_value})`} 
                      {item.color_value && `- ${item.color_value}`} x{item.quantity}
                    </span>
                    <span className="font-medium">{renderPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{renderPrice(formatPeso(subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{renderPrice(formatPeso(shippingCost))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{renderPrice(formatPeso(tax))}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>{renderPrice(formatPeso(total))}</span>
                </div>
              </div>
              
              <div className="pt-6">
                <h3 className="font-semibold border-b pb-2">Shipping Details</h3>
                <div className="mt-2 whitespace-pre-line">
                  {orderDetails.shipping_address}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <Button asChild variant="outline">
              <Link to="/orders">View All Orders</Link>
            </Button>
            <Button asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
