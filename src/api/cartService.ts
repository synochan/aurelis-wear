
import { apiConfig, handleApiResponse, withAuth } from './config';
import { CartItem } from '../context/CartContext';

export const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await fetch(`${apiConfig.baseURL}/cart/`, {
      method: 'GET',
      headers: withAuth(apiConfig.headers)
    });
    
    return handleApiResponse(response);
  },
  
  // Add item to cart
  addToCart: async (item: Omit<CartItem, 'quantity'> & { quantity: number }) => {
    const response = await fetch(`${apiConfig.baseURL}/cart/items/`, {
      method: 'POST',
      headers: withAuth(apiConfig.headers),
      body: JSON.stringify({
        product_id: item.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      })
    });
    
    return handleApiResponse(response);
  },
  
  // Update cart item quantity
  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await fetch(`${apiConfig.baseURL}/cart/items/${itemId}/`, {
      method: 'PATCH',
      headers: withAuth(apiConfig.headers),
      body: JSON.stringify({ quantity })
    });
    
    return handleApiResponse(response);
  },
  
  // Remove item from cart
  removeFromCart: async (itemId: number) => {
    const response = await fetch(`${apiConfig.baseURL}/cart/items/${itemId}/`, {
      method: 'DELETE',
      headers: withAuth(apiConfig.headers)
    });
    
    if (response.status === 204) {
      return { success: true };
    }
    
    return handleApiResponse(response);
  },
  
  // Clear entire cart
  clearCart: async () => {
    const response = await fetch(`${apiConfig.baseURL}/cart/clear/`, {
      method: 'POST',
      headers: withAuth(apiConfig.headers)
    });
    
    if (response.status === 204) {
      return { success: true };
    }
    
    return handleApiResponse(response);
  }
};

// Type definitions for cart API responses
export interface CartResponse {
  id: number;
  items: CartItemResponse[];
  total: number;
}

export interface CartItemResponse {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

// Convert API cart response to frontend cart items
export const mapCartItemsFromApi = (cartResponse: CartResponse): CartItem[] => {
  return cartResponse.items.map(item => ({
    id: item.product_id,
    name: item.name,
    price: item.price,
    image: item.image,
    color: item.color,
    size: item.size,
    quantity: item.quantity
  }));
};
