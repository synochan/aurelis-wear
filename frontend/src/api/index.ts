// Centralized exports file
import api from './config';
import { 
  useProducts,
  useFeaturedProducts,
  useProductDetails,
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useOrders,
  useOrderDetails
} from './hooks';
import { authService } from './authService';
import { type AddToCartItem } from './cartService';
import { type Order, type OrderItem } from './orderService';

// Re-export everything
export {
  api,
  useProducts,
  useFeaturedProducts,
  useProductDetails,
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useOrders,
  useOrderDetails,
  authService
};

// Re-export types
export type { AddToCartItem, Order, OrderItem };

// Default export
export default api; 