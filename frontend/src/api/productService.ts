import { apiClient } from './client';
import { Product } from '@/components/ProductCard';
import { formatCurrency } from '@/utils/formatters';
import { getImageUrl } from '@/utils/imageUtils';

// Helper function to format price as Philippine Peso
export const formatPrice = (price: number): string => {
  return formatCurrency(price);
};

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
      
      // Try to get from the API
      const response = await apiClient.get('/products', { params });
      const data = response.data.results || response.data;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No products found');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get a single product by ID
  getProductById: async (id: number) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (!response.data) {
        throw new Error('Product not found');
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get featured products
  getFeaturedProducts: async () => {
    try {
      // First try with the is_featured filter
      const response = await apiClient.get('/products', { 
        params: { is_featured: true } 
      });
      const data = response.data.results || response.data;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No featured products found');
      }
      
      return data;
    } catch (error) {
      throw error;
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
  price_display?: string;
  discount_price?: number;
  discount_price_display?: string;
  categories?: {id: number; name: string; slug: string}[];
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
      priceDisplay: '₱0.00',
      categories: [],
      image: '',
      description: '',
      colors: [],
      sizes: [],
      images: []
    };
  }
  
  // Process the main image
  const mainImage = getImageUrl(apiProduct.image);
  
  // Process the array of images if present
  let processedStringImages: string[] = [];
  let processedObjectImages: ProductImage[] = [];
  
  if (apiProduct.images?.length) {
    // Sort the images into appropriate arrays based on type
    apiProduct.images.forEach(img => {
      if (typeof img === 'string') {
        processedStringImages.push(getImageUrl(img));
      } else if (img && typeof img === 'object' && 'image' in img) {
        processedObjectImages.push({
          ...img,
          image: getImageUrl(img.image)
        });
      }
    });
  }
  
  // Determine which array to use based on what we have
  const finalImages = processedObjectImages.length > 0 
    ? processedObjectImages 
    : processedStringImages.length > 0 
      ? processedStringImages 
      : [mainImage];
  
  // Use server-provided price displays if available, otherwise format locally
  const priceDisplay = apiProduct.price_display || formatCurrency(apiProduct.price);
  const discountPriceDisplay = apiProduct.discount_price_display || 
    (apiProduct.discount_price ? formatCurrency(apiProduct.discount_price) : undefined);
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    priceDisplay: priceDisplay,
    discountPrice: apiProduct.discount_price,
    discountPriceDisplay: discountPriceDisplay,
    categories: apiProduct.categories || [],
    image: mainImage,
    isNew: apiProduct.isNew,
    discountPercentage: apiProduct.discountPercentage,
    description: apiProduct.description || '',
    colors: apiProduct.colors || [],
    sizes: apiProduct.sizes || [],
    images: finalImages
  };
};
