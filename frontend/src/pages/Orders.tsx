import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/api/hooks';
import { Loader2 } from 'lucide-react';

const Orders = () => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
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
          <div className="text-center py-8 text-gray-500">
            <p>No orders found</p>
            <p className="mt-2">Orders will appear here once you've made a purchase.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders; 