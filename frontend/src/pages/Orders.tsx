import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCurrentUser, useOrders, authService } from '@/api';
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/utils/formatters';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

const Orders = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: orders = [], isLoading: ordersLoading, error } = useOrders();

  // Handle errors
  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load your orders. Please try again.',
      variant: 'destructive',
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (orderId: number) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  // Format date to relative time
  const formatOrderDate = (dateString: string) => {
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

  if (userLoading || ordersLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-aurelis" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View your past orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                    <div className="font-semibold mt-2 md:mt-0">
                      {formatCurrency(parseFloat(order.total_price.toString()))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 mb-2">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded bg-gray-100 border"
                          onError={handleImageError}
                          loading="lazy"
                        />
                        <span className="flex-1">{item.product_name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-gray-500 italic">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <span>View Order</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your order history will appear here once you've made a purchase.
              </p>
              <Button 
                className="mt-6" 
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders; 