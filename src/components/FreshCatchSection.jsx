import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Anchor } from 'lucide-react';
import ProductCard from './ProductCard';
import { PRODUCTS } from '../data/products';

export default function FreshCatchSection() {
  const freshCatchProducts = PRODUCTS.filter(p => p.isFreshCatch && p.type === 'raw').slice(0, 4);

  return (
    <section className="py-6 sm:py-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sea-700 uppercase tracking-wider mb-1">
              <Anchor className="w-3.5 h-3.5" />
              <span>Harbor Sourcing Notice</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Today's Fresh Catch
            </h2>
          </div>

          <Link
            to="/shop?filter=fresh-catch"
            className="inline-flex items-center gap-1 text-xs font-bold text-sea-600 hover:text-sea-700 transition self-start sm:self-auto"
          >
            <span>View All Harbor Fresh ({PRODUCTS.filter(p => p.isFreshCatch).length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-col desktop, 3-col tablet, 2-col mobile product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {freshCatchProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
