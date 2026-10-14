import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  UtensilsCrossed, 
  CalendarDays, 
  Fish, 
  Clock, 
  X,
  PhoneCall,
  Menu,
  ShieldCheck,
  ChevronRight,
  LogIn,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/product.service';
import { api } from '../services/api';
import logoImg from '../assets/logo.png';

export default function Header() {
  const { cartCount, setIsCartOpen, setCleaningModalProduct } = useCart();
  const { user, logout, isAdmin } = useAuth() || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [quickCategories, setQuickCategories] = useState([]);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const hasLoadedCatalogRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection to smoothly shrink logo and header height
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch dynamic categories from database for quick links
  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        const list = res?.data || res || [];
        if (Array.isArray(list)) {
          const activeOnly = list.filter(c => c.isActive !== false).slice(0, 4);
          setQuickCategories(activeOnly.map(c => {
            const isKitchen = c.department === 'kitchen' || (c.slug || '').startsWith('kitchen-');
            return {
              name: c.tamilName ? `${c.name} (${c.tamilName})` : c.name,
              path: isKitchen ? `/kitchen?category=${c.slug || c.id}` : `/shop?category=${c.slug || c.id}`
            };
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Defer catalog products loading until search is actually opened or typed into
  const ensureCatalogLoaded = () => {
    if (!hasLoadedCatalogRef.current) {
      hasLoadedCatalogRef.current = true;
      productService.getProducts({ limit: 100 })
        .then(res => {
          const items = res?.data || res?.products || res || [];
          if (Array.isArray(items)) setCatalogProducts(items);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (isSearchOpen || searchQuery) {
      ensureCatalogLoaded();
    }
  }, [isSearchOpen, searchQuery]);

  useEffect(() => {
    const handleCmsUpdate = () => {
      if (hasLoadedCatalogRef.current) {
        productService.getProducts({ limit: 100 })
          .then(res => {
            const items = res?.data || res?.products || res || [];
            if (Array.isArray(items)) setCatalogProducts(items);
          })
          .catch(() => {});
      }
    };
    window.addEventListener('storage', handleCmsUpdate);
    window.addEventListener('v2_cms_updated', handleCmsUpdate);
    return () => {
      window.removeEventListener('storage', handleCmsUpdate);
      window.removeEventListener('v2_cms_updated', handleCmsUpdate);
    };
  }, []);

  // Filter products for instant autocomplete from live database
  const searchResults = searchQuery.trim() === '' ? [] : catalogProducts.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.localName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.name || p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  // Close search popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus input when search popover opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close search popover or mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectProduct = (product) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setCleaningModalProduct(product);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Fresh Seafood', path: '/shop', icon: Fish },
    { label: 'Cloud Kitchen', path: '/kitchen', badge: 'Hot', icon: UtensilsCrossed },
    { label: 'Catering Service', path: '/catering', icon: CalendarDays },
    { label: 'About', path: '/#about', icon: ShieldCheck },
  ];

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
      isScrolled ? 'shadow-md border-b border-slate-200/90 py-0.5 sm:py-1' : 'border-b border-slate-200 py-0'
    }`}>
      {/* Top micro announcement bar with solid Dark Blue BG */}
      <div 
        className={`text-white text-xs py-1.5 sm:py-2 px-4 hidden md:block border-b border-[#03335F] transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 py-0 opacity-0 border-none' : 'max-h-12 opacity-100'
        }`}
        style={{ backgroundColor: '#021630' }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-slate-200">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-v2orange-400" />
              Kasimedu 4:30 AM Harbor Catch Arrived | Next Delivery Slot: 60-90 Mins
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-semibold">100% Chemical & Formalin Free Guarantee</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-200">
            <a href="tel:+919840012345" className="flex items-center hover:text-white transition">
              <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-sea-400" />
              Helpline: +91 98400 12345
            </a>
            <span className="text-slate-500">|</span>
            <Link to="/catering" className="hover:text-v2orange-400 font-medium transition">
              Bulk & Catering Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative">
        <div className={`flex items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20 lg:h-22'
        }`}>
          
          {/* Mobile & Tablet Left: Hamburger Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-1 text-slate-700 hover:text-ocean-900 hover:bg-slate-100 rounded-[5px] transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Left: Brand Logo (Left-aligned on desktop screens >= lg) */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group py-1" title="V² Seafood - SEAFRESH">
              <img
                src={logoImg}
                alt="V² Seafood — SEAFRESH"
                className={`w-auto object-contain transition-all duration-300 ease-in-out group-hover:scale-[1.02] ${
                  isScrolled ? 'h-9 sm:h-11' : 'h-12 sm:h-14 lg:h-16'
                }`}
              />
            </Link>
          </div>

          {/* Mobile & Tablet Center: Centered Logo strictly on mobile/tablet screens (< lg) */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-auto">
            <Link to="/" title="V² Seafood - SEAFRESH" className="flex items-center justify-center py-1">
              <img
                src={logoImg}
                alt="V² Seafood — SEAFRESH"
                className={`w-auto max-w-[135px] xs:max-w-[155px] sm:max-w-[180px] object-contain transition-all duration-300 ease-in-out ${
                  isScrolled ? 'h-8 sm:h-9' : 'h-9 sm:h-11'
                }`}
              />
            </Link>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-6">
            
            {/* Desktop Nav Links: Right-aligned, clean text, NO background highlight (Desktop >= lg) */}
            <nav className="hidden lg:flex items-center space-x-1 lg:space-x-3">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`px-2.5 py-1 text-sm font-semibold transition flex items-center gap-1.5 ${
                      isActive 
                        ? 'text-ocean-900 font-bold border-b-2 border-sea-600 pb-0.5' 
                        : 'text-slate-700 hover:text-sea-600'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Search Popover + Cart Bag Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 relative" ref={searchContainerRef}>
              
              {/* Search Icon Popover Trigger */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 sm:p-2.5 rounded-[5px] transition border flex items-center justify-center ${
                  isSearchOpen 
                    ? 'bg-slate-100 text-ocean-900 border-slate-300' 
                    : 'text-slate-700 hover:text-ocean-900 hover:bg-slate-100 border-transparent hover:border-slate-200'
                }`}
                aria-label="Search seafood"
                title="Search products"
              >
                <Search className="w-5 h-5 text-slate-700" />
              </button>

              {/* Cart Button: ONLY Bag Icon (No text) with Badge Count */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 bg-ocean-900 hover:bg-ocean-800 text-white rounded-[5px] transition shadow-xs border border-ocean-800 flex items-center justify-center"
                aria-label="View shopping bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 text-sea-400" />
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1.5 -right-1.5 text-white text-[11px] font-black w-5 h-5 rounded-[3px] flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: '#E15E18' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Search Popover Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white border border-slate-200 rounded-[5px] shadow-2xl p-3 z-50 animate-fadeInSlide">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search fish, prawns, crab, biryani..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-sm pl-9 pr-8 py-2.5 border border-slate-300 focus:border-sea-600 focus:bg-white focus:ring-1 focus:ring-sea-600 rounded-[5px] outline-none transition"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                        title="Close search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </form>

                  {/* Instant autocomplete list in popover */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 border-t border-slate-100 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      {searchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          className="p-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-[3px] transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={p.image || p.images?.[0]?.publicUrl || 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800'} 
                              alt={p.name} 
                              className="w-9 h-9 object-cover rounded-[3px] border border-slate-200" 
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-slate-500">{p.localName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-ocean-900">₹{Number(p.basePrice || p.price || 0)}</div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-center py-2 text-xs font-bold text-sea-600 hover:text-sea-700 bg-slate-50 mt-1 rounded-[3px] transition"
                      >
                        View all results →
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Slide-Out Navigation Drawer rendered directly into document.body via Portal */}
      {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden flex">
          {/* Opaque Dark Backdrop with subtle blur */}
          <div 
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs animate-fadeInOverlay"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Solid White Slide-Out Drawer Panel */}
          <div 
            className="relative w-[85%] max-w-[340px] bg-white h-[100dvh] shadow-2xl flex flex-col z-10 animate-slideRight overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* 1. Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-white flex-shrink-0">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <img src={logoImg} alt="V² Seafood" className="h-9 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition active:scale-95"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Menu Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
              {/* Main Navigation Links */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 mb-1.5">
                  Departments
                </div>
                <nav className="space-y-1">
                  {navLinks.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-[5px] text-sm font-semibold transition ${
                          isActive
                            ? 'bg-ocean-900 text-white shadow-xs font-bold'
                            : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-sea-300' : 'text-sea-600'}`} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-[3px] bg-v2orange-500 text-white shadow-xs">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-400' : 'text-slate-300'}`} />
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Fresh Catch Categories (Dynamic from DB) */}
              {quickCategories.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 mb-1.5">
                    Quick Catch Categories
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {quickCategories.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-[4px] text-xs font-medium text-slate-700 hover:text-ocean-900 truncate transition text-center"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Pinned Drawer Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-2 flex-shrink-0">
              <a
                href="tel:+919840012345"
                className="flex items-center gap-2.5 p-2 rounded-[5px] bg-white border border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs transition"
              >
                <div className="w-7 h-7 rounded-full bg-sea-50 flex items-center justify-center text-sea-600 flex-shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Customer Helpline</div>
                  <div className="text-xs font-bold text-ocean-900 mt-0.5">+91 98400 12345</div>
                </div>
              </a>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 px-1">
                <Clock className="w-3 h-3 text-v2orange-500 flex-shrink-0" />
                <span>Next Delivery Slot: 60–90 Mins</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
