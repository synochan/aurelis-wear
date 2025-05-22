
import { apiConfig, handleApiResponse, withAuth } from './config';
import { Product } from '../components/ProductCard';

export const productService = {
  // Get all products with optional filters
  getProducts: async (filters?: Record<string, string>) => {
    let url = `${apiConfig.baseURL}/products/`;
    
    if (filters && Object.keys(filters).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      url += `?${queryParams.toString()}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: apiConfig.headers
    });
    
    return handleApiResponse(response);
  },
  
  // Get a single product by ID
  getProductById: async (id: number) => {
    const response = await fetch(`${apiConfig.baseURL}/products/${id}/`, {
      method: 'GET',
      headers: apiConfig.headers
    });
    
    return handleApiResponse(response);
  },
  
  // Get featured products
  getFeaturedProducts: async () => {
    const response = await fetch(`${apiConfig.baseURL}/products/featured/`, {
      method: 'GET',
      headers: apiConfig.headers
    });
    
    return handleApiResponse(response);
  }
};

// Type definitions for backend responses
export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  isNew?: boolean;
  discountPercentage?: number;
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
}

// Convert backend product model to frontend model
export const mapProductFromApi = (apiProduct: ProductResponse): Product => {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    category: apiProduct.category,
    image: apiProduct.image,
    isNew: apiProduct.isNew,
    discountPercentage: apiProduct.discountPercentage,
    colors: apiProduct.colors
  };
};
