import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Footer() {
  return (
    <footer 
      className="text-slate-300 text-xs py-12 border-t border-[#03335F]"
      style={{ backgroundColor: '#021630' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#03335F]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-block bg-white px-3 py-1.5 rounded-[5px] shadow-xs hover:opacity-95 transition" title="V² Seafood - SEAFRESH">
              <img
                src={logoImg}
                alt="V² Seafood - SEAFRESH"
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Chennai's dedicated fresh raw seafood sales, cloud kitchen meals, and bulk catering service. Sourced daily from Kasimedu Harbor, cleaned in RO water, and delivered in cold-chain thermal packaging.
            </p>
            <div className="pt-2 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-sea-400" />
                <span>Operating Hours: 6:00 AM – 9:30 PM (All 7 Days)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sea-400" />
                <span>Pallavaram, Chennai</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Fresh Seafood
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li><Link to="/shop?category=sea-fish" className="hover:text-white transition">Sea Fish (கடல் மீன்)</Link></li>
              <li><Link to="/shop?category=prawns" className="hover:text-white transition">Tiger Prawns (இறால்)</Link></li>
              <li><Link to="/shop?category=crabs-squid" className="hover:text-white transition">Blue Sea Crabs (நண்டு)</Link></li>
              <li><Link to="/shop?category=freshwater" className="hover:text-white transition">River Fish (ஆற்று மீன்)</Link></li>
              <li><Link to="/shop?category=ready-to-cook" className="hover:text-white transition">Marinated Fish Fry</Link></li>
            </ul>
          </div>

          {/* Cloud Kitchen & Services */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Kitchen & Catering
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li><Link to="/kitchen" className="hover:text-white transition">Chettinad Meen Kulambu</Link></li>
              <li><Link to="/kitchen" className="hover:text-white transition">Vanjaram Tawa Fry</Link></li>
              <li><Link to="/kitchen" className="hover:text-white transition">Coastal Dum Biryani</Link></li>
              <li><Link to="/catering" className="hover:text-white transition">Wedding Feasts</Link></li>
              <li><Link to="/catering" className="hover:text-white transition">Live Tawa Counters</Link></li>
              <li><Link to="/catering" className="hover:text-white transition">Corporate Seafood Buffet</Link></li>
            </ul>
          </div>

          {/* Help & Contact */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Customer Support
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-1.5 text-slate-200">
                <Phone className="w-3.5 h-3.5 text-sea-400" />
                <a href="tel:+919840012345" className="hover:text-white">+91 98400 12345</a>
              </li>
              <li className="flex items-center gap-1.5 text-slate-200">
                <Mail className="w-3.5 h-3.5 text-sea-400" />
                <a href="mailto:support@v2seafood.in" className="hover:text-white">support@v2seafood.in</a>
              </li>
              <li><Link to="/catering" className="hover:text-white transition">Bulk Booking Enquiry</Link></li>
              <li><Link to="/shop" className="hover:text-white transition">Daily Fresh Arrivals</Link></li>
              <li className="pt-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-[3px] border border-emerald-800">
                  FSSAI Lic. 12423008000492
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} V2 Seafood Private Limited. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>UPI / GPay / PhonePe</span>
            <span>•</span>
            <span>Credit & Debit Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
