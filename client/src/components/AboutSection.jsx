import React from 'react';
import { ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../data/products';

export default function AboutSection() {
  return (
    <section id="about" className="py-8 sm:py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* About Story & Hygiene Promise */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-bold text-sea-700 uppercase tracking-wider">
              About V2 Seafood
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Real Coastal Catch, Zero Preservatives
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Started by passionate coastal food lovers in Chennai, V2 Seafood connects traditional fishermen boats directly to your kitchen. We bypass auction middlemen to bring you seafood landed within hours of morning catch.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium">RO-water descaling & deep cleaning</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium">Zero formalin, ammonia, or bleach</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium">Delivered chilled at 0°C to 4°C</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium">FSSAI certified processing unit</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customer Experiences in Chennai
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {TESTIMONIALS.map((t, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 p-3.5 rounded-[5px] shadow-xs text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{t.name}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[3px] font-semibold border border-emerald-200">
                      {t.tag}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">
                    "{t.review}"
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {t.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
