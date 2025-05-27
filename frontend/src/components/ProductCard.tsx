import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { getBestProductImage, handleImageError } from '@/utils/imageUtils';

export interface Product {
  id: number;
  name: string;
  price: number | string;
  priceDisplay?: string;
  discountPrice?: number;
  discountPriceDisplay?: string;
  categories?: {id: number; name: string; slug: string}[];
  image: string;
  isNew?: boolean;
  discountPercentage?: number;
  colors?: string[] | {id: number; name: string; hex_value: string}[];
  sizes?: {id: number; name: string; size_type?: string}[];
  images?: {id: number; image: string; is_primary: boolean}[] | string[];
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Ensure price is a number
  const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
  
  // Calculate discounted price if applicable
  const discountedPrice = product.discountPrice ?? (product.discountPercentage 
    ? numericPrice * (1 - product.discountPercentage / 100) 
    : null);
  
  // Format price function to handle errors
  const formatPrice = (price: number): string => {
    try {
      return formatCurrency(price);
    } catch (e) {
      console.error("Error formatting price:", e);
      return "₱0.00";
    }
  };
  
  // Custom image error handler that updates state
  const handleImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    handleImageError(e);
    setIsImageLoaded(true); // Still set as loaded to remove loading state
  };
  
  return (
    <Card className="border-none overflow-hidden group hover-scale">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={getBestProductImage(product)} 
            alt={product.name}
            className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageLoadError}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Loading skeleton (shows until image loads) */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          )}
          
          {/* Wishlist button */}
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full">
            <Heart className="h-4 w-4" />
          </Button>
          
          {/* Badges */}
          <div className="absolute top-2 left-2">
            {product.isNew && (
              <Badge variant="aurelis">New</Badge>
            )}
            {product.discountPercentage && (
              <Badge variant="destructive" className="ml-2">-{product.discountPercentage}%</Badge>
            )}
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-base mb-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span className="font-semibold text-aurelis">
                  {product.discountPriceDisplay || formatPrice(discountedPrice)}
                </span>
                <span className="text-gray-500 text-sm line-through">
                  {product.priceDisplay || formatPrice(numericPrice)}
                </span>
              </>
            ) : (
              <span className="font-semibold">
                {product.priceDisplay || formatPrice(numericPrice)}
              </span>
            )}
          </div>
        </Link>
        
        {/* Color options */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex mt-3 gap-1">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ 
                  backgroundColor: typeof color === 'string' 
                    ? color 
                    : color.hex_value 
                }}
              />
            ))}
            {product.colors.length > 4 && (
              <div className="text-xs text-gray-500 ml-1">+{product.colors.length - 4}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
