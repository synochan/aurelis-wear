import { apiClient } from './client';
import { Product } from '@/components/ProductCard';

export const productService = {
  // Get all products with optional filters
  getProducts: async (filters?: Record<string, string>) => {
    try {
      // Convert category__slug to category if present
      const params = { ...filters };
      if (params.category__slug) {
        params.category = params.category__slug.toLowerCase();
        delete params.category__slug;
      }
      
      const response = await apiClient.get('/api/products/', { params });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },
  
  // Get a single product by ID
  getProductById: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get featured products
  getFeaturedProducts: async () => {
    try {
      // Since there's no dedicated featured endpoint, we'll use a parameter
      const response = await apiClient.get('/api/products/featured/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }
};

// Type definitions for backend responses
interface ProductColor {
  id: number;
  name: string;
  hex_value: string;
}

interface ProductSize {
  id: number;
  name: string;
  size_type?: string;
}

interface ProductImage {
  id: number;
  image: string;
  is_primary: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  isNew?: boolean;
  discountPercentage?: number;
  colors?: ProductColor[];
  sizes?: ProductSize[];
  inStock?: boolean;
  images?: ProductImage[] | string[];
}

// Convert backend product model to frontend model
export const mapProductFromApi = (apiProduct: ProductResponse): Product => {
  // Handle if the response is null or undefined
  if (!apiProduct) {
    return {
      id: 0,
      name: 'Product Not Found',
      price: 0,
      category: '',
      image: '/placeholder.svg',
      description: '',
      colors: [],
      sizes: [],
      images: []
    };
  }
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    category: apiProduct.category,
    image: apiProduct.image || '/placeholder.svg',
    isNew: apiProduct.isNew,
    discountPercentage: apiProduct.discountPercentage,
    description: apiProduct.description || '',
    // Include complete color objects for ProductDetail component
    colors: apiProduct.colors || [],
    // Include size objects for ProductDetail component
    sizes: apiProduct.sizes || [],
    // Include all product images
    images: apiProduct.images?.length ? apiProduct.images : [apiProduct.image || '/placeholder.svg']
  };
};
