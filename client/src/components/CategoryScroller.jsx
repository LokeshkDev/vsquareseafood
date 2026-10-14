import React, { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Fish, UtensilsCrossed } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_ALL_ITEM = {
  id: 'all',
  name: 'All Fresh',
  tamil: 'அனைத்தும்',
  dept: 'all',
  img: '',
};

export default function CategoryScroller({
  activeCategory,
  title = 'Explore Fresh Categories',
  subtitle = 'Daily Kasimedu harbor catch cleaned, trimmed & packed chilled',
}) {
  const [searchParams] = useSearchParams();
  const currentCategory = activeCategory || searchParams.get('category') || 'all';
  const scrollRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = () => {
    api.get('/categories')
      .then((res) => {
        const rawList = res?.data || res || [];
        if (Array.isArray(rawList)) {
          const activeDbItems = rawList
            .filter((c) => c.isActive !== false)
            .map((c) => {
              const slug = (c.slug || c.id || '').toLowerCase();
              const isKitchen = slug.startsWith('kitchen-') || slug === 'cloud-kitchen' || c.department === 'kitchen';
              return {
                id: slug,
                name: c.name,
                tamil: c.tamilName || c.name,
                dept: isKitchen ? 'kitchen' : 'raw',
                img: c.image || '',
              };
            });

          const allItem = {
            ...DEFAULT_ALL_ITEM,
            img: activeDbItems[0]?.img || '',
          };

          setCategories([allItem, ...activeDbItems]);
        }
      })
      .catch((err) => {
        console.error('Failed to load active scroller categories:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();

    const handleCmsUpdate = () => {
      loadCategories();
    };

    window.addEventListener('v2_cms_updated', handleCmsUpdate);
    window.addEventListener('storage', handleCmsUpdate);
    return () => {
      window.removeEventListener('v2_cms_updated', handleCmsUpdate);
      window.removeEventListener('storage', handleCmsUpdate);
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white border-y border-slate-200 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Header row with navigation & desktop carousel arrows */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Fish className="w-4 h-4 text-sea-600" />
              <span>{title}</span>
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="text-xs font-bold text-sea-600 hover:text-sea-800 transition mr-1 sm:mr-2"
            >
              Browse Catalog →
            </Link>

            {/* Desktop Carousel Arrow Buttons (Visible on Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-2 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-[6px] text-slate-700 transition shadow-xs cursor-pointer active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-2 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-[6px] text-slate-700 transition shadow-xs cursor-pointer active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && categories.length === 0 ? (
          <div>
            {/* Desktop Carousel Skeleton */}
            <div className="hidden lg:flex items-center gap-4 overflow-hidden py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-56 aspect-[16/11] rounded-[8px] bg-slate-100 border border-slate-200 animate-pulse relative overflow-hidden"
                >
                  <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded-[3px] w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded-[3px] w-1/2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Grid Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:hidden gap-2.5 sm:gap-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-[6px] bg-slate-100 border border-slate-200 animate-pulse relative overflow-hidden"
                >
                  <div className="absolute bottom-2 left-2 right-2 space-y-1">
                    <div className="h-3 bg-slate-200 rounded-[3px] w-3/4" />
                    <div className="h-2 bg-slate-200 rounded-[3px] w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 1. DESKTOP VIEW: SMOOTH HORIZONTAL CAROUSEL (>= lg screens)     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block relative">
              <div
                ref={scrollRef}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-0.5"
              >
                {categories.map((cat) => {
                  const isSelected = currentCategory === cat.id;
                  const isKitchen = cat.dept === 'kitchen' || cat.id.startsWith('kitchen-') || cat.id === 'cloud-kitchen';
                  const targetUrl = cat.id === 'all'
                    ? '/shop'
                    : isKitchen
                      ? `/kitchen?category=${encodeURIComponent(cat.id)}`
                      : `/shop?category=${encodeURIComponent(cat.id)}`;

                  return (
                    <Link
                      key={cat.id}
                      to={targetUrl}
                      className={`shrink-0 w-56 relative overflow-hidden rounded-[8px] aspect-[16/11] border transition-all duration-300 shadow-subtle hover:shadow-lg block select-none group/card bg-slate-900 ${
                        isSelected
                          ? 'border-[#E15E18] ring-2 ring-[#E15E18]/60 shadow-md'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* Background Image / Fallback */}
                      {cat.img ? (
                        <img
                          src={cat.img}
                          alt={cat.name}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-500 ease-out"
                        />
                      ) : null}

                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-900/30 flex items-center justify-center pointer-events-none">
                        {!cat.img && <Fish className="w-12 h-12 text-white/20" />}
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                        {isKitchen ? (
                          <span className="bg-amber-500/95 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] shadow-xs flex items-center gap-1 backdrop-blur-xs">
                            <UtensilsCrossed className="w-2.5 h-2.5" />
                            Kitchen
                          </span>
                        ) : (
                          <span className="bg-sky-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] shadow-xs flex items-center gap-1 backdrop-blur-xs">
                            <Fish className="w-2.5 h-2.5" />
                            Fresh Cut
                          </span>
                        )}

                        {isSelected && (
                          <span className="bg-[#E15E18] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-[4px] shadow-xs">
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Category Title & Tamil Subtitle Overlay */}
                      <div className="absolute bottom-0 inset-x-0 p-3 text-left pointer-events-none z-10">
                        <div className="text-white text-sm font-black leading-tight drop-shadow-md group-hover/card:text-v2orange-300 transition-colors">
                          {cat.name}
                        </div>
                        <div className="text-slate-200 text-[11px] font-semibold leading-tight drop-shadow-sm mt-0.5 font-tamil">
                          {cat.tamil}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 2. MOBILE & TABLET VIEW: RESPONSIVE GRID (< lg screens)        */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:hidden gap-2.5 sm:gap-3.5">
              {categories.map((cat) => {
                const isSelected = currentCategory === cat.id;
                const isKitchen = cat.dept === 'kitchen' || cat.id.startsWith('kitchen-') || cat.id === 'cloud-kitchen';
                const targetUrl = cat.id === 'all'
                  ? '/shop'
                  : isKitchen
                    ? `/kitchen?category=${encodeURIComponent(cat.id)}`
                    : `/shop?category=${encodeURIComponent(cat.id)}`;

                return (
                  <Link
                    key={cat.id}
                    to={targetUrl}
                    className={`group relative overflow-hidden rounded-[6px] aspect-[4/3] border transition-all duration-200 shadow-xs block select-none bg-slate-900 ${
                      isSelected
                        ? 'border-[#E15E18] ring-2 ring-[#E15E18]/60 shadow-md'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Full Cover Background Image / Fallback */}
                    {cat.img ? (
                      <img
                        src={cat.img}
                        alt={cat.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : null}

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-900/30 flex items-center justify-center pointer-events-none">
                      {!cat.img && <Fish className="w-10 h-10 text-white/20" />}
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                      {isKitchen ? (
                        <span className="bg-amber-500/90 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] shadow-xs flex items-center gap-1">
                          <UtensilsCrossed className="w-2.5 h-2.5" />
                          Kitchen
                        </span>
                      ) : (
                        <span className="bg-sky-600/90 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[3px] shadow-xs flex items-center gap-1">
                          <Fish className="w-2.5 h-2.5" />
                          Fresh Cut
                        </span>
                      )}

                      {isSelected && (
                        <span className="bg-[#E15E18] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[3px] shadow-sm">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Category Name & Tamil Subtitle Directly ON the Image */}
                    <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-left pointer-events-none z-10">
                      <div className="text-white text-xs xs:text-sm font-black leading-tight drop-shadow-md group-hover:text-v2orange-300 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-slate-200 text-[10px] xs:text-[11px] font-semibold leading-tight drop-shadow-sm mt-0.5 font-tamil">
                        {cat.tamil}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
