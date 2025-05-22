
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService, mapCartItemsFromApi } from '../api/cartService';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Fetch cart on initial load
  useEffect(() => {
    const fetchCart = async () => {
      // Skip if no auth token exists (user not logged in)
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;
      
      try {
        setIsLoading(true);
        const cartResponse = await cartService.getCart();
        const cartItems = mapCartItemsFromApi(cartResponse);
        setCart(cartItems);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        toast({
          title: "Error",
          description: "Failed to load your cart items.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, [toast]);
  
  const addToCart = async (item: CartItem) => {
    try {
      setIsLoading(true);
      
      // Check if we should make API call (user logged in)
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        await cartService.addToCart(item);
        const cartResponse = await cartService.getCart();
        const cartItems = mapCartItemsFromApi(cartResponse);
        setCart(cartItems);
      } else {
        // Fallback to local cart management if not logged in
        const existingIndex = cart.findIndex(
          cartItem => 
            cartItem.id === item.id && 
            cartItem.color === item.color && 
            cartItem.size === item.size
        );
        
        if (existingIndex !== -1) {
          // Item exists, update quantity
          const updatedCart = [...cart];
          updatedCart[existingIndex].quantity += item.quantity;
          setCart(updatedCart);
        } else {
          // Item doesn't exist, add to cart
          setCart([...cart, item]);
        }
      }
      
      toast({
        title: "Added to Cart",
        description: `${item.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFromCart = async (index: number) => {
    try {
      setIsLoading(true);
      const itemToRemove = cart[index];
      
      // Check if we should make API call (user logged in)
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        await cartService.removeFromCart(itemToRemove.id);
        const cartResponse = await cartService.getCart();
        const cartItems = mapCartItemsFromApi(cartResponse);
        setCart(cartItems);
      } else {
        // Fallback to local cart management if not logged in
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateQuantity = async (index: number, quantity: number) => {
    try {
      setIsLoading(true);
      const itemToUpdate = cart[index];
      
      // Check if we should make API call (user logged in)
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        await cartService.updateCartItem(itemToUpdate.id, quantity);
        const cartResponse = await cartService.getCart();
        const cartItems = mapCartItemsFromApi(cartResponse);
        setCart(cartItems);
      } else {
        // Fallback to local cart management if not logged in
        const newCart = [...cart];
        newCart[index].quantity = quantity;
        setCart(newCart);
      }
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearCart = async () => {
    try {
      setIsLoading(true);
      
      // Check if we should make API call (user logged in)
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        await cartService.clearCart();
      }
      
      // Always clear local cart state
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear your cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate total number of items in cart
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      isLoading
    }}>
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
