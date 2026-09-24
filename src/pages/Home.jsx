import React, { useState } from 'react';
import Hero from '../components/Hero';
import CategoryScroller from '../components/CategoryScroller';
import FreshCatchSection from '../components/FreshCatchSection';
import PopularTodaySection from '../components/PopularTodaySection';
import DeliveryInfoBanner from '../components/DeliveryInfoBanner';
import TestimonialCarousel from '../components/TestimonialCarousel';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { Link } from 'react-router-dom';
import { Fish, ArrowRight } from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sliced raw fish products for the main fresh seafood catalog section
  const freshFishProducts = PRODUCTS.filter(p => p.type === 'raw').slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Clean Animated Hero Banner */}
      <Hero />

      {/* 2. Quick Category Section (Links directly to respective Shop products) */}
      <CategoryScroller />

      {/* 3. Today's Fresh Catch Section */}
      <FreshCatchSection />

      {/* 4. Popular Today Horizontal Scroller */}
      <PopularTodaySection />

      {/* 5. Main Fresh Seafood Product Grid Section */}
      <section className="py-6 sm:py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-ocean-800 uppercase tracking-wider mb-1">
                <Fish className="w-3.5 h-3.5 text-sea-600" />
                <span>Daily Sourced Raw Fish</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Fresh Seafood Catalog
              </h2>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold text-sea-600 hover:text-sea-700 transition"
            >
              <span>Explore All Fresh Seafood ({PRODUCTS.filter(p => p.type === 'raw').length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4-5 col desktop, 3 col tablet, 2 col mobile grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {freshFishProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/shop"
              className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-[5px] border border-slate-200 transition"
            >
              View Complete Seafood Catalog ({PRODUCTS.filter(p => p.type === 'raw').length} Varieties) →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Delivery Information Highlights */}
      <DeliveryInfoBanner />

      {/* 7. Corporate Dark Theme Testimonial Slider Carousel */}
      <TestimonialCarousel />
    </div>
  );
}
