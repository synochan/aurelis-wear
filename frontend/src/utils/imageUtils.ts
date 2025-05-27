/**
 * Image utilities to handle different URL formats and provide consistent image handling
 */

const CLOUDINARY_CLOUD_NAME = 'dr5mrez5h';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const DEFAULT_PLACEHOLDER = '/product-placeholder.svg';

/**
 * Fix duplicate image/upload paths in Cloudinary URLs
 * @param url - The URL to fix
 * @returns - The fixed URL with only one image/upload segment
 */
const fixDuplicateImageUploadPaths = (url: string): string => {
  // Early exit if no duplication
  if (!url.includes('image/upload/image/upload/')) {
    return url;
  }

  // Handle URLs with any number of duplicate image/upload segments
  let fixedUrl = url;
  while (fixedUrl.includes('image/upload/image/upload/')) {
    fixedUrl = fixedUrl.replace('image/upload/image/upload/', 'image/upload/');
  }
  
  return fixedUrl;
};

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
  
  // Log the original URL for debugging
  console.log('Original image URL:', trimmedUrl);
  
  let result: string;
  
  // Case 1: Complete Cloudinary URL with potential duplicates
  if (trimmedUrl.includes('cloudinary.com')) {
    result = fixDuplicateImageUploadPaths(trimmedUrl);
  }
  // Case 2: URLs with http/https protocol but not Cloudinary 
  else if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    result = trimmedUrl;
  }
  // Case 3: Just the version and path without cloud name - v1234567890/products/image.jpg
  else if (trimmedUrl.match(/^v\d+\/products\//)) {
    result = `${CLOUDINARY_BASE_URL}/${trimmedUrl}`;
  }
  // Case 4: Just the product ID - products/image.jpg
  else if (trimmedUrl.startsWith('products/')) {
    result = `${CLOUDINARY_BASE_URL}/${trimmedUrl}`;
  } 
  // Case 5: Partial Cloudinary URL - image/upload/v1234567890/products/image.jpg
  else if (trimmedUrl.includes('image/upload/')) {
    const fixedPath = fixDuplicateImageUploadPaths(trimmedUrl);
    result = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${fixedPath}`;
  }
  // Case 6: Just the filename in products folder - image.jpg
  else if (trimmedUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    result = `${CLOUDINARY_BASE_URL}/products/${trimmedUrl}`;
  }
  // Case 7: Django media paths
  else if (trimmedUrl.startsWith('/media/')) {
    result = trimmedUrl;
  }
  // Case 8: Placeholder references
  else if (
    trimmedUrl.includes('placeholder') || 
    trimmedUrl.includes('no-image') || 
    trimmedUrl === 'null'
  ) {
    result = DEFAULT_PLACEHOLDER;
  }
  // Case 9: Relative path, ensure it has a leading slash
  else if (!trimmedUrl.startsWith('/')) {
    result = `/${trimmedUrl}`;
  }
  // Default: Return as is for other cases
  else {
    result = trimmedUrl;
  }
  
  // Apply final check for duplicate image/upload paths
  if (result.includes('cloudinary.com') && result.includes('image/upload/')) {
    result = fixDuplicateImageUploadPaths(result);
  }
  
  // Log the result for debugging
  console.log('Processed image URL:', result);
  
  return result;
};

/**
 * Find the best image to display from a product's images array
 * @param product - A product object with image and possibly images array
 * @returns The best image URL to display
 */
export const getBestProductImage = (product: any): string => {
  if (!product) return DEFAULT_PLACEHOLDER;
  
  console.log('Product for image selection:', product.id, product.name);
  
  // If we have an images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    console.log(`Product ${product.id} has ${product.images.length} images`);
    
    // Try to find a primary image first
    const primaryImage = product.images.find((img: any) => 
      typeof img === 'object' && 'is_primary' in img && img.is_primary
    );
    
    if (primaryImage && typeof primaryImage === 'object') {
      // Prefer image_url if present
      return getImageUrl(primaryImage.image_url || primaryImage.image);
    }
    
    // If no primary image, use the first image
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      console.log(`Using first string image for product ${product.id}`);
      return getImageUrl(firstImage);
    } else if (typeof firstImage === 'object') {
      // Prefer image_url if present
      return getImageUrl(firstImage.image_url || firstImage.image);
    }
  }
  
  // Fallback to the main image if available
  if (product.image_url) {
    return getImageUrl(product.image_url);
  }
  if (product.image) {
    console.log(`Using main image for product ${product.id}`);
    return getImageUrl(product.image);
  }
  
  console.log(`No valid image found for product ${product.id}, using placeholder`);
  return DEFAULT_PLACEHOLDER;
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
    
    // Preserve original size and styling
    target.style.opacity = '1';
    
    // Set placeholder image
    target.src = DEFAULT_PLACEHOLDER;
  }
};

export default {
  getImageUrl,
  getBestProductImage,
  handleImageError,
  DEFAULT_PLACEHOLDER,
}; 