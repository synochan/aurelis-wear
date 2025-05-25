import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import FeaturedProducts from '@/components/FeaturedProducts';
import { useProductDetails } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/components/ProductCard';

// Type for our internal color representation
interface ColorInfo {
  id: number;
  name: string;
  hex_value: string;
}

// Type for our internal size representation
interface SizeInfo {
  id: number;
  name: string;
  size_type?: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const productId = parseInt(id || '0', 10);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { data: product, isLoading, error } = useProductDetails(productId);
  
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // Process all data from product in a consistent order of hooks
  // 1. Colors normalization
  const normalizedColors = React.useMemo(() => {
    if (!product?.colors) return [];
    
    return product.colors.map((color, index) => {
      if (typeof color === 'string') {
        // Convert string colors to our ColorInfo format
        return {
          id: index + 1, // Generate an ID
          name: color === '#FFFFFF' ? 'White' : 
                color === '#000000' ? 'Black' :
                `Color ${index + 1}`,
          hex_value: color
        };
      } else {
        // Already in the right format
        return color as ColorInfo;
      }
    });
  }, [product?.colors]);
  
  // 2. Sizes normalization
  const normalizedSizes = React.useMemo(() => {
    if (!product?.sizes) return [];
    return product.sizes as SizeInfo[];
  }, [product?.sizes]);
  
  // 3. Images processing
  const processedImages = React.useMemo(() => {
    if (!product) return ["/placeholder.svg"];
    
    if (product.images && product.images.length > 0) {
      // Check if we have image objects with URLs
      if (typeof product.images[0] === 'object' && 'image' in product.images[0]) {
        return product.images.map((img: any) => img.image);
      }
      // Direct image URLs
      return product.images as string[];
    }
    
    return [product.image || "/placeholder.svg"];
  }, [product]);
  
  // 4. Price formatting
  const formattedPrice = React.useMemo(() => {
    if (!product) return "0.00";
    return typeof product.price === 'number' 
      ? product.price.toFixed(2) 
      : parseFloat(String(product.price)).toFixed(2);
  }, [product]);
  
  // Set default color and size when product loads
  useEffect(() => {
    if (normalizedColors.length > 0) {
      setSelectedColorId(normalizedColors[0].id);
    }
    
    if (normalizedSizes.length > 0) {
      setSelectedSizeId(normalizedSizes[0].id);
    }
  }, [normalizedColors, normalizedSizes]);

  // Selection helpers
  const selectedColorInfo = React.useMemo(() => 
    normalizedColors.find(c => c.id === selectedColorId),
    [normalizedColors, selectedColorId]
  );
  
  const selectedSizeInfo = React.useMemo(() =>
    normalizedSizes.find(s => s.id === selectedSizeId),
    [normalizedSizes, selectedSizeId]
  );
  
  const selectedColorName = selectedColorInfo?.name || "";
  
  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSizeId) {
      toast({
        title: "Size required",
        description: "Please select a size before adding to cart",
        variant: "destructive"
      });
      return;
    }

    if (!selectedColorId) {
      toast({
        title: "Color required",
        description: "Please select a color before adding to cart",
        variant: "destructive"
      });
      return;
    }
    
    addToCart({
      product_id: product.id,
      color_id: selectedColorId,
      size_id: selectedSizeId,
      quantity,
      name: product.name // Optional, for display purposes
    });
  };
  
  if (isLoading) {
    return (
      <div className="container-custom py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-aurelis" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">Sorry, the product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4 aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={processedImages[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {processedImages.map((image, i) => (
                <div 
                  key={i}
                  className={`aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer ${activeImage === i ? 'ring-2 ring-aurelis' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} view ${i+1}`}
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Details */}
          <div>
            {/* Tags & Title */}
            <div className="mb-4">
              {product.isNew && <Badge className="bg-aurelis text-white mb-3">New Release</Badge>}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl font-medium">${formattedPrice}</p>
            </div>
            
            <Separator className="my-6" />
            
            {/* Color Options */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Color: {selectedColorName}</h3>
              <div className="flex gap-2">
                {normalizedColors.map((color) => (
                  <button
                    key={color.id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedColorId === color.id ? 'ring-2 ring-offset-2 ring-aurelis' : ''}`}
                    style={{ backgroundColor: color.hex_value }}
                    onClick={() => setSelectedColorId(color.id)}
                  >
                    {selectedColorId === color.id && color.hex_value === "#FFFFFF" && (
                      <div className="w-4 h-4 rounded-full bg-black"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Size</h3>
                <button className="text-sm text-aurelis hover:underline">Size Guide</button>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {normalizedSizes.map(size => {
                  // Group sizes by type (shoe sizes are usually numeric)
                  const isNumericSize = !isNaN(parseFloat(size.name)) && isFinite(Number(size.name));
                  const sizeType = size.size_type || (isNumericSize ? 'shoes' : 'clothing');
                  
                  return (
                    <button
                      key={size.id}
                      className={`py-2 border rounded-md text-sm font-medium transition-colors
                        ${selectedSizeId === size.id 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 hover:border-black'
                        }`
                      }
                      onClick={() => setSelectedSizeId(size.id)}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Quantity */}
            <div className="mb-8">
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex w-1/3 md:w-1/4">
                <Select value={quantity.toString()} onValueChange={(v) => setQuantity(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                className="bg-black hover:bg-gray-800 text-white flex-1"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Bag
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-black hover:bg-gray-100"
              >
                <Heart className="mr-2 h-5 w-5" />
                Favorite
              </Button>
            </div>
            
            {/* Product Information Tabs */}
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto mb-6">
                <TabsTrigger 
                  value="description" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent"
                >
                  Shipping & Returns
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-0">
                <div className="space-y-4 text-gray-700">
                  <p>{product.description || 'No description available for this product.'}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="mt-0">
                <div className="space-y-4 text-gray-700">
                  <p><strong>Materials:</strong> Engineered mesh upper, rubber outsole, EVA foam midsole</p>
                  <p><strong>Features:</strong></p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Breathable mesh upper for ventilation</li>
                    <li>Responsive cushioning for comfort</li>
                    <li>Durable rubber outsole for traction</li>
                    <li>Reinforced heel for stability</li>
                    <li>Reflective details for visibility in low light</li>
                  </ul>
                  <p><strong>Care:</strong> Spot clean with mild detergent and water. Air dry away from direct heat.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="delivery" className="mt-0">
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-medium mb-2">Shipping</h4>
                    <p>Free standard shipping on orders over $50. Delivery within 3-5 business days.</p>
                    <p className="mt-2">Express shipping available for $12.99 with delivery within 1-2 business days.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Returns</h4>
                    <p>Free returns within 30 days of delivery. Items must be unworn with the original tags attached.</p>
                    <p className="mt-2">To initiate a return, visit the returns portal on our website or contact customer service.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* You May Also Like Section */}
      <FeaturedProducts title="You May Also Like" subtitle="Check out these similar products" />
    </div>
  );
};

export default ProductDetail; 