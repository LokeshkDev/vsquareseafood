import React from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CLEANING_OPTIONS } from '../data/products';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal, 
    deliveryFee, 
    isFreeDelivery,
    packagingFee,
    grandTotal,
    cartCount
  } = useCart();
  
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 699;
  const amountNeeded = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);

  const getCutLabel = (cutId) => {
    const opt = CLEANING_OPTIONS.find(c => c.id === cutId);
    return opt ? opt.label : cutId;
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-ocean-800" />
            <h2 className="text-base font-bold text-slate-800">
              My Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-[5px] hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free delivery tracker */}
        {cart.length > 0 && (
          <div className="bg-ocean-50/70 p-3 border-b border-ocean-100 px-4">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              {isFreeDelivery ? (
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Yay! You've unlocked FREE Delivery
                </span>
              ) : (
                <span className="text-ocean-900">
                  Add <strong className="text-coral-600">₹{amountNeeded}</strong> more for Free Delivery
                </span>
              )}
              <span className="text-slate-500">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-[2px] overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isFreeDelivery ? 'bg-emerald-500' : 'bg-sea-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart items list or empty state */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-[5px] flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-700">Your cart is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Add fresh fish, cleaned prawns, or cloud kitchen favorites to start ordering.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
                className="bg-ocean-800 text-white text-xs font-bold px-5 py-2.5 rounded-[5px] hover:bg-ocean-700 transition"
              >
                Browse Fresh Seafood
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.id} 
                className="p-3 bg-white border border-slate-200 rounded-[5px] flex items-start gap-3 hover:border-slate-300 transition"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-[5px] border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 p-0.5 ml-2 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cut: <span className="font-semibold text-ocean-800">{getCutLabel(item.cleaningOption)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-2.5">
                    <div className="text-sm font-bold text-ocean-900">
                      ₹{item.unitPrice * item.quantity}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        (₹{item.unitPrice} ea)
                      </span>
                    </div>

                    <div className="flex items-center border border-slate-300 rounded-[5px] overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 transition text-xs"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 transition text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-[5px] p-3 text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sea-600 flex-shrink-0" />
              <span>
                <strong>0-4°C Cold Chain Packaging:</strong> Insulated pack with gel ice to preserve harbor freshness.
              </span>
            </div>
          )}
        </div>

        {/* Footer & Bill details */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Bill Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Item Total</span>
                <span className="font-semibold">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Partner Fee</span>
                <span>
                  {isFreeDelivery ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cold Chain & Vacuum Packaging</span>
                <span>₹{packagingFee}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-ocean-900">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCheckout}
                className="w-full bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm py-3 px-4 rounded-[5px] flex items-center justify-between transition shadow-sm border border-ocean-800"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-1.5 font-extrabold text-v2orange-400">
                  <span>₹{grandTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={handleViewCart}
                className="w-full bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2 px-4 border border-slate-300 rounded-[5px] transition text-center"
              >
                View Detailed Cart & Instructions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
