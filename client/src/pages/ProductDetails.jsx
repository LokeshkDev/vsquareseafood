import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  Info, 
  ArrowLeft,
  ShoppingBag,
  ChefHat,
  Fish,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CLEANING_OPTIONS } from '../data/products';
import { productService } from '../services/product.service';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedCut, setSelectedCut] = useState('whole-cleaned');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        const url = typeof img === 'string' ? img : (img.publicUrl || img.url);
        if (url && !list.includes(url)) list.push(url);
      });
    }
    if (product.imageUrl && !list.includes(product.imageUrl)) list.push(product.imageUrl);
    if (product.image && !list.includes(product.image)) list.push(product.image);
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800'];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  // Fetch product and related products dynamically
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    productService.getProductBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setError(true);
          setLoading(false);
          return;
        }
        setProduct(data);
        setSelectedCut(data.defaultCleaning || 'whole-cleaned');
        setLoading(false);

        // Fetch related products
        const prodType = (data.type || '').toUpperCase();
        productService.getProducts({ type: prodType, limit: 10 })
          .then((res) => {
            if (!isMounted) return;
            const list = res?.data || res?.products || res || [];
            if (Array.isArray(list)) {
              setRelatedProducts(list.filter((p) => p.id !== data.id && p.slug !== slug).slice(0, 4));
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Product not found:', err);
        setError(true);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-sea-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Loading seafood details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-200 rounded-[5px] p-8 max-w-md w-full text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            This product is currently out of stock, unavailable, or has been removed from the daily harbor catch.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/shop"
              className="bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-[5px] transition"
            >
              Browse Fresh Catch
            </Link>
            <Link
              to="/kitchen"
              className="bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-[5px] transition"
            >
              Explore Cloud Kitchen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRaw = (product.type || '').toLowerCase() === 'raw';
  const basePrice = Number(product.basePrice || product.price || 0);
  const mrp = product.mrp ? Number(product.mrp) : (product.variants?.[0]?.compareAtPrice ? Number(product.variants[0].compareAtPrice) : null);
  const activeImage = allImages[activeImageIndex] || allImages[0];
  const categoryName = product.category?.name || product.category || 'Fresh Seafood';

  // Helper to determine allowed cuts for this product
  const getAllowedCutIds = (prod) => {
    if (!prod) return [];
    if (prod.cutAvailability && typeof prod.cutAvailability === 'object') {
      return Object.keys(prod.cutAvailability).filter((k) => prod.cutAvailability[k] === true);
    }
    if (Array.isArray(prod.cleaningOptions)) {
      return prod.cleaningOptions;
    }
    if (Array.isArray(prod.variants) && prod.variants.length > 0) {
      const varCuts = prod.variants
        .filter((v) => v.cleaningOption && v.isAvailable !== false)
        .map((v) => v.cleaningOption);
      if (varCuts.length > 0) return [...new Set(varCuts)];
    }
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

  const allowedCutIds = isRaw ? getAllowedCutIds(product) : [];
  const availableCuts = isRaw
    ? CLEANING_OPTIONS.filter((c) => allowedCutIds.includes(c.id))
    : [];

  // Dynamic cut pricing helper
  const getCutPrice = (cutId) => {
    if (product.cutPrices && product.cutPrices[cutId] !== undefined && product.cutPrices[cutId] !== '') {
      return Number(product.cutPrices[cutId]);
    }
    if (Array.isArray(product.variants)) {
      const matched = product.variants.find((v) => v.cleaningOption === cutId);
      if (matched && matched.price !== undefined) {
        return Number(matched.price);
      }
    }
    const cutObj = CLEANING_OPTIONS.find((c) => c.id === cutId);
    return basePrice + (cutObj?.priceModifier || 0);
  };

  const activePrice = isRaw ? getCutPrice(selectedCut) : basePrice;
  const currentCutObj = CLEANING_OPTIONS.find((c) => c.id === selectedCut);

  const handleAddToCart = () => {
    addToCart(product, selectedCut, quantity, activePrice);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedCut, quantity, activePrice);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-ocean-900 transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to products</span>
        </button>

        {/* Main Product Container */}
        <div className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-[4/3] rounded-[5px] overflow-hidden bg-slate-100 border border-slate-200 group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {product.badge && (
                <div className="absolute top-3 left-3 bg-ocean-900/90 text-white text-xs font-bold px-2 py-1 rounded-[3px] uppercase pointer-events-none">
                  {product.badge}
                </div>
              )}
              {product.isFreshCatch && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-[3px] uppercase pointer-events-none">
                  Harbor Fresh
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
                    className={`relative w-16 h-16 rounded-[4px] overflow-hidden shrink-0 border-2 transition cursor-pointer ${
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

            {/* Harbor source notice banner */}
            {(product.harborSource || product.storageTemp) && (
              <div className="bg-slate-50 border border-slate-200 rounded-[5px] p-3 text-xs text-slate-600 space-y-1">
                {product.harborSource && (
                  <div className="flex items-center gap-1.5 font-bold text-ocean-900">
                    <MapPin className="w-3.5 h-3.5 text-sea-600" />
                    <span>Harbor Origin: {product.harborSource}</span>
                  </div>
                )}
                {product.storageTemp && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Storage: {product.storageTemp}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Details & Cleaning Selection */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Title & Tamil Name */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sea-600 bg-sea-50 px-2 py-0.5 rounded-[3px]">
                  {categoryName}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  ● In Stock (Daily Landing)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {product.name}
              </h1>
              {product.localName && (
                <h2 className="text-base sm:text-lg font-bold text-slate-500 mt-0.5">
                  {product.localName}
                </h2>
              )}
            </div>

            {/* Price & Weight Row */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-slate-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ₹{activePrice}
              </span>
              {mrp && mrp > activePrice && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{mrp}
                </span>
              )}
              {product.grossWeight && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-[3px]">
                  Gross: {product.grossWeight}
                </span>
              )}
            </div>

            {/* Cleaning Options Selector (Mandatory for Raw Fish) */}
            {isRaw && availableCuts.length > 0 && (
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-[5px]">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    How would you like it cleaned?
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select your cut preference. Price updates automatically per cut.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {availableCuts.map((cut) => {
                    const isSelected = selectedCut === cut.id;
                    const cutPrice = getCutPrice(cut.id);
                    return (
                      <div
                        key={cut.id}
                        onClick={() => setSelectedCut(cut.id)}
                        className={`p-2.5 rounded-[5px] border cursor-pointer transition text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-sea-600 bg-white ring-1 ring-sea-600 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{cut.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-sea-700 bg-sea-50 px-1.5 py-0.5 rounded-[3px]">
                              ₹{cutPrice}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sea-600" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                          {cut.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Net Yield Notice */}
                <div className="text-[11px] text-ocean-900 bg-white p-2 rounded-[3px] border border-slate-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sea-600 flex-shrink-0" />
                  <span>
                    Gross weight is 500g. Cleaned & cut net weight will be approx <strong className="text-sea-700">{Math.round(500 * (currentCutObj?.yieldRatio || 0.8))}g</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Cooking Tips */}
            {product.cookingTips && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-[5px] text-xs text-amber-900 flex items-start gap-2">
                <ChefHat className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Chef's Cooking Recommendation: </span>
                  {product.cookingTips}
                </div>
              </div>
            )}

            {/* Quantity & CTA Buttons */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Packs:</span>
                <div className="flex items-center border border-slate-300 rounded-[5px] overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Total: ₹{activePrice * quantity}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm py-3 px-6 rounded-[5px] flex items-center justify-center gap-2 transition shadow-sm border border-ocean-800"
                >
                  <ShoppingBag className="w-4 h-4 text-sea-400" />
                  <span>Add to Cart (₹{activePrice * quantity})</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-v2orange-500 hover:bg-v2orange-600 text-white font-bold text-sm py-3 px-6 rounded-[5px] transition shadow-sm text-center"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Hygiene guarantees */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Preservatives / Formalin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sea-600" />
                <span>Express Delivery (60-90 Mins)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related seafood */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Similar Seafood You May Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
