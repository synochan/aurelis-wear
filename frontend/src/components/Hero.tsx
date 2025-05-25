import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-black text-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Hero Text */}
          <div className="flex flex-col justify-center py-16 md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight animate-fadeIn opacity-0" style={{ animationDelay: '0.1s' }}>
              ELEVATE YOUR STYLE.<br />
              <span className="text-aurelis">UNLEASH YOUR POTENTIAL.</span>
            </h1>
            <p className="text-lg md:text-xl max-w-md text-gray-300 animate-fadeIn opacity-0" style={{ animationDelay: '0.3s' }}>
              Discover the latest collection designed for peak performance and unmatched style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn opacity-0" style={{ animationDelay: '0.5s' }}>
              <Button size="lg" className="bg-aurelis hover:bg-aurelis-dark text-white">
                <Link to="/products" className="flex items-center">
                  Shop Men
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                <Link to="/products" className="flex items-center">
                  Shop Women
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="md:w-1/2 min-h-[300px] md:min-h-0 relative flex items-center justify-center animate-fadeIn opacity-0" style={{ animationDelay: '0.7s' }}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
              <img 
                src="/t1.jpg" 
                alt="Aurelis Apparel" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
