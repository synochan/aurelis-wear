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
    </div>
  );
};

export default Index;
