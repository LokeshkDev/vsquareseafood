import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Check, ArrowRight } from 'lucide-react';
import { CATERING_PACKAGES } from '../data/products';

export default function CateringSection() {
  return (
    <section className="py-8 sm:py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ocean-800 uppercase tracking-wider mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-sea-600" />
            <span>Event & Wedding Feasts</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Seafood Catering for Every Occasion
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            From intimate terrace parties to 1000+ guest wedding receptions. Live tawa counters, traditional claypot fish curries, and coastal dum biryani cooked by veteran master chefs.
          </p>
        </div>

        {/* Catering Categories Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-8">
          {[
            'Weddings', 
            'Family Functions', 
            'Corporate Events', 
            'Birthday Parties', 
            'Outdoor Events'
          ].map((cat) => (
            <div 
              key={cat}
              className="bg-white border border-slate-200 p-2.5 sm:p-3 rounded-[5px] text-center text-xs font-bold text-slate-700 hover:border-ocean-800 transition"
            >
              {cat}
            </div>
          ))}
        </div>

        {/* 3 Main Catering Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {CATERING_PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className="bg-white border border-slate-200 rounded-[5px] p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-ocean-100 text-ocean-900 px-2 py-0.5 rounded-[3px]">
                    {pkg.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {pkg.guestCount}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {pkg.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {pkg.tagline}
                </p>

                <div className="text-sm font-extrabold text-ocean-900 mb-4 bg-slate-50 p-2.5 rounded-[5px] border border-slate-100">
                  {pkg.pricePerPlate} <span className="text-xs font-normal text-slate-500">/ plate</span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Menu Highlights
                  </div>
                  {pkg.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-sea-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to={`/catering?package=${pkg.id}`}
                className="w-full bg-ocean-800 hover:bg-ocean-700 text-white font-bold text-xs py-2.5 rounded-[5px] text-center transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Enquire for Catering</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
