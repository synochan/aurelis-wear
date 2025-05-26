import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Product {
  id: number;
  name: string;
  price: number | string;
  category: string;
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
  // Ensure price is a number
  const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
  
  // Calculate discounted price if applicable
  const discountedPrice = product.discountPercentage 
    ? numericPrice * (1 - product.discountPercentage / 100) 
    : null;
  
  // Format price function to handle errors
  const formatPrice = (price: number): string => {
    try {
      return price.toFixed(2);
    } catch (e) {
      console.error("Error formatting price:", e);
      return "0.00";
    }
  };

  // Process image URL to ensure it works correctly
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg";
    
    // If it's already an absolute URL (starts with http or https), use it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a Cloudinary ID, construct the URL
    if (imageUrl.includes('image/upload/') || imageUrl.includes('products/')) {
      return `https://res.cloudinary.com/aurelis/image/upload/${imageUrl}`;
    }
    
    // If it's a relative path without a leading slash, add one
    if (!imageUrl.startsWith('/')) {
      return `/${imageUrl}`;
    }
    
    return imageUrl;
  };
  
  return (
    <Card className="border-none overflow-hidden group hover-scale">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          {/* Wishlist button */}
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full">
            <Heart className="h-4 w-4" />
          </Button>
          
          {/* Badges */}
          <div className="absolute top-2 left-2">
            {product.isNew && (
              <Badge className="bg-aurelis text-white">New</Badge>
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
                <span className="font-semibold text-aurelis">${formatPrice(discountedPrice)}</span>
                <span className="text-gray-500 text-sm line-through">${formatPrice(numericPrice)}</span>
              </>
            ) : (
              <span className="font-semibold">${formatPrice(numericPrice)}</span>
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
