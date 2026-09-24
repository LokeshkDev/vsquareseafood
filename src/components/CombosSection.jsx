import React from 'react';
import { Package, Plus, Check } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CombosSection() {
  const comboProducts = PRODUCTS.filter(p => p.type === 'combo');
  const { cart, addToCart, updateQuantity } = useCart();

  return (
    <section className="py-6 sm:py-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sea-700 uppercase tracking-wider mb-0.5">
              <Package className="w-3.5 h-3.5" />
              <span>Great Value Value Packs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Seafood Combos & Family Packs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Curated bundles for Sunday family feasts and seafood parties at special combo rates.
            </p>
          </div>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comboProducts.map((combo) => {
            const inCart = cart.find(i => i.productId === combo.id);
            const qty = inCart ? inCart.quantity : 0;

            return (
              <div 
                key={combo.id}
                className="bg-white border border-slate-200 rounded-[5px] p-3 sm:p-4 flex flex-col sm:flex-row gap-4 hover:border-slate-300 transition"
              >
                <Link to={`/product/${combo.slug}`} className="sm:w-44 h-40 flex-shrink-0 overflow-hidden rounded-[5px] bg-slate-100">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-coral-50 text-coral-600 px-2 py-0.5 rounded-[3px] border border-coral-200">
                        {combo.badge}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {combo.serves}
                      </span>
                    </div>

                    <Link to={`/product/${combo.slug}`}>
                      <h3 className="text-base font-bold text-slate-800 hover:text-sea-600 mt-1.5 transition">
                        {combo.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {combo.description}
                    </p>

                    <div className="text-[11px] font-semibold text-slate-600 mt-2 bg-slate-50 p-2 rounded-[5px] border border-slate-100">
                      Total Weight: <span className="font-bold text-slate-800">{combo.grossWeight}</span> ({combo.netWeight})
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900">
                        ₹{combo.price}
                      </span>
                      {combo.mrp && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          ₹{combo.mrp}
                        </span>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(combo, 'curry-cut', 1)}
                        className="bg-ocean-800 hover:bg-ocean-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-[5px] transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Combo</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-sea-600 text-white rounded-[5px] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(inCart.id, -1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-sea-700 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(inCart.id, 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-sea-700 text-xs font-bold"
                        >
                          +
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
