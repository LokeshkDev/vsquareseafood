import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Scissors, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CLEANING_OPTIONS } from '../data/products';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, setCleaningModalProduct } = useCart();

  // Find all cart items matching this product
  const productCartItems = cart.filter(item => item.productId === product.id);
  const totalQty = productCartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If item is raw fish with multiple cleaning options, clicking customize cut opens modal
  const hasMultipleCuts = product.type === 'raw' && product.cleaningOptions && product.cleaningOptions.length > 1;

  const defaultCutObj = CLEANING_OPTIONS.find(c => c.id === product.defaultCleaning);
  const discountPercent = product.mrp 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleCuts) {
      setCleaningModalProduct(product);
    } else {
      addToCart(
        product, 
        product.defaultCleaning || (product.type === 'kitchen' ? 'ready-to-eat' : 'whole-cleaned'), 
        1
      );
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productCartItems.length === 1) {
      updateQuantity(productCartItems[0].id, 1);
    } else {
      updateQuantity(productCartItems[0].id, 1);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (productCartItems.length > 0) {
      updateQuantity(productCartItems[productCartItems.length - 1].id, -1);
    }
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-[5px] overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-subtle transition-all duration-200 h-full">
      
      {/* Product Image Area with Link */}
      <Link to={`/product/${product.slug}`} className="block relative bg-slate-100 overflow-hidden aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover product-card-img"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="bg-ocean-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wide backdrop-blur-xs">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Harbor freshness tag or kitchen prep tag on hover */}
        {(product.harborSource || product.storageTemp) && (
          <div className="absolute bottom-1.5 left-2 right-2 bg-slate-900/85 text-white text-[10px] px-1.5 py-0.5 rounded-[3px] truncate backdrop-blur-xs opacity-0 group-hover:opacity-100 transition duration-150">
            {product.harborSource || product.storageTemp}
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Weight & Serves */}
          <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span className="truncate">{product.grossWeight}</span>
            {product.serves && (
              <span className="text-[10px] text-sea-700 font-medium truncate ml-1">
                {product.serves}
              </span>
            )}
          </div>

          {/* Product Title & Tamil Name with fixed min-height for uniform baseline */}
          <Link to={`/product/${product.slug}`} className="block min-h-[38px] sm:min-h-[42px] flex flex-col justify-start">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-sea-600 transition leading-snug line-clamp-1">
              {product.name}
            </h3>
            {product.localName ? (
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {product.localName}
              </p>
            ) : (
              <div className="h-[15px]" />
            )}
          </Link>

          {/* Cut preference indicator slot OR Kitchen Freshly Cooked chip */}
          <div className="min-h-[22px] mt-1">
            {hasMultipleCuts ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCleaningModalProduct(product);
                }}
                className="inline-flex items-center gap-1 text-[10px] text-sea-600 hover:text-sea-700 font-semibold bg-sea-50 hover:bg-sea-100 px-1.5 py-0.5 rounded-[3px] transition truncate max-w-full"
              >
                <Scissors className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">Cut: {defaultCutObj?.label || 'Custom'}</span>
              </button>
            ) : product.type === 'kitchen' ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-v2orange-600 font-semibold bg-v2orange-50 px-1.5 py-0.5 rounded-[3px] border border-v2orange-100 truncate max-w-full">
                <Flame className="w-2.5 h-2.5 flex-shrink-0 text-v2orange-500" />
                <span className="truncate">Cooked to Order</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Pricing & Add to Cart button - Solid, unmistakable, perfectly aligned */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              ₹{product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[10px] text-slate-400 line-through leading-none">
                ₹{product.mrp}
              </span>
            )}
          </div>

          {/* Quantity Controls / Add to Cart Button */}
          {totalQty === 0 ? (
            <button
              onClick={handleAddClick}
              className="flex-shrink-0 bg-ocean-900 hover:bg-ocean-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-2.5 sm:px-3 py-1.5 rounded-[5px] shadow-xs transition flex items-center justify-center gap-1.5 h-7 sm:h-8 border border-ocean-800 cursor-pointer"
              aria-label={`Add ${product.name} to cart`}
              title="Add to Cart"
            >
              <Plus className="w-3.5 h-3.5 text-sea-400 flex-shrink-0" />
              <span>Add<span className="hidden sm:inline"> to Cart</span></span>
            </button>
          ) : (
            <div className="flex-shrink-0 flex items-center bg-ocean-900 text-white rounded-[5px] shadow-xs overflow-hidden h-7 sm:h-8 border border-ocean-800">
              <button
                onClick={handleDecrement}
                className="w-6 sm:w-7 h-full flex items-center justify-center hover:bg-ocean-800 active:bg-ocean-950 transition font-bold"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 text-sea-400" />
              </button>
              <span className="w-5 sm:w-6 text-center text-xs font-bold select-none text-white">
                {totalQty}
              </span>
              <button
                onClick={handleIncrement}
                className="w-6 sm:w-7 h-full flex items-center justify-center hover:bg-ocean-800 active:bg-ocean-950 transition font-bold"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 text-sea-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
