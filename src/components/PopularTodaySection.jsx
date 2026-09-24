import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { PRODUCTS } from '../data/products';

export default function PopularTodaySection() {
  const popularProducts = PRODUCTS.filter(p => p.isPopular && p.type === 'raw');
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Section Header with Carousel Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-coral-600 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-v2orange-500" />
              <span>Trending in Chennai</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Popular Today
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/shop"
              className="text-xs font-bold text-sea-600 hover:text-sea-700 flex items-center gap-0.5 transition mr-2"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            {/* Carousel Prev / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 sm:p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-[5px] text-slate-700 transition"
                aria-label="Scroll popular products left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 sm:p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-[5px] text-slate-700 transition"
                aria-label="Scroll popular products right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Popular Products Carousel Row */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0"
        >
          {popularProducts.map((product) => (
            <div 
              key={product.id} 
              className="w-[200px] sm:w-[230px] md:w-[250px] flex-shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
