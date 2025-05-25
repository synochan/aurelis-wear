import React, { createContext, useContext, ReactNode } from 'react';
import { useCart as useCartQuery, useAddToCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '@/api/hooks';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/api/authService';
import { AddToCartItem } from '@/api/cartService';

export interface CartItem {
  id: number;        // Cart item ID for operations
  productId: number; // Product ID for product reference
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: AddToCartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { data: cart = [], isLoading: isCartLoading } = useCartQuery();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const { toast } = useToast();
  
  const addToCart = async (item: AddToCartItem) => {
    try {
      if (!authService.isAuthenticated()) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        });
        return;
      }
      
      await addToCartMutation.mutateAsync(item);
      toast({
        title: "Added to Cart",
        description: `${item.name || 'Item'} has been added to your cart.`,
      });
    } catch (error) {
      let errorMessage = "Failed to add item to cart. Please try again.";
      
      if (error instanceof Error && error.message === "Authentication required") {
        errorMessage = "Your session has expired. Please log in to continue.";
        // Redirect to login page or show login modal
      }
      
      console.error('Failed to add item to cart:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const removeFromCart = async (itemId: number) => {
    try {
      if (!authService.isAuthenticated()) {
        toast({
          title: "Login Required",
          description: "Please log in to manage your cart.",
          variant: "destructive",
        });
        return;
      }
      
      await removeFromCartMutation.mutateAsync(itemId);
    } catch (error) {
      let errorMessage = "Failed to remove item from cart. Please try again.";
      
      if (error instanceof Error && error.message === "Authentication required") {
        errorMessage = "Your session has expired. Please log in to continue.";
      }
      
      console.error('Failed to remove item from cart:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      if (!authService.isAuthenticated()) {
        toast({
          title: "Login Required",
          description: "Please log in to update your cart.",
          variant: "destructive",
        });
        return;
      }
      
      await updateCartItemMutation.mutateAsync({ itemId, quantity });
    } catch (error) {
      let errorMessage = "Failed to update cart. Please try again.";
      
      if (error instanceof Error && error.message === "Authentication required") {
        errorMessage = "Your session has expired. Please log in to continue.";
      }
      
      console.error('Failed to update cart:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const clearCart = async () => {
    try {
      if (!authService.isAuthenticated()) {
        toast({
          title: "Login Required", 
          description: "Please log in to manage your cart.",
          variant: "destructive",
        });
        return;
      }
      
      await clearCartMutation.mutateAsync();
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      let errorMessage = "Failed to clear cart. Please try again.";
      
      if (error instanceof Error && error.message === "Authentication required") {
        errorMessage = "Your session has expired. Please log in to continue.";
      }
      
      console.error('Failed to clear cart:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  // Calculate cart totals
  const cartTotal = React.useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);
  
  const cartItemCount = React.useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);
  
  // Determine if any cart operation is loading
  const isLoading = isCartLoading || 
    addToCartMutation.isPending || 
    updateCartItemMutation.isPending || 
    removeFromCartMutation.isPending || 
    clearCartMutation.isPending;
  
  return (
    <CartContext.Provider 
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
