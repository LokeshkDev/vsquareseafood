import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import logoImg from '../assets/logo.png';

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
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

  // Filter products for instant autocomplete
  const searchResults = searchQuery.trim() === '' ? [] : PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.localName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleSelectProduct = (product) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    navigate(`/product/${product.slug}`);
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
    <header className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
      isScrolled ? 'shadow-md border-b border-slate-200/90' : 'border-b border-slate-200'
    }`}>
      {/* Top micro announcement bar with solid Dark Blue BG */}
      <div 
        className="text-white text-xs py-1.5 sm:py-2 px-4 hidden md:block border-b border-[#03335F] transition-all"
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
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20 md:h-24'
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
                  isScrolled ? 'h-10 sm:h-12' : 'h-14 sm:h-18 md:h-24'
                }`}
              />
            </Link>
          </div>

          {/* Mobile & Tablet Center: Centered Logo strictly on mobile/tablet screens (< lg) */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-auto">
            <Link to="/" title="V² Seafood - SEAFRESH">
              <img
                src={logoImg}
                alt="V² Seafood — SEAFRESH"
                className={`w-auto object-contain transition-all duration-300 ${
                  isScrolled ? 'h-10 sm:h-11' : 'h-16 sm:h-15'
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
                              src={p.image} 
                              alt={p.name} 
                              className="w-9 h-9 object-cover rounded-[3px] border border-slate-200" 
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-slate-500">{p.localName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-ocean-900">₹{p.price}</div>
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

      {/* Mobile & Tablet Slide-Out Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-fadeInSlide">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src={logoImg} alt="V² Seafood" className="h-10 w-auto object-contain" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-[5px] text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <nav className="mt-4 space-y-1">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-[5px] text-sm font-bold transition ${
                        isActive
                          ? 'bg-ocean-900 text-white shadow-xs'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-sea-400' : 'text-sea-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-[3px] bg-v2orange-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Info */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <a
                href="tel:+919840012345"
                className="flex items-center gap-2.5 p-3 rounded-[5px] bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
              >
                <PhoneCall className="w-4 h-4 text-sea-600" />
                <span>Helpline: +91 98400 12345</span>
              </a>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-1">
                <Clock className="w-3.5 h-3.5 text-v2orange-500 flex-shrink-0" />
                <span>Kasimedu Harbor 4:30 AM Catch</span>
              </div>
            </div>

          </div>

          {/* Clickable Backdrop Area to Close */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
