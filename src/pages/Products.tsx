import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard, { Product } from '@/components/ProductCard';
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
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample products data
const dummyProducts: Product[] = [
  { id: 1, name: "Performance Running Shoes", price: 129.99, category: "shoes", image: "/placeholder.svg", isNew: true },
  { id: 2, name: "Lightweight Training Hoodie", price: 79.99, category: "hoodies", image: "/placeholder.svg", discountPercentage: 15 },
  { id: 3, name: "Pro Compression Leggings", price: 64.99, category: "leggings", image: "/placeholder.svg" },
  { id: 4, name: "Athletic Performance Tee", price: 34.99, category: "tshirts", image: "/placeholder.svg" },
  { id: 5, name: "Essential Training Shorts", price: 49.99, category: "shorts", image: "/placeholder.svg" },
  { id: 6, name: "Performance Zip Jacket", price: 89.99, category: "jackets", image: "/placeholder.svg", isNew: true },
  { id: 7, name: "Cushioned Running Socks", price: 14.99, category: "socks", image: "/placeholder.svg" },
  { id: 8, name: "Technical Fitness Gloves", price: 29.99, category: "accessories", image: "/placeholder.svg" },
  { id: 9, name: "Workout Cap", price: 24.99, category: "accessories", image: "/placeholder.svg", discountPercentage: 20 },
  { id: 10, name: "Reflective Running Vest", price: 59.99, category: "vests", image: "/placeholder.svg" },
  { id: 11, name: "Premium Sport Bottle", price: 19.99, category: "accessories", image: "/placeholder.svg" },
  { id: 12, name: "Cross Training Shoes", price: 119.99, category: "shoes", image: "/placeholder.svg", isNew: true },
];

const categories = [
  "All",
  "Shoes",
  "Hoodies",
  "Tshirts",
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
    options: ["XS", "S", "M", "L", "XL", "XXL"],
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
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const isMobile = useIsMobile();

  // Load and filter products based on URL parameters
  useEffect(() => {
    let filtered = [...dummyProducts];
    
    if (categoryFromUrl) {
      filtered = filtered.filter(
        p => p.category.toLowerCase() === categoryFromUrl.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        // For demo purposes, we'll just randomize
        filtered = [...filtered].sort(() => Math.random() - 0.5);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      default:
        // Featured: keep default order
        break;
    }
    
    setProducts(filtered);
  }, [categoryFromUrl, sortBy]);

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
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {products.length > 0 ? (
            products.map(product => (
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
      </div>
    </div>
  );
};

export default Products;
