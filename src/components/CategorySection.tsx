
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryTile {
  title: string;
  image: string;
  link: string;
  className?: string;
}

const categories: CategoryTile[] = [
  {
    title: "Men",
    image: "/placeholder.svg",
    link: "/products?category=men",
    className: "md:col-span-1",
  },
  {
    title: "Women",
    image: "/placeholder.svg",
    link: "/products?category=women",
    className: "md:col-span-1",
  },
  {
    title: "Training Essentials",
    image: "/placeholder.svg",
    link: "/products?category=training",
    className: "md:col-span-2",
  }
];

const CategorySection: React.FC = () => {
  return (
    <section className="py-16 bg-aurelis-background">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Shop by Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-xl aspect-[16/9] ${category.className || ""}`}
            >
              <img 
                src={category.image} 
                alt={category.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-3">{category.title}</h3>
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
      </div>
    </section>
  );
};

export default CategorySection;
