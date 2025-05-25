// Re-export all hooks for easier importing
import { 
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useProducts,
  useFeaturedProducts,
  useProductDetails,
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser
} from './hooks';

import api from './config';

// Export hooks individually
export {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useProducts,
  useFeaturedProducts,
  useProductDetails,
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
  api
}; 