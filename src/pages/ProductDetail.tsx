
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingBag, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import FeaturedProducts from '@/components/FeaturedProducts';

// Dummy product data (would be fetched from API in a real app)
const product: Product = {
  id: 1,
  name: "Performance Running Shoes",
  price: 129.99,
  category: "shoes",
  image: "/placeholder.svg",
  isNew: true,
  colors: ["#000000", "#FFFFFF", "#0062FF", "#FF0000"],
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "#000000");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // In a real app, we would fetch product details based on the ID
  
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor,
      size: selectedSize,
      quantity
    });
  };
  
  // Dummy image gallery (in a real app, these would come from the product data)
  const images = [
    product.image,
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ];
  
  // Dummy sizes (in a real app, these would come from the product data)
  const sizes = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"];

  return (
    <div className="bg-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4 aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, i) => (
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
              <p className="text-xl font-medium">${product.price.toFixed(2)}</p>
            </div>
            
            <Separator className="my-6" />
            
            {/* Color Options */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Color: {selectedColor === "#000000" ? "Black" : selectedColor === "#FFFFFF" ? "White" : selectedColor === "#0062FF" ? "Blue" : "Red"}</h3>
              <div className="flex gap-2">
                {product.colors?.map((color, i) => (
                  <button
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-aurelis' : ''}`}
                    style={{ backgroundColor: color === "#FFFFFF" ? color : color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && color === "#FFFFFF" && (
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
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`py-2 border rounded-md text-sm font-medium transition-colors
                      ${selectedSize === size 
                        ? 'bg-black text-white border-black' 
                        : 'border-gray-300 hover:border-black'
                      }`
                    }
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
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
                  <p>
                    The Aurelis Performance Running Shoes are designed for maximum comfort and support during your runs.
                    Featuring responsive cushioning and breathable materials, these shoes deliver both style and performance.
                  </p>
                  <p>
                    The lightweight design reduces fatigue, while the durable outsole provides excellent traction on various surfaces.
                    Perfect for both casual joggers and serious runners.
                  </p>
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
