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
  useClearCart
} from './hooks';
import { authService } from './authService';
import { type AddToCartItem } from './cartService';

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
  authService
};

// Re-export types
export type { AddToCartItem };

// Default export
export default api; 