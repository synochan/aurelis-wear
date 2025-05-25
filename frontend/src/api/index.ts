// Export API components for easier importing
import api from './config';

// Export all hooks directly
export { 
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

// Export services
export { authService } from './authService';
export { type AddToCartItem } from './cartService';

// Default export
export default api; 