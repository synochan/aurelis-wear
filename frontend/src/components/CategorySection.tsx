import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryTile {
  title: string;
  image: string;
  fallbackImage?: string;
  link: string;
  className?: string;
}

const categories: CategoryTile[] = [
  {
    title: "Men's Apparel",
    image: "/men-aurelis.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80",
    link: "/products?category=men",
    className: "md:col-span-1",
  },
  {
    title: "Women's Apparel",
    image: "/women-aurelis.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    link: "/products?category=women",
    className: "md:col-span-1",
  },
  {
    title: "Shoes",
    image: "/shoes-aurelis.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    link: "/products?category=shoes",
    className: "md:col-span-1",
  },
  {
    title: "Accessories",
    image: "/accessories-aurelis.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    link: "/products?category=accessories",
    className: "md:col-span-1",
  }
];

const subCategories = [
  { title: "Running", link: "/products?category=running" },
  { title: "Training", link: "/products?category=training" },
  { title: "Lifestyle", link: "/products?category=lifestyle" },
  { title: "T-shirts", link: "/products?category=t-shirts" },
  { title: "Hoodies", link: "/products?category=hoodies" },
  { title: "Shorts", link: "/products?category=shorts" },
  { title: "Leggings", link: "/products?category=leggings" },
  { title: "Jackets", link: "/products?category=jackets" }
];

const CategorySection: React.FC = () => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (index: number) => {
    setImgErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  return (
    <section className="py-16 bg-aurelis-background">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Shop by Category</h2>
        
        {/* Main Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-xl aspect-[4/5] ${category.className || ""}`}
            >
              <img 
                src={imgErrors[index] && category.fallbackImage ? category.fallbackImage : category.image} 
                alt={category.title} 
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl md:text-2xl font-bold mb-3">{category.title}</h3>
                <Button 
                  asChild 
                  variant="secondary" 
                  className="w-max bg-white hover:bg-gray-100 text-black"
                >
                  <Link to={category.link} className="flex items-center">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sub Categories */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Shop by Style</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {subCategories.map((category, index) => (
              <Button
                key={index}
                variant="outline"
                className="border-gray-300 hover:bg-aurelis hover:text-white hover:border-aurelis"
                asChild
              >
                <Link to={category.link}>
                  {category.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
