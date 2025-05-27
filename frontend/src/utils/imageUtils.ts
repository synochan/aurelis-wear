/**
 * Image utilities to handle different URL formats and provide consistent image handling
 */

const CLOUDINARY_CLOUD_NAME = 'dr5mrez5h';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const DEFAULT_PLACEHOLDER = '/product-placeholder.svg';

/**
 * Debug function to log image URLs during development
 * @param originalUrl - The original URL
 * @param processedUrl - The processed URL
 */
const debugImageUrl = (originalUrl: string, processedUrl: string): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`Image URL processing: ${originalUrl} → ${processedUrl}`);
  }
};

/**
 * Get a properly formatted image URL based on various possible input formats
 * @param imageUrl - The raw image URL or path
 * @returns - A properly formatted URL that can be used in an img src attribute
 */
export const getImageUrl = (imageUrl?: string): string => {
  // Return placeholder if no image or empty string
  if (!imageUrl || imageUrl === '') {
    return DEFAULT_PLACEHOLDER;
  }
  
  // Remove potential whitespace
  const trimmedUrl = imageUrl.trim();
  
  // Handle null, undefined, or "null" string values
  if (!trimmedUrl || trimmedUrl === 'null' || trimmedUrl === 'undefined') {
    return DEFAULT_PLACEHOLDER;
  }
  
  let result: string;
  
  // URLs with protocol - already absolute, check for duplicate paths
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    // Fix duplicate image/upload paths in Cloudinary URLs
    if (trimmedUrl.includes('cloudinary.com') && 
        trimmedUrl.includes('image/upload/image/upload/')) {
      result = trimmedUrl.replace('image/upload/image/upload/', 'image/upload/');
    } else {
      result = trimmedUrl;
    }
  }
  // Cloudinary full URL
  else if (trimmedUrl.includes('cloudinary.com')) {
    // Check for duplicate paths here too
    if (trimmedUrl.includes('image/upload/image/upload/')) {
      result = trimmedUrl.replace('image/upload/image/upload/', 'image/upload/');
    } else {
      result = trimmedUrl;
    }
  }
  // Cloudinary asset ID format: v1234567890/products/image.jpg
  else if (trimmedUrl.match(/^v\d+\//) || trimmedUrl.includes('/products/')) {
    result = `${CLOUDINARY_BASE_URL}/${trimmedUrl}`;
  }
  // Cloudinary path format: image/upload/v1234567890/products/image.jpg
  else if (trimmedUrl.includes('image/upload/')) {
    // Check for duplicate paths in the path-only format
    const fixedPath = trimmedUrl.includes('image/upload/image/upload/') 
      ? trimmedUrl.replace('image/upload/image/upload/', 'image/upload/') 
      : trimmedUrl;
    result = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${fixedPath}`;
  }
  // Public ID only format (direct reference): products/image.jpg
  else if (trimmedUrl.startsWith('products/')) {
    result = `${CLOUDINARY_BASE_URL}/${trimmedUrl}`;
  }
  // Django media paths
  else if (trimmedUrl.startsWith('/media/')) {
    result = trimmedUrl;
  }
  // Handle potential placeholder references
  else if (
    trimmedUrl.includes('placeholder') || 
    trimmedUrl.includes('no-image') || 
    trimmedUrl === 'null'
  ) {
    result = DEFAULT_PLACEHOLDER;
  }
  // Relative path, ensure it has a leading slash
  else if (!trimmedUrl.startsWith('/')) {
    result = `/${trimmedUrl}`;
  }
  // Return as is for other cases
  else {
    result = trimmedUrl;
  }
  
  // Log for debugging
  debugImageUrl(trimmedUrl, result);
  
  return result;
};

/**
 * Find the best image to display from a product's images array
 * @param product - A product object with image and possibly images array
 * @returns The best image URL to display
 */
export const getBestProductImage = (product: any): string => {
  if (!product) return DEFAULT_PLACEHOLDER;
  
  // If we have an images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // Try to find a primary image first
    const primaryImage = product.images.find((img: any) => 
      typeof img === 'object' && 'is_primary' in img && img.is_primary
    );
    
    if (primaryImage && typeof primaryImage === 'object' && 'image' in primaryImage) {
      return getImageUrl(primaryImage.image);
    }
    
    // If no primary image, use the first image
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      return getImageUrl(firstImage);
    } else if (typeof firstImage === 'object' && 'image' in firstImage) {
      return getImageUrl(firstImage.image);
    }
  }
  
  // Fallback to the main image if available, otherwise use placeholder
  return product.image ? getImageUrl(product.image) : DEFAULT_PLACEHOLDER;
};

/**
 * Handle image loading errors by replacing with a placeholder
 * @param event - The error event from the img element
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
  const target = event.target as HTMLImageElement;
  
  // Only replace if not already using placeholder
  if (!target.src.includes('placeholder')) {
    console.warn(`Image failed to load: ${target.src}. Using placeholder.`);
    target.src = DEFAULT_PLACEHOLDER;
  }
};

export default {
  getImageUrl,
  getBestProductImage,
  handleImageError,
  DEFAULT_PLACEHOLDER,
}; 