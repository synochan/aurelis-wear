import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderDetails } from '@/api';
import { formatCurrency } from '@/utils/formatters';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const orderIdNumber = orderId ? parseInt(orderId, 10) : 0;
  
  // Use the new hook to fetch order details
  const { 
    data: orderDetails, 
    isLoading, 
    error 
  } = useOrderDetails(orderIdNumber);

  // Format date to relative time
  const formatOrderDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate time difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-4xl text-center">
        <Loader2 className="h-8 w-8 animate-spin text-aurelis mx-auto" />
        <p className="mt-4">Loading order details...</p>
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
            <p>Failed to load order details</p>
            <Button asChild className="mt-4">
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate subtotal from items if available
  const calculateSubtotal = () => {
    if (!orderDetails?.items?.length) return 0;
    return orderDetails.items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price.toString()) || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
  };

  // Use backend values if present and > 0, otherwise calculate
  const subtotal = calculateSubtotal();
  const shippingCost = orderDetails?.shipping_price || 0;
  const tax = subtotal * 0.08; // Estimate tax as 8% of subtotal
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
            {orderDetails?.created_at && (
              <p className="text-sm text-gray-500 mt-1">
                Placed {formatOrderDate(orderDetails.created_at)}
              </p>
            )}
          </div>
          
          {orderDetails && (
            <div className="space-y-4">
              <h3 className="font-semibold border-b pb-2">Order Summary</h3>
              
              <div className="space-y-3">
                {orderDetails.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded-md bg-gray-100"
                        onError={handleImageError}
                        loading="lazy"
                      />
                      <div>
                        <div>{item.product_name}</div>
                        <div className="text-sm text-gray-500">
                          {item.size?.name && `Size: ${item.size.name}`} 
                          {item.color?.name && ` | Color: ${item.color.name}`}
                          {` | Qty: ${item.quantity}`}
                        </div>
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(parseFloat(item.price.toString()))}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
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
