import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  ArrowUpDown, 
  X, 
  RotateCcw,
  Check,
  Scissors
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, CLEANING_OPTIONS } from '../data/products';

const RAW_CATEGORIES = [
  { id: 'all', name: 'All Fresh Seafood' },
  { id: 'sea-fish', name: 'Sea Fish (கடல் மீன்)' },
  { id: 'prawns', name: 'Prawns (இறால்)' },
  { id: 'crabs-squid', name: 'Crab & Squid (நண்டு & கணவா)' },
  { id: 'freshwater', name: 'River Fish (ஆற்று மீன்)' },
  { id: 'steaks', name: 'Steaks & Fillets (வஞ்சரம் / துண்டுகள்)' },
  { id: 'ready-to-cook', name: 'Marinated / Ready Cut' },
  { id: 'small-fish', name: 'Small Fish (நெத்திலி / மத்தி)' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';
  const urlQuery = searchParams.get('q') || '';
  const urlFilter = searchParams.get('filter') || '';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCleaning, setSelectedCleaning] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [onlyFreshCatch, setOnlyFreshCatch] = useState(urlFilter === 'fresh-catch');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state if url changes
  React.useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'all');
    if (searchParams.get('q')) {
      setSearchQuery(searchParams.get('q'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // ONLY SHOW RAW SEAFOOD ITEMS IN THE FRESH SEAFOOD SHOP
      if (product.type !== 'raw') return false;

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'steaks') {
          if (!product.cleaningOptions || !product.cleaningOptions.includes('fry-cut')) return false;
        } else if (selectedCategory === 'small-fish') {
          const name = (product.name + ' ' + (product.localName || '') + ' ' + product.slug).toLowerCase();
          if (!name.includes('nethili') && !name.includes('mathi') && !name.includes('sardine') && !name.includes('anchovy') && !name.includes('sankara')) return false;
        } else if (product.category !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchLocal = product.localName.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        if (!matchName && !matchLocal && !matchDesc) return false;
      }

      // Only Fresh Catch filter
      if (onlyFreshCatch && !product.isFreshCatch) return false;

      // Price filter
      if (product.price > maxPrice) return false;

      // Cleaning option filter
      if (selectedCleaning !== 'all') {
        if (!product.cleaningOptions || !product.cleaningOptions.includes(selectedCleaning)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: popular
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy, selectedCleaning, maxPrice, onlyFreshCatch]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
    setSelectedCleaning('all');
    setMaxPrice(1500);
    setOnlyFreshCatch(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Page Breadcrumb / Title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fresh Seafood Store
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing {filteredProducts.length} items • Cleaned with RO water and packed in cold chain
          </p>
        </div>

        {/* Mobile Filter & Sort triggers */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 bg-white border border-slate-300 rounded-[5px] py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700"
            >
              <Filter className="w-3.5 h-3.5 text-sea-600" />
              <span>Filters {(onlyFreshCatch || selectedCleaning !== 'all' || maxPrice < 1500) ? '●' : ''}</span>
            </button>

            <div className="flex-1 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-[5px] py-2 px-2.5 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="popular">Popular Today</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Left Sidebar + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Desktop Left Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-[5px] p-4 space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-sea-600" />
                Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-sea-600 hover:text-sea-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Category
              </label>
              <div className="space-y-1">
                {RAW_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[5px] text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-sea-50 text-sea-700 font-bold border border-sea-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-sea-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fresh Catch Toggle */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyFreshCatch}
                  onChange={(e) => setOnlyFreshCatch(e.target.checked)}
                  className="rounded-[3px] text-sea-600 focus:ring-0 w-4 h-4 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Today's Morning Harbor Catch Only
                </span>
              </label>
            </div>

            {/* Cleaning Cut Option Filter */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Available Cleaning Cut
              </label>
              <select
                value={selectedCleaning}
                onChange={(e) => setSelectedCleaning(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-[5px] bg-slate-50 focus:bg-white outline-none"
              >
                <option value="all">All Cut Preferences</option>
                {CLEANING_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span className="uppercase tracking-wider">Max Price</span>
                <span className="text-ocean-900 font-extrabold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="150"
                max="1500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-ocean-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹150</span>
                <span>₹1,500</span>
              </div>
            </div>
          </aside>

          {/* Right Product Section */}
          <main className="lg:col-span-9 space-y-4">
            
            {/* Desktop Top Control Bar: Search & Sort */}
            <div className="hidden lg:flex items-center justify-between bg-white border border-slate-200 rounded-[5px] p-3 gap-4">
              <div className="flex-1 relative max-w-sm">
                <input
                  type="text"
                  placeholder="Filter within this category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-8 py-2 border border-slate-300 rounded-[5px] outline-none focus:border-ocean-800"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-slate-300 rounded-[5px] px-2.5 py-1.5 font-semibold text-slate-800 bg-slate-50 outline-none"
                >
                  <option value="popular">Popular Today</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>
            </div>

            {/* Active filter tags */}
            {(selectedCategory !== 'all' || searchQuery || onlyFreshCatch || selectedCleaning !== 'all') && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">Active:</span>
                {selectedCategory !== 'all' && (
                  <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-[3px] flex items-center gap-1">
                    Category: {RAW_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}
                    <button 
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchParams(prev => {
                          const n = new URLSearchParams(prev);
                          n.delete('category');
                          return n;
                        });
                      }}
                      className="hover:text-red-600 transition"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {onlyFreshCatch && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-[3px] flex items-center gap-1 font-medium">
                    Today's Fresh Catch
                    <button onClick={() => setOnlyFreshCatch(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-[3px] flex items-center gap-1">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedCleaning !== 'all' && (
                  <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-[3px] flex items-center gap-1">
                    Cut: {CLEANING_OPTIONS.find(c => c.id === selectedCleaning)?.label}
                    <button onClick={() => setSelectedCleaning('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[5px] p-12 text-center space-y-3">
                <div className="text-slate-400 text-4xl">🐟</div>
                <h3 className="text-base font-bold text-slate-800">No matching seafood found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or adjusting the filters to see more fresh catch varieties.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-ocean-800 text-white font-bold text-xs px-4 py-2 rounded-[5px] hover:bg-ocean-700 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>

      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-4 flex flex-col justify-between">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-800">Filter Products</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}><X className="w-4 h-4 text-slate-500" /></button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Categories</label>
                <div className="space-y-1">
                  {RAW_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left text-xs p-1.5 rounded-[5px] ${selectedCategory === cat.id ? 'bg-sea-50 text-sea-700 font-bold' : 'text-slate-600'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={onlyFreshCatch}
                    onChange={(e) => setOnlyFreshCatch(e.target.checked)}
                  />
                  Morning Fresh Catch Only
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-1">Cut Preference</label>
                <select
                  value={selectedCleaning}
                  onChange={(e) => setSelectedCleaning(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-[5px]"
                >
                  <option value="all">All Cuts</option>
                  {CLEANING_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="w-1/2 bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-[5px]"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 bg-ocean-800 text-white font-bold text-xs py-2 rounded-[5px]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
