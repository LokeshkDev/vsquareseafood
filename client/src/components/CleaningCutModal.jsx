import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Check, 
  Info, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ChefHat, 
  ShoppingBag, 
  Flame, 
  Scissors, 
  Waves, 
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CLEANING_OPTIONS } from '../data/products';

export default function CleaningCutModal() {
  const { cleaningModalProduct, setCleaningModalProduct, addToCart, setIsCartOpen } = useCart();
  const [selectedCut, setSelectedCut] = useState('whole-cleaned');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCleaningModalProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCleaningModalProduct]);

  // Determine allowed cuts specifically for this product
  const getAllowedCutIds = (prod) => {
    if (!prod) return [];
    // 1. Explicit admin configured options on product
    if (Array.isArray(prod.cleaningOptions) && prod.cleaningOptions.length > 0) {
      return prod.cleaningOptions;
    }
    // 2. Active variants on product with cleaning options
    if (Array.isArray(prod.variants)) {
      const varCuts = prod.variants
        .filter((v) => v.cleaningOption && v.isAvailable !== false)
        .map((v) => v.cleaningOption);
      if (varCuts.length > 0) {
        return [...new Set(varCuts)];
      }
    }
    // 3. Fallback based on product category & name so Prawns never show Crab/Fish cuts
    const catSlug = (
      (typeof prod.category === 'object' ? prod.category?.slug : prod.category) || 
      prod.categoryId || ''
    ).toLowerCase();
    const nameLower = (prod.name || '').toLowerCase();

    if (catSlug.includes('prawn') || nameLower.includes('prawn') || nameLower.includes('shrimp')) {
      return ['whole-cleaned', 'prawns-peeled', 'prawns-whole'];
    }
    if (catSlug.includes('crab') || nameLower.includes('crab') || nameLower.includes('nandu')) {
      return ['crab-whole', 'crab-cleaned'];
    }
    if (catSlug.includes('squid') || nameLower.includes('squid') || nameLower.includes('calamari') || nameLower.includes('kanava')) {
      return ['whole-cleaned', 'squid-rings'];
    }
    return ['full-piece-uncut', 'curry-cut', 'fry-cut', 'whole-cleaned', 'fillet'];
  };

  useEffect(() => {
    if (cleaningModalProduct) {
      const isRawType = cleaningModalProduct.type === 'raw' || !cleaningModalProduct.type || cleaningModalProduct.type === 'RAW';
      const allowed = isRawType ? getAllowedCutIds(cleaningModalProduct) : [];
      const defaultChoice = 
        cleaningModalProduct.defaultCleaning && allowed.includes(cleaningModalProduct.defaultCleaning)
          ? cleaningModalProduct.defaultCleaning
          : (allowed[0] || (cleaningModalProduct.type === 'kitchen' ? 'ready-to-eat' : 'whole-cleaned'));
      setSelectedCut(defaultChoice);
      setQuantity(1);
    }
  }, [cleaningModalProduct]);

  // Multi-image list memoized unconditionally before any early return
  const allImages = useMemo(() => {
    if (!cleaningModalProduct) return [];
    const list = [];
    if (Array.isArray(cleaningModalProduct.images) && cleaningModalProduct.images.length > 0) {
      cleaningModalProduct.images.forEach((img) => {
        const url = typeof img === 'string' ? img : (img.publicUrl || img.url);
        if (url && !list.includes(url)) list.push(url);
      });
    }
    if (cleaningModalProduct.imageUrl && !list.includes(cleaningModalProduct.imageUrl)) list.push(cleaningModalProduct.imageUrl);
    if (cleaningModalProduct.image && !list.includes(cleaningModalProduct.image)) list.push(cleaningModalProduct.image);
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800'];
  }, [cleaningModalProduct]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [cleaningModalProduct?.id]);

  if (!cleaningModalProduct) return null;

  const product = cleaningModalProduct;
  const isRaw = product.type === 'raw' || !product.type || product.type === 'RAW';

  // Safely extract category name (resolving [object Object] bug)
  const categoryName = 
    typeof product.category === 'object' && product.category !== null
      ? (product.category.name || product.category.title || product.category.slug || 'Fresh Seafood')
      : typeof product.category === 'string' && product.category
      ? product.category.replace(/-/g, ' ')
      : product.categoryName || 'Fresh Seafood';

  const allowedCutIds = isRaw ? getAllowedCutIds(product) : [];
  const availableCuts = isRaw
    ? CLEANING_OPTIONS.filter((opt) => allowedCutIds.includes(opt.id))
    : [];

  const currentOption = CLEANING_OPTIONS.find((opt) => opt.id === selectedCut) || availableCuts[0] || CLEANING_OPTIONS[0];

  const getCutPrice = (cutId) => {
    if (product.cutPrices && product.cutPrices[cutId] !== undefined && product.cutPrices[cutId] !== '') {
      return Number(product.cutPrices[cutId]);
    }
    if (Array.isArray(product.variants)) {
      const matchedVariant = product.variants.find((v) => v.cleaningOption === cutId);
      if (matchedVariant && matchedVariant.price !== undefined) {
        return Number(matchedVariant.price);
      }
    }
    const cutObj = CLEANING_OPTIONS.find((c) => c.id === cutId);
    const baseP = Number(product.basePrice || product.price || 0);
    return baseP + (cutObj?.priceModifier || 0);
  };

  const basePrice = Number(product.basePrice || product.price || 0);
  const mrp = product.mrp 
    ? Number(product.mrp) 
    : (product.variants?.[0]?.compareAtPrice ? Number(product.variants[0].compareAtPrice) : null);
  const activePrice = isRaw && availableCuts.length > 0 ? getCutPrice(selectedCut) : basePrice;
  const discountPercent = mrp && mrp > activePrice ? Math.round(((mrp - activePrice) / mrp) * 100) : 0;
  const activeImage = allImages[activeImageIndex] || allImages[0];

  const handleConfirm = () => {
    addToCart(product, isRaw ? selectedCut : (product.defaultCleaning || 'ready-to-eat'), quantity, activePrice);
    setCleaningModalProduct(null);
    setIsCartOpen(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-stretch justify-center bg-slate-900/80 backdrop-blur-xs transition-opacity duration-200"
      onClick={() => setCleaningModalProduct(null)}
    >
      {/* 
        Responsive Container:
        - Mobile: Bottom Sheet Drawer (rounded-t-[22px], max-h-[92vh])
        - Desktop: Full Screen Pop-up occupying full width and height with 2-column layout
      */}
      <div 
        className="bg-white w-full max-w-full md:w-screen md:h-screen md:max-w-none md:max-h-screen rounded-t-[22px] md:rounded-none border-t md:border-0 border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Mobile Drag Indicator Bar & Quick Close */}
        <div className="w-full bg-slate-100 md:hidden flex flex-col items-center pt-2.5 pb-1.5 shrink-0 border-b border-slate-200/60 relative">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          <button
            onClick={() => setCleaningModalProduct(null)}
            className="absolute top-1.5 right-3 p-1 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Top Header Bar (Full Screen Mode) */}
        <div className="hidden md:flex p-4 px-8 border-b border-slate-200 items-center justify-between bg-white shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sea-700 bg-sea-50 px-2.5 py-1 rounded-[4px] border border-sea-100 flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-sea-600" />
              <span>{categoryName}</span>
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-[4px] border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              In Stock (Daily Landing)
            </span>
            {product.harborSource && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sea-500" />
                <span>Harbor: {product.harborSource}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">
              Quick Catch Preview
            </span>
            <button
              onClick={() => setCleaningModalProduct(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer text-xs font-semibold"
            >
              <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-mono">ESC</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── DESKTOP FULL-SCREEN 2-COLUMN VIEW (md and up) ─── */}
        <div className="hidden md:grid md:grid-cols-12 md:flex-1 md:overflow-hidden bg-slate-50">
          
          {/* Left Column: Big Image Gallery, Source & Details */}
          <div className="md:col-span-5 lg:col-span-5 p-6 lg:p-8 overflow-y-auto no-scrollbar space-y-5 border-r border-slate-200 bg-white">
            
            {/* HD Product Banner & Multi-Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-ocean-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-[4px] uppercase tracking-wide backdrop-blur-xs shadow-xs pointer-events-none">
                    {product.badge}
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-[4px] backdrop-blur-xs shadow-xs pointer-events-none">
                    {discountPercent}% OFF
                  </div>
                )}

                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/85 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100 shadow-md"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/85 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs opacity-0 group-hover:opacity-100 shadow-md"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-[4px] pointer-events-none">
                      {activeImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-ocean-600 ring-2 ring-ocean-200 opacity-100 scale-102'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Harbor Origin & Storage Strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-sea-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Harbor Source</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{product.harborSource || 'Kasimedu Coastal Landing'}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-sea-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Storage & Temp</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{product.storageTemp || '0°C - 4°C in crushed ice'}</div>
                </div>
              </div>
            </div>

            {/* Chef Recommendation / Cooking Tips */}
            {product.cookingTips && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>Chef's Cooking Tip</span>
                </div>
                <p className="leading-relaxed text-amber-950">
                  {product.cookingTips}
                </p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  About This Catch
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Hygiene guarantees */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Chemicals / Preservatives</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sea-600 shrink-0" />
                <span>Express 60-90 Mins Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>100% RO Water Washed</span>
              </div>
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Daily Fresh Catch Landing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Selected Admin Variants (2-Column Grid), and Pinned Add to Cart */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col h-full bg-white overflow-hidden">
            
            {/* Scrollable Product Details & Variants Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 space-y-6">
              
              {/* Product Title & Tamil Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sea-700 bg-sea-50 px-2 py-0.5 rounded border border-sea-100">
                    {categoryName}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    ● Fresh Landing
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
                {product.localName && (
                  <p className="text-base font-bold text-slate-500 font-tamil">
                    {product.localName}
                  </p>
                )}
              </div>

              {/* Pricing & Weight Strip */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{activePrice}
                  </span>
                  {mrp && mrp > activePrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{mrp}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Save ₹{mrp - activePrice} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                  <span className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-md shadow-2xs">
                    Gross: {product.grossWeight || '500g'}
                  </span>
                  {product.serves && (
                    <span className="bg-sea-50 text-sea-800 border border-sea-100 px-2.5 py-1.5 rounded-md">
                      {product.serves}
                    </span>
                  )}
                </div>
              </div>

              {/* Variants Section: Only Configured Admin Variants in 2-Grid */}
              {isRaw && availableCuts.length > 0 && (
                <div className="space-y-3.5 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                      <Scissors className="w-4 h-4 text-sea-600" />
                      <span>Choose Cleaning & Cut Preference</span>
                    </div>
                    <span className="text-[11px] text-sea-700 font-bold bg-sea-50 px-2 py-0.5 rounded border border-sea-100">
                      RO Washed • Ready to Cook
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {availableCuts.map((cut) => {
                      const isSelected = selectedCut === cut.id;
                      const cutPrice = getCutPrice(cut.id);
                      return (
                        <div
                          key={cut.id}
                          onClick={() => setSelectedCut(cut.id)}
                          className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-sea-600 bg-sea-50/30 ring-2 ring-sea-600/30 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">
                              {cut.label}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-sea-600 border-sea-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="flex items-baseline gap-1.5 my-1">
                            <span className="text-xs font-extrabold text-sea-700 bg-sea-50 px-2 py-0.5 rounded">
                              ₹{cutPrice}
                            </span>
                            {cut.yieldRatio && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                ~{Math.round(500 * cut.yieldRatio)}g net
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                            {cut.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Net Yield Notice */}
                  {currentOption && (
                    <div className="text-xs text-ocean-900 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2">
                      <Info className="w-4 h-4 text-sea-600 shrink-0" />
                      <span>
                        Gross 500g landing net weight will be approx <strong className="text-sea-700">{Math.round(500 * (currentOption.yieldRatio || 0.8))}g</strong> after RO cleaning.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pinned Desktop Bottom Action Strip */}
            <div className="shrink-0 p-4 lg:p-5 px-6 lg:px-8 border-t border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-4 z-10 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Quantity (Packs):</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Total</div>
                  <div className="text-2xl font-black text-ocean-900 leading-none">
                    ₹{activePrice * quantity}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  style={{ backgroundColor: '#021630' }}
                  className="bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm px-8 py-3.5 rounded-lg transition shadow-md flex items-center gap-2.5 cursor-pointer border border-ocean-800 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4 text-sea-400" />
                  <span>Add Catch to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE VIEW (< md) ─── */}
        <div className="md:hidden flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          
          {/* Mobile Hero Banner & Multi-Image Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/9] rounded-[6px] overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-2.5 left-2.5 bg-ocean-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-[3px] uppercase tracking-wide backdrop-blur-xs pointer-events-none">
                  {product.badge}
                </div>
              )}
              {discountPercent > 0 && (
                <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-[3px] backdrop-blur-xs pointer-events-none">
                  {discountPercent}% OFF
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 text-white flex items-center justify-center cursor-pointer shadow-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 text-white flex items-center justify-center cursor-pointer shadow-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] pointer-events-none">
                    {activeImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-[5px] overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-ocean-600 ring-1 ring-ocean-200 opacity-100'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Title & Tamil Name */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                {product.name}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wide text-sea-700 bg-sea-50 px-2 py-0.5 rounded-[3px] shrink-0 border border-sea-100">
                {categoryName}
              </span>
            </div>
            
            {product.localName && (
              <p className="text-xs font-bold text-slate-500 font-tamil">
                {product.localName}
              </p>
            )}
          </div>

          {/* Pricing & Weight Strip */}
          <div className="bg-slate-50 p-3 rounded-[6px] border border-slate-200 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{activePrice}
              </span>
              {mrp && mrp > activePrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{mrp}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <span className="bg-white border border-slate-200 px-2 py-1 rounded-[4px] shadow-2xs">
                Gross: {product.grossWeight || '500g'}
              </span>
              {product.serves && (
                <span className="bg-sea-50 text-sea-800 border border-sea-100 px-2 py-1 rounded-[4px]">
                  {product.serves}
                </span>
              )}
            </div>
          </div>

          {/* Harbor Source Notice */}
          {product.harborSource && (
            <div className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50/80 p-2.5 rounded-[5px] border border-slate-200">
              <MapPin className="w-4 h-4 text-sea-600 shrink-0" />
              <span className="font-semibold text-ocean-900 truncate">Origin: {product.harborSource}</span>
            </div>
          )}

          {/* Seafood Cut Preference Selector - MOBILE 2-GRID LAYOUT */}
          {isRaw && availableCuts.length > 0 && (
            <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-[6px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                  <Scissors className="w-3.5 h-3.5 text-sea-600" />
                  <span>Choose Cleaning & Cut Preference</span>
                </div>
                <span className="text-[10px] text-sea-700 font-bold bg-white px-1.5 py-0.5 rounded-[3px] border border-slate-200">
                  RO Washed
                </span>
              </div>

              {/* 2-Column Grid for Variants as Requested */}
              <div className="grid grid-cols-2 gap-2">
                {availableCuts.map((cut) => {
                  const isSelected = selectedCut === cut.id;
                  const cutPrice = getCutPrice(cut.id);
                  return (
                    <div
                      key={cut.id}
                      onClick={() => setSelectedCut(cut.id)}
                      className={`p-2.5 rounded-[6px] border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-sea-600 bg-white ring-2 ring-sea-600/20 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
                          {cut.label}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-sea-600 border-sea-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1 my-1">
                        <span className="text-xs font-black text-sea-700 bg-sea-50 px-1.5 py-0.5 rounded-[3px]">
                          ₹{cutPrice}
                        </span>
                        {cut.yieldRatio && (
                          <span className="text-[9px] text-slate-400 font-medium">
                            ~{Math.round(500 * cut.yieldRatio)}g
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {cut.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Net Yield Notice */}
              {currentOption && (
                <div className="text-[11px] text-ocean-900 bg-white p-2.5 rounded-[5px] border border-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sea-600 shrink-0" />
                  <span>
                    Gross 500g landing approx <strong className="text-sea-700">{Math.round(500 * (currentOption.yieldRatio || 0.8))}g</strong> after RO cleaning.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cooking Tips */}
          {product.cookingTips && (
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-[6px] text-xs text-amber-900 flex items-start gap-2">
              <ChefHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Chef's Tip: </span>
                {product.cookingTips}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Product Details
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Hygiene guarantees */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Preservatives / Fresh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sea-600" />
              <span>Express Delivery 60-90m</span>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Footer Bar (< md) */}
        <div className="md:hidden p-3.5 px-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-lg">
          {/* Pack Quantity Modifier */}
          <div className="flex items-center border border-slate-300 rounded-[5px] overflow-hidden bg-slate-50 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 text-base cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 text-base cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Add to Cart CTA */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total</div>
              <div className="text-base font-black text-ocean-900 leading-none">
                ₹{activePrice * quantity}
              </div>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              style={{ backgroundColor: '#021630' }}
              className="bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-[5px] transition shadow-md flex items-center gap-2 cursor-pointer border border-ocean-800"
            >
              <ShoppingBag className="w-4 h-4 text-sea-400" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
