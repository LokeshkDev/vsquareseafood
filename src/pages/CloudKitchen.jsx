import React from 'react';
import { Flame, Clock, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function CloudKitchen() {
  const dishes = PRODUCTS.filter(p => p.type === 'kitchen');

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Banner with Solid Dark Blue BG */}
        <div 
          className="text-white rounded-[5px] p-6 sm:p-8 mb-6 sm:mb-8 border border-[#03335F] relative overflow-hidden"
          style={{ backgroundColor: '#021630' }}
        >
          <div className="max-w-2xl relative z-10 space-y-2">
            <div 
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-v2orange-400 px-2.5 py-1 rounded-[3px] border border-v2orange-500/30"
              style={{ backgroundColor: '#03234C' }}
            >
              <Flame className="w-3.5 h-3.5 text-v2orange-400" />
              <span>V² Cloud Kitchen • Fresh Hot Cooked Meals</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              Authentic Coastal Seafood Kitchen
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Prepared to order using our morning harbor fresh catch. No artificial coloring, no reheated gravies. Delivered piping hot in leak-proof thermal containers across Chennai.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sea-400" />
              Average Preparation: 25-35 mins
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Fresh Ground Chettinad Spices
            </span>
          </div>
        </div>

        {/* Catalog Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Hot Prepared Dishes ({dishes.length})
            </h2>
            <p className="text-xs text-slate-500">Cooked fresh to order from today's Kasimedu morning seafood</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-[3px] border border-emerald-200">
            ● Kitchen Open Now
          </span>
        </div>

        {/* Product Cards Grid: EXACT SAME DESIGN as Fresh Seafood Store */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {dishes.map((dish) => (
            <ProductCard key={dish.id} product={dish} />
          ))}
        </div>

      </div>
    </div>
  );
}
