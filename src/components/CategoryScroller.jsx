import React, { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const QUICK_CATEGORIES = [
  { id: 'all', name: 'All Fresh', tamil: 'அனைத்தும்', img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80' },
  { id: 'sea-fish', name: 'Sea Fish', tamil: 'கடல் மீன்', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80' },
  { id: 'prawns', name: 'Prawns', tamil: 'இறால்', img: 'https://images.unsplash.com/photo-1559737558-245cb351c5eb?auto=format&fit=crop&w=600&q=80' },
  { id: 'crabs-squid', name: 'Crab & Squid', tamil: 'நண்டு & கணவா', img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80' },
  { id: 'freshwater', name: 'River Fish', tamil: 'ஆற்று மீன்', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80' },
  { id: 'steaks', name: 'Steaks & Fillets', tamil: 'வஞ்சரம் / துண்டுகள்', img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80' },
  { id: 'ready-to-cook', name: 'Marinated Cut', tamil: 'மசாலா மீன்', img: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80' },
  { id: 'small-fish', name: 'Small Fish / Nethili', tamil: 'நெத்திலி / மத்தி', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80' },
];

export default function CategoryScroller({ activeCategory }) {
  const [searchParams] = useSearchParams();
  const currentCategory = activeCategory || searchParams.get('category') || 'all';
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white border-y border-slate-200 py-3.5 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Header row with scroll controls for desktop */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Explore Fresh Categories
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Daily Kasimedu harbor catch cleaned, trimmed & packed chilled
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              to="/shop"
              className="text-xs font-bold text-sea-600 hover:text-sea-700 transition mr-1 sm:mr-3"
            >
              View All Fish →
            </Link>
            {/* Desktop scroll arrow buttons */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-[5px] text-slate-600 transition"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-[5px] text-slate-600 transition"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet View: Full Image Background Cards with Category Name Overlay */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:hidden gap-2.5 sm:gap-3.5">
          {QUICK_CATEGORIES.map((cat) => {
            const isSelected = currentCategory === cat.id;
            const targetUrl = cat.id === 'all' ? '/shop' : `/shop?category=${cat.id}`;

            return (
              <Link
                key={cat.id}
                to={targetUrl}
                className={`group relative overflow-hidden rounded-[5px] aspect-[4/3] border transition shadow-xs block select-none ${
                  isSelected
                    ? 'border-[#E15E18] ring-2 ring-[#E15E18]/60 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Full Background Image */}
                <img
                  src={cat.img}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Dark Gradient Overlay for High Contrast Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10 pointer-events-none" />

                {/* Active Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-[#E15E18] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[3px] shadow-sm z-10">
                    Selected
                  </div>
                )}

                {/* Category Name & Tamil Subtitle Directly ON the Image */}
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-left pointer-events-none z-10">
                  <div className="text-white text-xs xs:text-sm font-black leading-tight drop-shadow-md group-hover:text-v2orange-300 transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-slate-200 text-[10px] xs:text-[11px] font-medium leading-tight drop-shadow-sm mt-0.5">
                    {cat.tamil}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop View: Horizontal Scroll with Smooth Navigation Links (>= lg screens) */}
        <div
          ref={scrollRef}
          className="hidden lg:flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {QUICK_CATEGORIES.map((cat) => {
            const isSelected = currentCategory === cat.id;
            const targetUrl = cat.id === 'all' ? '/shop' : `/shop?category=${cat.id}`;

            return (
              <Link
                key={cat.id}
                to={targetUrl}
                className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-[5px] border transition text-left group cursor-pointer ${
                  isSelected
                    ? 'border-ocean-900 bg-ocean-900 text-white shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-9 h-9 object-cover rounded-[3px] border border-slate-200/50 flex-shrink-0"
                />
                <div className="whitespace-nowrap">
                  <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {cat.name}
                  </div>
                  <div className={`text-[10px] leading-tight font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
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
