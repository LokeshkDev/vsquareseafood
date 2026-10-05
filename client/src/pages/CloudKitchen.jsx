import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Clock, ShieldCheck, UtensilsCrossed, RefreshCw } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/product.service';

export default function CloudKitchen() {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDishes = () => {
    setLoading(true);
    productService.getProducts({ limit: 100 })
      .then((res) => {
        const items = res?.data || res || [];
        const kitchenItems = Array.isArray(items)
          ? items.filter(p => (p.type || '').toLowerCase() === 'kitchen')
          : [];
        setDishes(kitchenItems);
      })
      .catch((err) => {
        console.error('Failed to load cloud kitchen dishes:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDishes();

    const handleUpdate = () => fetchDishes();
    window.addEventListener('v2_cms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('v2_cms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const filteredDishes = dishes.filter((dish) => {
    if (urlCategory === 'all') return true;
    const catLower = urlCategory.toLowerCase();
    const catSlug = (dish.category?.slug || '').toLowerCase();
    const catId = (dish.category?.id || dish.categoryId || '').toLowerCase();
    const catString = (typeof dish.category === 'string' ? dish.category : '').toLowerCase();

    return (
      catSlug === catLower ||
      catId === catLower ||
      catString === catLower ||
      catSlug.includes(catLower) ||
      catLower.includes(catSlug && catSlug !== '' ? catSlug : '___none___')
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Banner with Solid Dark Blue BG */}
        <div 
          className="text-white rounded-[5px] p-6 sm:p-8 mb-6 sm:mb-8 border border-[#03335F] relative overflow-hidden"
          style={{ backgroundColor: '#021630' }}
        >
          <div className="max-w-2xl relative z-10 space-y-2">
            <div 
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-v2orange-400 px-2.5 py-1 rounded-[3px] border border-v2orange-500/30"
              style={{ backgroundColor: '#03234C' }}
            >
              <Flame className="w-3.5 h-3.5 text-v2orange-400" />
              <span>V² Cloud Kitchen • Fresh Hot Cooked Meals</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              Authentic Coastal Seafood Kitchen
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Prepared to order using our morning harbor fresh catch. No artificial coloring, no reheated gravies. Delivered piping hot in leak-proof thermal containers across Chennai.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sea-400" />
              Average Preparation: 25-35 mins
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Fresh Ground Chettinad Spices
            </span>
          </div>
        </div>

        {/* Catalog Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Hot Prepared Dishes ({filteredDishes.length})
            </h2>
            <p className="text-xs text-slate-500">
              {urlCategory !== 'all'
                ? `Showing filtered menu for category "${urlCategory}"`
                : "Cooked fresh to order from today's Kasimedu morning seafood"}
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-[3px] border border-emerald-200">
            ● Kitchen Open Now
          </span>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-sea-600" />
            <span>Loading hot prepared dishes...</span>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[5px] border border-slate-200 text-slate-500 text-xs space-y-2">
            <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No dishes found in this category</p>
            <p className="text-slate-400">View all Cloud Kitchen dishes or select another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredDishes.map((dish) => (
              <ProductCard key={dish.id} product={dish} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
