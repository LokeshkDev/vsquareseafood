import React, { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Fish, UtensilsCrossed } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_ALL_ITEM = {
  id: 'all',
  name: 'All Fresh',
  tamil: 'அனைத்தும்',
  dept: 'all',
  img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_PRESET_IMAGES = {
  'sea-fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
  'prawns': 'https://images.unsplash.com/photo-1559737558-245cb351c5eb?auto=format&fit=crop&w=600&q=80',
  'crabs-squid': 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
  'freshwater': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
  'steaks': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
  'ready-to-cook': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'small-fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
  'kitchen-meals': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  'kitchen-curry': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  'kitchen-fry': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'kitchen-biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'kitchen-starters': 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=600&q=80',
  'cloud-kitchen': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
};

const INITIAL_FALLBACK_CATEGORIES = [
  DEFAULT_ALL_ITEM,
  { id: 'sea-fish', name: 'Sea Fish', tamil: 'கடல் மீன்', dept: 'raw', img: DEFAULT_PRESET_IMAGES['sea-fish'] },
  { id: 'prawns', name: 'Prawns', tamil: 'இறால்', dept: 'raw', img: DEFAULT_PRESET_IMAGES['prawns'] },
  { id: 'crabs-squid', name: 'Crab & Squid', tamil: 'நண்டு & கணவா', dept: 'raw', img: DEFAULT_PRESET_IMAGES['crabs-squid'] },
  { id: 'freshwater', name: 'River Fish', tamil: 'ஆற்று மீன்', dept: 'raw', img: DEFAULT_PRESET_IMAGES['freshwater'] },
  { id: 'kitchen-curry', name: 'Claypot Curries', tamil: 'மீன் குழம்பு', dept: 'kitchen', img: DEFAULT_PRESET_IMAGES['kitchen-curry'] },
];

export default function CategoryScroller({
  activeCategory,
  title = 'Explore Fresh Categories',
  subtitle = 'Daily Kasimedu harbor catch cleaned, trimmed & packed chilled',
}) {
  const [searchParams] = useSearchParams();
  const currentCategory = activeCategory || searchParams.get('category') || 'all';
  const scrollRef = useRef(null);

  const [categories, setCategories] = useState(INITIAL_FALLBACK_CATEGORIES);

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
                img: c.image || DEFAULT_PRESET_IMAGES[slug] || (isKitchen ? DEFAULT_PRESET_IMAGES['kitchen-meals'] : DEFAULT_ALL_ITEM.img),
              };
            });
          setCategories([DEFAULT_ALL_ITEM, ...activeDbItems]);
        }
      })
      .catch((err) => {
        console.error('Failed to load active scroller categories:', err);
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
                  className={`shrink-0 w-56 relative overflow-hidden rounded-[8px] aspect-[16/11] border transition-all duration-300 shadow-subtle hover:shadow-lg block select-none group/card ${
                    isSelected
                      ? 'border-[#E15E18] ring-2 ring-[#E15E18]/60 shadow-md'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={cat.img}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-500 ease-out"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/15 pointer-events-none" />

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
                className={`group relative overflow-hidden rounded-[6px] aspect-[4/3] border transition-all duration-200 shadow-xs block select-none ${
                  isSelected
                    ? 'border-[#E15E18] ring-2 ring-[#E15E18]/60 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Full Cover Background Image */}
                <img
                  src={cat.img}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10 pointer-events-none" />

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

      </div>
    </section>
  );
}
