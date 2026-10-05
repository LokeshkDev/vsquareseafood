import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CLEANING_OPTIONS } from '../data/products';

export default function Cart() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal, 
    deliveryFee, 
    isFreeDelivery,
    packagingFee,
    grandTotal,
    cartCount,
    deliveryLocation,
    setIsLocationModalOpen,
    freeDeliveryThreshold = 699,
    isDeliveryFeeEnabled = true,
    isPackagingFeeEnabled = true,
    deliveryFeeLabel = 'Delivery Partner Fee',
    packagingFeeLabel = 'Cold Chain & Vacuum Packaging',
    packagingNoticeText,
  } = useCart();

  const navigate = useNavigate();

  const getCutLabel = (cutId) => {
    const opt = CLEANING_OPTIONS.find(c => c.id === cutId);
    return opt ? opt.label : cutId;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-[5px] p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-[5px] flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your seafood cart is empty</h2>
            <p className="text-xs text-slate-500 mt-1">
              You haven't added any fresh seafood or cloud kitchen dishes to your cart yet.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-block bg-ocean-800 hover:bg-ocean-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-[5px] transition shadow-xs"
          >
            Explore Today's Fresh Catch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your fresh cuts, delivery location, and order bill
            </p>
          </div>

          <Link
            to="/shop"
            className="text-xs font-bold text-sea-600 hover:text-sea-700 hidden sm:inline"
          >
            + Add more items
          </Link>
        </div>

        {/* 2-Column layout: Item list + Bill summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Cart items */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Delivery address preview */}
            <div className="bg-white border border-slate-200 rounded-[5px] p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[5px] bg-sea-50 text-sea-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Delivering to: <span className="font-semibold text-slate-600">{deliveryLocation}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Estimated arrival in 45-60 minutes from nearest harbor hub
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-sea-600 hover:text-sea-700 px-2 py-1 rounded-[3px] border border-sea-200 bg-sea-50 hover:bg-sea-100 transition"
              >
                Change
              </button>
            </div>

            {/* Items Card List */}
            <div className="bg-white border border-slate-200 rounded-[5px] divide-y divide-slate-100 overflow-hidden">
              {cart.map((item) => {
                const itemImage = item.product?.image || item.product?.images?.[0]?.publicUrl || 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800';
                const itemUnitPrice = Number(item.unitPrice) || 0;
                const itemQty = Number(item.quantity) || 1;
                const itemTotal = itemUnitPrice * itemQty;
                const isRaw = (item.product?.type || '').toLowerCase() === 'raw';

                return (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={itemImage}
                        alt={item.product?.name || 'Seafood'}
                        className="w-16 h-16 object-cover rounded-[5px] border border-slate-100 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800';
                        }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {item.product?.name || 'Fresh Catch'}
                        </h3>
                        <div className="text-xs text-slate-500 font-medium">
                          {item.product?.localName} {item.product?.grossWeight ? `• ${item.product.grossWeight}` : ''}
                        </div>
                        
                        {isRaw && (
                          <div className="text-[11px] text-ocean-800 mt-1 inline-block bg-slate-100 px-2 py-0.5 rounded-[3px] font-semibold">
                            Cut: {getCutLabel(item.cleaningOption)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center border border-slate-300 rounded-[5px] overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 text-xs"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {itemQty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-200 text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-base font-extrabold text-ocean-900">
                          ₹{itemTotal}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          (₹{itemUnitPrice} each)
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cold chain packaging banner */}
            {isPackagingFeeEnabled && packagingNoticeText && (
              <div className="bg-ocean-50 border border-ocean-100 rounded-[5px] p-3 text-xs text-ocean-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sea-600 flex-shrink-0" />
                <div>
                  <strong>0-4°C Cold Chain Packaging:</strong> {packagingNoticeText}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Order Bill Summary */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 space-y-4 shadow-xs sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Bill Details
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{Number(cartSubtotal) || 0}</span>
              </div>

              {isDeliveryFeeEnabled && (
                <div className="flex justify-between text-slate-600">
                  <span>{deliveryFeeLabel || 'Delivery Partner Fee'}</span>
                  <span>
                    {isFreeDelivery || deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-900">₹{Number(deliveryFee) || 0}</span>
                    )}
                  </span>
                </div>
              )}

              {isDeliveryFeeEnabled && !isFreeDelivery && (
                <div className="text-[11px] text-ocean-800 bg-ocean-50 p-2 rounded-[3px]">
                  Add <strong>₹{Math.max(0, (Number(freeDeliveryThreshold) || 699) - (Number(cartSubtotal) || 0))}</strong> more for <strong>FREE Delivery</strong>
                </div>
              )}

              {isPackagingFeeEnabled && Number(packagingFee) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{packagingFeeLabel || 'Cold Chain & Vacuum Packaging'}</span>
                  <span className="font-semibold text-slate-900">₹{Number(packagingFee) || 0}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-ocean-900">
                <span>To Pay</span>
                <span>₹{Number(grandTotal) || 0}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-sm py-3 px-4 rounded-[5px] flex items-center justify-between transition shadow-sm border border-ocean-800"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-1.5 font-bold text-v2orange-400">
                <span>₹{Number(grandTotal) || 0}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <div className="pt-2 text-[10px] text-slate-400 text-center space-y-1">
              <p>Safe & Secure 256-Bit SSL Encrypted Checkout</p>
              <p>Payment options: UPI, Cash on Delivery, Cards, Netbanking</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
