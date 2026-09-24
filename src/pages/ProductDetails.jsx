import React, { useState } from 'react';
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
  ChefHat
} from 'lucide-react';
import { PRODUCTS, CLEANING_OPTIONS } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  
  const [selectedCut, setSelectedCut] = useState(
    product.defaultCleaning || 'whole-cleaned'
  );
  const [quantity, setQuantity] = useState(1);

  // Available cuts for this product
  const availableCuts = CLEANING_OPTIONS.filter((c) => 
    product.cleaningOptions ? product.cleaningOptions.includes(c.id) : true
  );

  const currentCutObj = CLEANING_OPTIONS.find((c) => c.id === selectedCut) || availableCuts[0];

  const handleAddToCart = () => {
    addToCart(product, selectedCut, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedCut, quantity);
    navigate('/checkout');
  };

  // Related products (strict type match)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && p.type === product.type
  ).slice(0, 4);

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
            <div className="relative aspect-[4/3] rounded-[5px] overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-3 left-3 bg-ocean-900/90 text-white text-xs font-bold px-2 py-1 rounded-[3px] uppercase">
                  {product.badge}
                </div>
              )}
              {product.isFreshCatch && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-[3px] uppercase">
                  Harbor Fresh
                </div>
              )}
            </div>

            {/* Harbor source notice banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-[5px] p-3 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-ocean-900">
                <MapPin className="w-3.5 h-3.5 text-sea-600" />
                <span>Harbor Origin: {product.harborSource}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Storage: {product.storageTemp}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Cleaning Selection */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Title & Tamil Name */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sea-600 bg-sea-50 px-2 py-0.5 rounded-[3px]">
                  {product.category.replace('-', ' ')}
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
                ₹{product.price}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{product.mrp}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-[3px]">
                Gross: {product.grossWeight}
              </span>
            </div>

            {/* Cleaning Options Selector (Mandatory for Raw Fish) */}
            {product.type === 'raw' && availableCuts.length > 0 && (
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-[5px]">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    How would you like it cleaned?
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select your cut preference. All fish is cleaned in fresh RO water.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableCuts.map((cut) => {
                    const isSelected = selectedCut === cut.id;
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
                          {isSelected && <Check className="w-3.5 h-3.5 text-sea-600" />}
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
                  Total: ₹{product.price * quantity}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm py-3 px-6 rounded-[5px] flex items-center justify-center gap-2 transition shadow-sm border border-ocean-800"
                >
                  <ShoppingBag className="w-4 h-4 text-sea-400" />
                  <span>Add to Cart (₹{product.price * quantity})</span>
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
