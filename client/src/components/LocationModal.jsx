import React, { useState } from 'react';
import { X, MapPin, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CHENNAI_AREAS = [
  { area: 'Mylapore', pincode: '600004', time: '40-50 mins', hub: 'Kasimedu Express Hub' },
  { area: 'T. Nagar', pincode: '600017', time: '50-60 mins', hub: 'Central Hub' },
  { area: 'Anna Nagar', pincode: '600040', time: '45-55 mins', hub: 'North Chennai Hub' },
  { area: 'Adyar & Besant Nagar', pincode: '600020', time: '35-45 mins', hub: 'South Coast Hub' },
  { area: 'Velachery', pincode: '600042', time: '50-65 mins', hub: 'South Hub' },
  { area: 'OMR - Thoraipakkam & Sholinganallur', pincode: '600097', time: '60-75 mins', hub: 'IT Corridor Hub' },
  { area: 'Royapettah & Gopalapuram', pincode: '600014', time: '35-45 mins', hub: 'Central Hub' },
  { area: 'Tambaram & Chromepet', pincode: '600045', time: '65-80 mins', hub: 'South Suburban' },
];

export default function LocationModal() {
  const { isLocationModalOpen, setIsLocationModalOpen, deliveryLocation, setDeliveryLocation } = useCart();
  const [customInput, setCustomInput] = useState('');

  if (!isLocationModalOpen) return null;

  const handleSelectArea = (item) => {
    setDeliveryLocation(`${item.area}, Chennai - ${item.pincode}`);
    setIsLocationModalOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      setDeliveryLocation(customInput.trim());
      setIsLocationModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-md rounded-[5px] border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[5px] bg-sea-50 text-sea-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Select Delivery Location</h3>
              <p className="text-xs text-slate-500">Fast delivery from nearest cold-chain hub</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-1.5 rounded-[5px] hover:bg-slate-200 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Custom entry form */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Enter Area or Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. Alwarpet, Chennai or 600018"
                className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-[5px] outline-none focus:border-ocean-800"
              />
              <button
                type="submit"
                className="bg-ocean-800 text-white text-xs font-bold px-4 py-2 rounded-[5px] hover:bg-ocean-700 transition"
              >
                Set
              </button>
            </div>
          </form>

          {/* Quick Popular Delivery Zones */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Popular Chennai Delivery Zones
            </div>
            <div className="space-y-1.5">
              {CHENNAI_AREAS.map((item) => {
                const label = `${item.area}, Chennai - ${item.pincode}`;
                const isSelected = deliveryLocation === label;
                return (
                  <div
                    key={item.pincode}
                    onClick={() => handleSelectArea(item)}
                    className={`p-2.5 rounded-[5px] border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-sea-600 bg-sea-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {item.area} <span className="text-xs text-slate-400 font-normal">({item.pincode})</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                        <Zap className="w-3 h-3" />
                        Delivery in {item.time}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-sea-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
