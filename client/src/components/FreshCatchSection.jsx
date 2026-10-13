import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Anchor } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/product.service';

export default function FreshCatchSection({
  title = "Today's Fresh Catch",
  tamil = "இன்றைய வரத்து",
  subtitle = "Directly sourced from Chennai & Tuticorin boats this morning",
  badge = "Harbor Sourcing Notice",
  products,
}) {
  const [liveProducts, setLiveProducts] = useState(products || []);

  useEffect(() => {
    if (products) {
      setLiveProducts(products);
      return;
    }
    const loadData = () => {
      productService.getProducts({ limit: 50 })
        .then((res) => {
          const list = res?.data || res || [];
          setLiveProducts(Array.isArray(list) ? list : []);
        })
        .catch(() => {});
    };
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('v2_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('v2_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [products]);

  const explicitFresh = liveProducts.filter((p) => {
    const isRaw = (p.type || '').toLowerCase() === 'raw';
    return isRaw && Boolean(p.isFreshCatch);
  });

  // If products are explicitly checked as isFreshCatch, show strictly those.
  // Otherwise fallback to badge "Today's Catch" so section is not blank initially.
  const displayItems = explicitFresh.length > 0
    ? explicitFresh
    : liveProducts.filter((p) => (p.type || '').toLowerCase() === 'raw' && p.badge === "Today's Catch");

  const freshCatchProducts = displayItems.slice(0, 8);

  if (freshCatchProducts.length === 0) {
    return null;
  }

  const allFreshCount = displayItems.length;

  return (
    <section className="py-6 sm:py-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sea-700 uppercase tracking-wider mb-1">
              <Anchor className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h2>
              {tamil && <span className="text-sm font-semibold text-ocean-700 font-tamil">({tamil})</span>}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <Link
            to="/shop?filter=fresh-catch"
            className="inline-flex items-center gap-1 text-xs font-bold text-sea-600 hover:text-sea-700 transition self-start sm:self-auto"
          >
            <span>View All Harbor Fresh ({allFreshCount})</span>
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

