import React, { useState } from 'react';
import { X, Check, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CLEANING_OPTIONS } from '../data/products';

export default function CleaningCutModal() {
  const { cleaningModalProduct, setCleaningModalProduct, addToCart, setIsCartOpen } = useCart();
  const [selectedCut, setSelectedCut] = useState(
    cleaningModalProduct?.defaultCleaning || 'fry-cut'
  );
  const [quantity, setQuantity] = useState(1);

  if (!cleaningModalProduct) return null;

  const product = cleaningModalProduct;
  const availableCuts = CLEANING_OPTIONS.filter(opt => 
    product.cleaningOptions?.includes(opt.id)
  );

  const currentOption = CLEANING_OPTIONS.find(opt => opt.id === selectedCut) || CLEANING_OPTIONS[0];

  const handleConfirm = () => {
    addToCart(product, selectedCut, quantity);
    setCleaningModalProduct(null);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-lg rounded-[5px] border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              How would you like it cleaned?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {product.name} ({product.localName}) • {product.grossWeight}
            </p>
          </div>
          <button
            onClick={() => setCleaningModalProduct(null)}
            className="p-1.5 rounded-[5px] hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Yield Explanation Notice */}
          <div className="bg-ocean-50 border border-ocean-100 p-3 rounded-[5px] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sea-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-ocean-900">
              <span className="font-semibold">Transparent Fresh Catch Weight:</span> We weigh fresh fish whole from the harbor. After descaling, gutting, and cleaning with RO water, net yield is approx <span className="font-bold text-sea-700">{Math.round(500 * (currentOption.yieldRatio || 0.8))}g</span>.
            </div>
          </div>

          {/* Cuts selection list */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Choose Cleaning Cut
            </label>
            <div className="grid grid-cols-1 gap-2">
              {availableCuts.map((cut) => {
                const isSelected = selectedCut === cut.id;
                return (
                  <div
                    key={cut.id}
                    onClick={() => setSelectedCut(cut.id)}
                    className={`p-3 rounded-[5px] border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-sea-600 bg-sea-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{cut.label}</span>
                        {product.defaultCleaning === cut.id && (
                          <span className="text-[10px] uppercase font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-[3px]">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cut.desc}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-[3px] border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-sea-600 border-sea-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase">Quantity</span>
              <p className="text-xs text-slate-500">{product.grossWeight} per pack</p>
            </div>
            <div className="flex items-center border border-slate-300 rounded-[5px] overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 text-base"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-bold text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 text-base"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Price</div>
            <div className="text-lg font-bold text-ocean-900">₹{product.price * quantity}</div>
          </div>
          <button
            onClick={handleConfirm}
            className="bg-ocean-800 hover:bg-ocean-700 text-white font-bold text-sm px-6 py-2.5 rounded-[5px] transition shadow-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
