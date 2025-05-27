import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, mapProductFromApi, ProductResponse } from './productService';
import { authService, LoginCredentials, RegisterData } from './authService';
import { cartService, CartResponse, AddToCartItem } from './cartService';
import  orderService  from './orderService';
import { Product } from '@/components/ProductCard';
import { CartItem } from '@/context/CartContext';

// Query keys
export const queryKeys = {
  products: {
    all: ['products'] as const,
    featured: ['products', 'featured'] as const,
    details: (id: number) => ['products', id] as const,
    filtered: (filters: Record<string, string>) => ['products', 'filtered', filters] as const,
  },
  cart: {
    all: ['cart'] as const,
    items: ['cart', 'items'] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
  },
  orders: {
    all: ['orders'] as const,
    details: (id: number) => ['orders', id] as const,
  },
};

// Product Hooks
export function useProducts(filters?: Record<string, string>) {
  return useQuery({
    queryKey: filters ? queryKeys.products.filtered(filters) : queryKeys.products.all,
    queryFn: async () => {
      try {
        const data = await productService.getProducts(filters);
        return Array.isArray(data) ? data.map(mapProductFromApi) : [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.products.featured,
    queryFn: async () => {
      try {
        // Try to get featured products
        const data = await productService.getFeaturedProducts();
        return Array.isArray(data) ? data.map(mapProductFromApi) : [];
      } catch (error) {
        // This will only happen if all fallbacks in productService fail
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    retry: 2, // Retry twice - the service already has internal retries
    refetchOnWindowFocus: false,
  });
}

export function useProductDetails(id: number) {
  return useQuery({
    queryKey: queryKeys.products.details(id),
    queryFn: async () => {
      try {
        const data = await productService.getProductById(id);
        return mapProductFromApi(data);
      } catch (error) {
        // Return default product to avoid UI errors
        return {
          id: 0,
          name: 'Product Not Found',
          price: 0,
          categories: [],
          image: '',
          description: 'This product could not be loaded.',
          priceDisplay: '₱0.00',
          discountPrice: undefined,
          discountPriceDisplay: undefined,
          isNew: false,
          discountPercentage: undefined,
          colors: [],
          sizes: [],
          images: []
        };
      }
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

// Auth Hooks
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onError: (error: any) => {
      // Improve the error message if possible
      if (error.message === 'API Error: 401') {
        error.message = 'Invalid email or password. Please try again.';
      } else if (error.message === 'API Error: 400') {
        error.message = 'Please provide both email and password.';
      }
    },
    onSuccess: () => {
      // Invalidate user profile query to refetch with new auth
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      // Also invalidate cart after login
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onError: (error: any) => {
      // Improve the error message if possible
      if (error.message === 'API Error: 400') {
        error.message = 'Registration failed. This email or username might already be taken.';
      }
    },
    onSuccess: () => {
      // Invalidate user profile query to refetch with new auth
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      // Also invalidate cart after registration
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await authService.logout();
      return true;
    },
    onSuccess: () => {
      // Clear user data and reset relevant queries
      queryClient.invalidateQueries();
      // Force reset queries
      queryClient.resetQueries();
    }
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
    retry: 1, // Retry once in case of network errors
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper function to map API response to frontend cart items
const mapCartItems = (cartResponse: CartResponse): CartItem[] => {
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

// Cart hooks
export const useCart = () => {
  const queryClient = useQueryClient();
  
  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        // Skip API call if not authenticated
        if (!authService.isAuthenticated()) {
          return [];
        }
        
        const cartResponse = await cartService.getCart();
        return mapCartItems(cartResponse);
      } catch (error) {
        // Return empty cart on error
        return [];
      }
    },
    // Disable automatic refetching when window is focused or reconnected
    // to prevent unnecessary API calls
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (item: AddToCartItem) => cartService.addToCart(item),
    onSuccess: () => {
      // Invalidate cart query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) => 
      cartService.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: number) => cartService.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

// Order Hooks
export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: async () => {
      try {
        if (!authService.isAuthenticated()) {
          return [];
        }
        return await orderService.getOrders();
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: authService.isAuthenticated(),
  });
}

export function useOrderDetails(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.details(id),
    queryFn: async () => {
      try {
        if (!id || !authService.isAuthenticated()) {
          throw new Error("Order ID is missing or user is not authenticated");
        }
        return await orderService.getOrderById(id);
      } catch (error) {
        console.error(`Error fetching order #${id}:`, error);
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!id && authService.isAuthenticated(),
  });
}

// Add other hooks for cart, etc. as needed