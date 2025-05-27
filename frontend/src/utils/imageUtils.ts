/**
 * Image utilities to handle different URL formats and provide consistent image handling
 */

const CLOUDINARY_CLOUD_NAME = 'dr5mrez5h';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const DEFAULT_PLACEHOLDER = '/placeholder.svg';

/**
 * Get a properly formatted image URL based on various possible input formats
 * @param imageUrl - The raw image URL or path
 * @returns - A properly formatted URL that can be used in an img src attribute
 */
export const getImageUrl = (imageUrl?: string): string => {
  // Return placeholder if no image
  if (!imageUrl) return DEFAULT_PLACEHOLDER;
  
  // URLs with protocol - already absolute
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Cloudinary full URL
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  // Cloudinary asset ID or path patterns
  if (
    imageUrl.includes('image/upload/') || 
    imageUrl.includes('products/') || 
    imageUrl.startsWith('v')
  ) {
    // Check if we need to add the full path or just the domain
    if (imageUrl.startsWith('image/upload/')) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${imageUrl}`;
    }
    
    return `${CLOUDINARY_BASE_URL}/${imageUrl}`;
  }
  
  // Django media paths
  if (imageUrl.startsWith('/media/')) {
    // TODO: If needed, construct an absolute URL based on API base URL
    return imageUrl;
  }
  
  // Relative path, ensure it has a leading slash
  if (!imageUrl.startsWith('/')) {
    return `/${imageUrl}`;
  }
  
  // Return as is for other cases
  return imageUrl;
};

/**
 * Find the best image to display from a product's images array
 * @param product - A product object with image and possibly images array
 * @returns The best image URL to display
 */
export const getBestProductImage = (product: any): string => {
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
  
  // Fallback to the main image
  return getImageUrl(product.image);
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