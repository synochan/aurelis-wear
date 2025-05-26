import { apiClient } from './client';
import { Product } from '@/components/ProductCard';

// Helper function to process image URLs
const processImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return "";
  
  // If it's already an absolute URL (starts with http or https), use it as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a Cloudinary ID, construct the URL
  if (imageUrl.includes('image/upload/') || imageUrl.includes('products/')) {
    return `https://res.cloudinary.com/dr5mrez5h/image/upload/${imageUrl}`;
  }
  
  // If it's a relative path without a leading slash, add one
  if (!imageUrl.startsWith('/')) {
    return `/${imageUrl}`;
  }
  
  return imageUrl;
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
      
      const response = await apiClient.get('/products', { params });
      return response.data.results || response.data;
    } catch (error) {
      // Silently handle errors
      return [];
    }
  },
  
  // Get a single product by ID
  getProductById: async (id: number) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get featured products
  getFeaturedProducts: async () => {
    try {
      // Use products endpoint with is_featured filter
      const response = await apiClient.get('/products', { 
        params: { is_featured: true } 
      });
      return response.data.results || response.data;
    } catch (error) {
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
      image: '',
      description: '',
      colors: [],
      sizes: [],
      images: []
    };
  }
  
  // Process the main image
  const mainImage = processImageUrl(apiProduct.image);
  
  // Process the array of images if present
  let processedStringImages: string[] = [];
  let processedObjectImages: ProductImage[] = [];
  
  if (apiProduct.images?.length) {
    // Sort the images into appropriate arrays based on type
    apiProduct.images.forEach(img => {
      if (typeof img === 'string') {
        processedStringImages.push(processImageUrl(img));
      } else if (img && typeof img === 'object' && 'image' in img) {
        processedObjectImages.push({
          ...img,
          image: processImageUrl(img.image)
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
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    category: apiProduct.category,
    image: mainImage,
    isNew: apiProduct.isNew,
    discountPercentage: apiProduct.discountPercentage,
    description: apiProduct.description || '',
    // Include complete color objects for ProductDetail component
    colors: apiProduct.colors || [],
    // Include size objects for ProductDetail component
    sizes: apiProduct.sizes || [],
    // Include all product images
    images: finalImages
  };
};
