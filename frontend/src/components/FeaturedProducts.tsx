import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import FallbackProduct from './FallbackProduct';
import { Button } from '@/components/ui/button';
import { useFeaturedProducts } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  title = "Featured Products", 
  subtitle = "Discover the best of our collection"
}) => {
  const { data: products = [], isLoading, error } = useFeaturedProducts();
  const { toast } = useToast();
  
  // Show error toast if query fails
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load featured products.",
        variant: "destructive",
      });
      console.error("Featured products error:", error);
    }
  }, [error, toast]);

  // Fallback for empty products
  const hasProducts = products && products.length > 0;
  const displayItems = hasProducts ? products : Array(4).fill(null);

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((product, index) => {
            // Use a div instead of React.Fragment to avoid warnings
            return (
              <div key={product?.id || index} className="product-item">
                {isLoading ? (
                  <FallbackProduct isLoading={true} />
                ) : product ? (
                  <ProductCard product={product} />
                ) : (
                  <FallbackProduct message="Product unavailable" />
                )}
              </div>
            );
          })}
        </div>
        
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