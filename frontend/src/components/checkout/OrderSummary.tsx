import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingDetails?: any; 
}

const OrderSummary = ({ cartItems, shippingDetails }: OrderSummaryProps) => {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate estimated tax (for example, 8%)
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  
  // Shipping fee (fixed or calculated based on order total)
  const shippingFee = subtotal > 100 ? 0 : 7.99;
  
  // Calculate total
  const total = subtotal + tax + shippingFee;

  // Helper to format currency
  const formatPeso = (amount) => formatCurrency(amount);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order items */}
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="flex-1">
                {item.name} ({item.size}, {item.color})
                <span className="ml-1 text-gray-500">x{item.quantity}</span>
              </span>
              <span className="font-medium">{formatPeso(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          {/* Subtotal */}
          <div className="flex justify-between py-1">
            <span className="text-sm">Subtotal</span>
            <span className="font-medium">{formatPeso(subtotal)}</span>
          </div>
          
          {/* Shipping */}
          <div className="flex justify-between py-1">
            <span className="text-sm">Shipping</span>
            <span className="font-medium">
              {shippingFee === 0 ? 'Free' : formatPeso(shippingFee)}
            </span>
          </div>
          
          {/* Tax */}
          <div className="flex justify-between py-1">
            <span className="text-sm">Estimated Tax</span>
            <span className="font-medium">{formatPeso(tax)}</span>
          </div>
          
          {/* Total */}
          <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">{formatPeso(total)}</span>
          </div>
        </div>
        
        {/* Shipping address if available */}
        {shippingDetails && (
          <div className="mt-6 text-sm">
            <h3 className="font-semibold mb-2">Shipping Details:</h3>
            <p>{shippingDetails.firstName} {shippingDetails.lastName}</p>
            <p>{shippingDetails.address}</p>
            <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}</p>
            <p>{shippingDetails.country}</p>
            <p>{shippingDetails.email}</p>
            <p>{shippingDetails.phone}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;