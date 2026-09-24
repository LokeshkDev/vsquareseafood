import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';

export default function StickyMobileCartBar() {
  const { cartCount, cartSubtotal, setIsCartOpen } = useCart();
  const location = useLocation();

  // Hide on checkout or full cart page
  if (cartCount === 0 || location.pathname === '/checkout' || location.pathname === '/cart') {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 z-30 p-2.5 pointer-events-none">
      <div 
        onClick={() => setIsCartOpen(true)}
        className="pointer-events-auto bg-ocean-950 text-white p-3 rounded-[5px] shadow-lg flex items-center justify-between cursor-pointer border border-ocean-800 active:scale-[0.99] transition transform"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[5px] bg-v2orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {cartCount}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300">
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart
            </div>
            <div className="text-sm font-bold text-white">
              ₹{cartSubtotal}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-sea-400 bg-ocean-800 px-3 py-1.5 rounded-[5px]">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
