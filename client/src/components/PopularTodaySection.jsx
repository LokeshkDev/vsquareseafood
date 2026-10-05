import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/product.service';

export default function PopularTodaySection({
  title = 'Popular Today',
  tamil = 'அதிகம் விரும்பி வாங்கியவை',
  subtitle = 'Trending in Chennai',
  products,
}) {
  const [liveProducts, setLiveProducts] = useState(products || []);
  const scrollContainerRef = useRef(null);

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

  const popularProducts = liveProducts.filter((p) => {
    const isRaw = (p.type || '').toLowerCase() === 'raw';
    const isPop = p.isPopular || p.badge === 'Popular' || p.badge === 'Best Seller';
    return isRaw && isPop;
  });

  if (popularProducts.length === 0) {
    return null;
  }

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
              <span>{subtitle}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h2>
              {tamil && <span className="text-sm font-semibold text-ocean-700 font-tamil">({tamil})</span>}
            </div>
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
                className="p-1.5 sm:p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-[5px] text-slate-700 transition cursor-pointer"
                aria-label="Scroll popular products left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 sm:p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-[5px] text-slate-700 transition cursor-pointer"
                aria-label="Scroll popular products right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Card Scroller */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
        >
          {popularProducts.map((product) => (
            <div key={product.id} className="w-[185px] sm:w-[220px] lg:w-[245px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

