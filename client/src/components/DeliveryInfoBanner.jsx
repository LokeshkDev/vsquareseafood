import React from 'react';
import { Waves, Scissors, Truck, Smartphone } from 'lucide-react';

export default function DeliveryInfoBanner() {
  const steps = [
    {
      title: 'Freshly Sourced',
      desc: 'Landed at local harbor at 4:30 AM daily',
      icon: Waves
    },
    {
      title: 'Cleaned Your Way',
      desc: 'Cut to curry, fry steaks or whole cleaned',
      icon: Scissors
    },
    {
      title: 'Fast Delivery',
      desc: '0-4°C chilled insulated pack in 60-90 mins',
      icon: Truck
    },
    {
      title: 'Easy Ordering',
      desc: 'Simple mobile ordering & COD / UPI payment',
      icon: Smartphone
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {steps.map((step, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${idx !== 0 ? 'sm:pl-6' : ''} ${idx > 1 ? 'pt-4 sm:pt-0' : ''}`}>
              <div className="w-8 h-8 rounded-[5px] bg-slate-100 text-ocean-800 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  {step.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
