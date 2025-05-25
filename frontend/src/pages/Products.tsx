import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProducts } from '@/api';

const categories = [
  "All",
  "Shoes",
  "Hoodies",
  "T-shirts",
  "Leggings",
  "Shorts",
  "Jackets",
  "Accessories"
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" }
];

const filters = [
  {
    name: "Category",
    options: categories.filter(cat => cat !== "All"),
  },
  {
    name: "Size",
    options: ["XS", "S", "M", "L", "XL", "XXL", "39", "40", "41", "42", "43", "44", "45"],
  },
  {
    name: "Color",
    options: ["Black", "White", "Blue", "Red", "Green", "Gray"],
  },
  {
    name: "Price",
    options: ["Under $50", "$50 - $100", "$100 - $150", "Over $150"],
  }
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Create API filter params
  const apiFilters: Record<string, string> = {};
  if (categoryFromUrl) {
    apiFilters.category__slug = categoryFromUrl.toLowerCase();
  }
  
  // Fetch products from API
  const { data: products, isLoading, error } = useProducts(apiFilters);
  
  const isMobile = useIsMobile();

  // Apply client-side sorting
  const sortedProducts = React.useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        // For demo purposes, we'll just randomize
        filtered = [...filtered].sort(() => Math.random() - 0.5);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price));
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price));
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => {
          const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price));
          const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price));
          return priceB - priceA;
        });
        break;
      default:
        // Featured: keep default order
        break;
    }
    
    return filtered;
  }, [products, sortBy]);

  const toggleFilter = (filterName: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters[filterName]) {
        newFilters[filterName] = [value];
      } else {
        if (newFilters[filterName].includes(value)) {
          newFilters[filterName] = newFilters[filterName].filter(v => v !== value);
          if (newFilters[filterName].length === 0) {
            delete newFilters[filterName];
          }
        } else {
          newFilters[filterName] = [...newFilters[filterName], value];
        }
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gray-100 py-8">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold">
            {categoryFromUrl 
              ? `${categoryFromUrl.charAt(0).toUpperCase() + categoryFromUrl.slice(1)}'s Apparel` 
              : "All Products"}
          </h1>
        </div>
      </div>
      
      <div className="container-custom py-8">
        {/* Filters & Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
            {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter Panel */}
        {(filtersOpen || !isMobile) && (
          <div className="bg-gray-50 rounded-md p-4 mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              {Object.keys(activeFilters).length > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="h-auto py-1 px-2 text-sm">
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.name}>
                  <Accordion type="single" collapsible defaultValue={filter.name}>
                    <AccordionItem value={filter.name} className="border-none">
                      <AccordionTrigger className="py-2 font-medium">
                        {filter.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {filter.options.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`${filter.name}-${option}`} 
                                checked={(activeFilters[filter.name] || []).includes(option)}
                                onCheckedChange={() => toggleFilter(filter.name, option)}
                              />
                              <label 
                                htmlFor={`${filter.name}-${option}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-aurelis" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p className="text-red-600 mb-4">Failed to load products. Please try again.</p>
            <Button asChild variant="default">
              <a href="/products">Refresh</a>
            </Button>
          </div>
        )}
        
        {/* Product Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {sortedProducts && sortedProducts.length > 0 ? (
              sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-600 mb-4">No products found.</p>
                <Button asChild variant="default">
                  <a href="/products">View all products</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
