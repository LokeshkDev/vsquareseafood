import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Fish, UtensilsCrossed, CalendarDays, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MobileBottomNav() {
  const { cartCount, setIsCartOpen } = useCart();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/shop', label: 'Shop Fish', icon: Fish },
    { to: '/kitchen', label: 'Kitchen', icon: UtensilsCrossed },
    { to: '/catering', label: 'Catering', icon: CalendarDays },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-[5px] transition ${
              isActive
                ? 'text-ocean-900 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`
          }
        >
          <item.icon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{item.label}</span>
        </NavLink>
      ))}

      {/* Cart button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center py-1.5 px-3 rounded-[5px] text-slate-500 hover:text-ocean-900 font-medium relative"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-coral-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-[3px] flex items-center justify-center leading-none">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Cart</span>
      </button>
    </div>
  );
}
