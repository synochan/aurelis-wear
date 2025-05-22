
import React from 'react';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import CategorySection from '@/components/CategorySection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div>
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Category Section */}
      <CategorySection />
      
      {/* Promotional Banner */}
      <section className="py-20 bg-aurelis text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Become an Aurelis Member</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Sign up for free and get exclusive access to promotions, early product releases, and personalized recommendations.
          </p>
          <Button size="lg" className="bg-white text-aurelis hover:bg-gray-100">
            Join Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      {/* Instagram Feed Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 text-center">
            #AurelisStyle
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="aspect-square relative overflow-hidden group">
                <img 
                  src="/placeholder.svg" 
                  alt={`Instagram post ${i+1}`} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">@username</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-black hover:text-aurelis font-medium inline-flex items-center"
            >
              Follow us on Instagram
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
