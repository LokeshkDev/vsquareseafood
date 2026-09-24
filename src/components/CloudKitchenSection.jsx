import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Flame, ArrowRight, Plus, Minus } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';

export default function CloudKitchenSection() {
  const kitchenDishes = PRODUCTS.filter(p => p.type === 'kitchen');
  const { cart, addToCart, updateQuantity } = useCart();

  return (
    <section className="py-6 sm:py-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-coral-600 uppercase tracking-wider mb-1 bg-coral-50 px-2 py-0.5 rounded-[3px] border border-coral-200">
              <Flame className="w-3.5 h-3.5 text-coral-500" />
              <span>Hot Prepared Seafood</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              V2 Seafood Cloud Kitchen
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Craving fresh fish fry or Chettinad meen kulambu right now? Cooked to order and delivered piping hot.
            </p>
          </div>

          <Link
            to="/kitchen"
            className="inline-flex items-center gap-1 text-xs font-bold text-coral-600 hover:text-coral-700 transition"
          >
            <span>Explore Cloud Kitchen ({kitchenDishes.length} Dishes)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-col food delivery style card layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kitchenDishes.map((dish) => {
            const inCart = cart.find(i => i.productId === dish.id);
            const qty = inCart ? inCart.quantity : 0;

            return (
              <div 
                key={dish.id}
                className="bg-white border border-slate-200 rounded-[5px] overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-subtle transition"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="bg-coral-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase">
                      {dish.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] px-1.5 py-0.5 rounded-[3px] font-medium backdrop-blur-xs">
                    {dish.storageTemp}
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                      {dish.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {dish.localName}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {dish.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        ₹{dish.price}
                      </span>
                      {dish.mrp && (
                        <span className="text-[11px] text-slate-400 line-through ml-1.5">
                          ₹{dish.mrp}
                        </span>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(dish, 'ready-to-eat', 1)}
                        className="bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-[5px] transition flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-coral-600 text-white rounded-[5px] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(inCart.id, -1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-coral-700 text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(inCart.id, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-coral-700 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
