import { apiClient } from './client';
import { CartItem } from '@/context/CartContext';
import { authService } from './authService';

// Type definitions
export interface AddToCartItem {
  product_id: number;
  color_id: number;
  size_id: number;
  quantity: number;
  name?: string; // optional for display purposes only
}

export interface CartItemResponse {
  id: number;
  product_id: number;
  name: string;
  price: string;
  image: string;
  color: {
    id: number;
    name: string;
    hex_value: string;
  };
  size: {
    id: number;
    name: string;
  };
  quantity: number;
}

export interface CartResponse {
  id: number;
  items: CartItemResponse[];
  total: string;
  item_count: number;
}

// Error handling helper
const handleApiError = (error: any): never => {
  console.error('Cart API error:', error);
  
  // Check for network errors
  if (error.message === 'Network Error') {
    throw new Error('Network error. Please check your connection.');
  }
  
  // Check for authentication errors
  if (error.response?.status === 401) {
    localStorage.removeItem('token'); // Clear invalid token
    throw new Error('Authentication required');
  }
  
  // Get detailed error message if available
  const errorMessage = error.response?.data?.error 
    || error.response?.data?.detail 
    || error.message 
    || 'An unexpected error occurred';
    
  console.error('Cart API error details:', {
    status: error.response?.status,
    message: errorMessage,
    data: error.response?.data
  });
  
  throw new Error(errorMessage);
};

// Cart API functions
export const cartService = {
  // Get user's cart
  async getCart(): Promise<CartResponse> {
    try {
      const response = await apiClient.get('/api/cart/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Add item to cart
  async addToCart(item: AddToCartItem): Promise<CartResponse> {
    try {
      console.log('Adding to cart:', item);
      const response = await apiClient.post('/api/cart/items/', item);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update cart item quantity
  async updateCartItem(itemId: number, quantity: number): Promise<CartResponse> {
    try {
      console.log(`Updating cart item ${itemId} to quantity ${quantity}`);
      const response = await apiClient.patch(`/api/cart/items/${itemId}/`, {
        quantity
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Remove item from cart
  async removeFromCart(itemId: number): Promise<CartResponse> {
    try {
      console.log(`Removing cart item ${itemId}`);
      const response = await apiClient.delete(`/api/cart/items/${itemId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Clear entire cart
  async clearCart(): Promise<CartResponse> {
    try {
      console.log('Clearing cart');
      const response = await apiClient.post('/api/cart/clear/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Convert API cart response to frontend cart items
export const mapCartItemsFromApi = (cartResponse: CartResponse): CartItem[] => {
  if (!cartResponse || !cartResponse.items) {
    return [];
  }
  
  return cartResponse.items.map(item => ({
    id: item.id, 
    productId: item.product_id,
    name: item.name,
    price: parseFloat(item.price),
    image: item.image,
    color: item.color.hex_value,
    size: item.size.name,
    quantity: item.quantity
  }));
}; 