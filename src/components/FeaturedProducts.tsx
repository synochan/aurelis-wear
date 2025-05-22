
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard, { Product } from './ProductCard';
import { Button } from '@/components/ui/button';
import { productService, mapProductFromApi } from '../api/productService';
import { useToast } from '@/hooks/use-toast';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  title = "Featured Products", 
  subtitle = "Discover the best of our collection"
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getFeaturedProducts();
        const mappedProducts = response.map(mapProductFromApi);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
        toast({
          title: "Error",
          description: "Failed to load featured products. Using sample data instead.",
          variant: "destructive",
        });
        // Fallback to sample products if API fails
        setProducts([
          { 
            id: 1, 
            name: "Performance Running Shoes", 
            price: 129.99, 
            category: "shoes", 
            image: "/placeholder.svg", 
            isNew: true,
            colors: ["#000000", "#FFFFFF", "#FF0000"]
          },
          { 
            id: 2, 
            name: "Lightweight Training Hoodie", 
            price: 79.99, 
            category: "hoodies", 
            image: "/placeholder.svg",
            discountPercentage: 15,
            colors: ["#000000", "#3B82F6", "#6B7280", "#10B981"]
          },
          { 
            id: 3, 
            name: "Pro Compression Leggings", 
            price: 64.99, 
            category: "leggings", 
            image: "/placeholder.svg",
            colors: ["#000000", "#6B7280"]
          },
          { 
            id: 4, 
            name: "Athletic Performance Tee", 
            price: 34.99, 
            category: "tshirts", 
            image: "/placeholder.svg",
            colors: ["#000000", "#FFFFFF", "#3B82F6", "#10B981", "#EC4899", "#EAB308"]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, [toast]);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-72 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white">
            <Link to="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
