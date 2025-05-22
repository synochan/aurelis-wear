
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  isNew?: boolean;
  discountPercentage?: number;
  colors?: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Calculate discounted price if applicable
  const discountedPrice = product.discountPercentage 
    ? product.price * (1 - product.discountPercentage / 100) 
    : null;
  
  return (
    <Card className="border-none overflow-hidden group hover-scale">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.image || "/placeholder.svg"} 
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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
                <span className="font-semibold text-aurelis">${discountedPrice.toFixed(2)}</span>
                <span className="text-gray-500 text-sm line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-semibold">${product.price.toFixed(2)}</span>
            )}
          </div>
        </Link>
        
        {/* Color options */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex mt-3 gap-1">
            {product.colors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
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
