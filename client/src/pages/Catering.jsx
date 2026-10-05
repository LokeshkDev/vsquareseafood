import React, { useState } from 'react';
import { 
  CalendarDays, 
  Users, 
  Check, 
  Phone, 
  Send, 
  CheckCircle2, 
  Flame, 
  Award, 
  Sparkles, 
  Clock,
  ShieldCheck,
  ChevronRight,
  Leaf,
  UtensilsCrossed
} from 'lucide-react';

import liveTawaCounterImg from '../assets/catering/live-tawa-counter.jpg';
import weddingFeastImg from '../assets/catering/wedding-feast.jpg';
import bananaLeafFeastImg from '../assets/catering/banana-leaf-feast.jpg';
import corporateCateringImg from '../assets/catering/corporate-catering.jpg';
import liveTawaCloseupImg from '../assets/catering/live-tawa-closeup.jpg';

const CATERING_SERVICES = [
  {
    id: 'live-tawa-counter',
    title: 'Live Tawa & Seafood Counter',
    tamil: 'லைவ் தவா பிஷ் பிரை கவுண்டர்',
    desc: 'Our signature attraction. Sizzling harbor-fresh Vanjaram, Nethili, and Tiger Prawns marinated in fiery Chettinad masala and pan-fried live right in front of your guests by uniform master chefs.',
    img: liveTawaCounterImg,
    tags: ['Live Pan-Fry', 'Custom Spice Level', 'Aromatic & Crispy']
  },
  {
    id: 'wedding-festival-feast',
    title: 'Grand Wedding & Festival Banquets',
    tamil: 'திருமண & திருவிழா விருந்து (சைவம் / அசைவம்)',
    desc: 'Lavish multi-course feasts for weddings and grand celebrations. Featuring royal saffron dum biryani, coastal seafood specialties, and 100% Pure Veg feasts prepared with separate kitchens.',
    img: weddingFeastImg,
    tags: ['Both Veg & Non-Veg', '100 - 3,000+ Guests', 'Custom Menu']
  },
  {
    id: 'family-festive-functions',
    title: 'Housewarmings & Family Festivals',
    tamil: 'கிரகப்பிரவேசம் & குடும்ப விழாக்கள்',
    desc: 'Specialized traditional banana leaf dining (தலைவாழை இலை சாப்பாடு) for Housewarmings (Grahapravesam), Pongal, Diwali, Baby Showers, and 60th Birthdays. Piping hot delivery in insulated food tubs.',
    img: bananaLeafFeastImg,
    tags: ['Traditional Leaf Service', 'Pure Veg Option', '25 - 150 Guests']
  },
  {
    id: 'corporate-cocktail',
    title: 'Corporate Dinners & Banquets',
    tamil: 'கார்ப்பரேட் பார்ட்டி & நிகழ்வுகள்',
    desc: 'Executive buffet setups with seafood finger food, crispy fish tikka skewers, cocktail samosas, golden calamari rings, and live tandoor/biryani stations for corporate milestones.',
    img: corporateCateringImg,
    tags: ['Corporate GST Invoicing', 'Hygienic Setup', 'On-time Delivery']
  }
];

export default function Catering() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dietPreference: 'Both Veg & Non-Veg',
    eventType: 'Wedding / Reception',
    guestCount: '100 - 250 Guests',
    eventDate: '',
    venueLocation: '',
    selectedService: 'Live Tawa & Seafood Counter',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please enter your name and phone number.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. Landing Page Hero Banner with Solid Dark Blue BG */}
      <section 
        className="relative text-white py-14 sm:py-20 overflow-hidden border-b border-[#03335F]"
        style={{ backgroundColor: '#021630' }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#008BC9_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            
            <div 
              className="inline-flex items-center gap-2 border border-[#0070AB] text-[#008BC9] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-[5px]"
              style={{ backgroundColor: '#03234C' }}
            >
              <Flame className="w-3.5 h-3.5 text-v2orange-400" />
              <span className="text-slate-100">Veg & Non-Veg Catering for All Occasions</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              Authentic Seafood, Veg & Non-Veg Catering for Every Celebration
            </h1>
            
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-medium">
              From signature live tawa fish fry counters to grand traditional vegetarian & non-vegetarian festival feasts. Tailored menus with dedicated separate kitchens for all auspicious festivals, weddings, and family functions.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <a
                href="#enquiry-section"
                style={{ backgroundColor: '#E15E18' }}
                className="bg-[#E15E18] hover:bg-[#D8511C] active:scale-[0.98] text-white font-extrabold text-sm px-7 py-3.5 rounded-[5px] transition shadow-lg flex items-center gap-2 border border-[#F47F19]"
              >
                <span>Request Custom Menu</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="tel:+919840012345"
                style={{ backgroundColor: '#03234C' }}
                className="bg-[#03234C] hover:bg-[#03335F] text-white font-bold text-sm px-6 py-3.5 rounded-[5px] border border-[#0070AB] transition flex items-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4 text-sea-400" />
                <span>Call Catering Desk</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Key Pillars / Quality Highlights */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Separate Veg Kitchen</h4>
                <p className="text-[11px] text-slate-500">100% pure vegetarian preparation & utensils.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
                <Flame className="w-5 h-5 text-v2orange-500" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Live Tawa Counters</h4>
                <p className="text-[11px] text-slate-500">Pan-fried fresh right before your guests.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 border border-sky-200">
                <Sparkles className="w-5 h-5 text-sea-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Kasimedu Morning Catch</h4>
                <p className="text-[11px] text-slate-500">Landed on event morning with zero chemicals.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-200">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">All Festivals & Events</h4>
                <p className="text-[11px] text-slate-500">Weddings, Grahapravesam & Festive Feasts.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Veg & Non-Veg Multi-Festival Spotlight Banner */}
      <section className="py-8 sm:py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-[5px] p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-[3px] border border-emerald-300 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                    Pure Veg
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-[3px] border border-amber-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-v2orange-600" />
                    Coastal Non-Veg & Seafood
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Providing Complete Veg & Non-Veg Menus for Every Occasion
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We understand the cultural importance of every event. Whether you need a <strong>100% Pure Vegetarian traditional banana leaf feast</strong> for a Housewarming pooja or a <strong>lavish seafood and mutton biryani spread</strong> for a wedding reception, our team handles both with dedicated separate preparation streams, authentic recipes, and master hospitality.
                </p>

                {/* Festival & Function Badges Grid */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold">
                  {[
                    'Weddings & Receptions',
                    'Housewarming (Grahapravesam)',
                    'Pongal & Tamil New Year Feasts',
                    'Diwali, Eid & Christmas Banquets',
                    'Baby Shower (Seemantham)',
                    'Corporate Annual Days',
                    'Birthday Celebrations'
                  ].map((occasion) => (
                    <span 
                      key={occasion}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded-[5px] border border-slate-200 transition"
                    >
                      ✓ {occasion}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-center items-center text-center p-6 bg-slate-50 border border-slate-200 rounded-[5px]">
                <UtensilsCrossed className="w-10 h-10 text-sea-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Customized Plate Planning</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Combine live counters with traditional meals, dessert stations & beverages.
                </p>
                <a
                  href="#enquiry-section"
                  className="mt-4 bg-ocean-900 hover:bg-ocean-800 text-white font-bold text-xs px-4 py-2 rounded-[5px] transition"
                >
                  Plan Your Menu
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. Creative Services Spotlight with Relevant Imagery */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sea-700 bg-sea-50 px-2.5 py-1 rounded-[3px] border border-sea-200">
              Our Catering Experiences
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Tailored Menus for Any Event
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
              From an intimate 25-guest home function to a grand 2,500-guest wedding banquet, our culinary team designs a customized menu that delights every guest.
            </p>
          </div>

          {/* Service Cards Grid with Rich Images & Strict 5px Radius */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {CATERING_SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 rounded-[5px] overflow-hidden shadow-subtle hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-sm">{service.title}</h3>
                    <p className="text-xs text-slate-200">{service.tamil}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {service.desc}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {service.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-[3px] border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href="#enquiry-section"
                      onClick={() => setFormData({ ...formData, selectedService: service.title })}
                      className="text-xs font-bold text-sea-600 hover:text-sea-700 flex items-center gap-1 transition"
                    >
                      <span>Enquire</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Live Tawa Counter Feature Spotlight with Solid Dark Blue BG */}
      <section 
        className="text-white py-12 sm:py-16 border-y border-[#03335F] relative overflow-hidden"
        style={{ backgroundColor: '#021630' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div 
                className="inline-flex items-center gap-2 border border-[#0070AB] text-[#008BC9] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-[5px]"
                style={{ backgroundColor: '#03234C' }}
              >
                <Flame className="w-3.5 h-3.5 text-v2orange-400" />
                <span className="text-slate-100">The Crown Jewel of Every Party</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                Our Signature Live Tawa Counter
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                Nothing draws a crowd like the sizzling sound and coastal aroma of fresh fish on a seasoned iron griddle. Our live counter chefs fry Seer fish steaks, butter garlic prawns, and spiced squid rings to order, ensuring each guest receives food straight from the fire.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-100">Uniformed Master Chefs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-100">RO Water Cleaning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-100">Smokeless Gas Griddles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-100">Lemon & Shallot Rings</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-[5px] overflow-hidden border border-[#034875] shadow-2xl">
                <img
                  src={liveTawaCloseupImg}
                  alt="Live Tawa Counter Seafood"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Clean Enquiry Form Section */}
      <section id="enquiry-section" className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="bg-white border border-slate-200 rounded-[5px] p-6 sm:p-10 shadow-card">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Plan Your Event Catering Menu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tell us about your celebration and our banquet chef will get in touch with customized menu choices.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center space-y-4 bg-emerald-50 border border-emerald-200 rounded-[5px]">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">
                  Enquiry Successfully Received!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Our Head Banquet Chef will call you at <strong>{formData.phone}</strong> to discuss customized Veg & Non-Veg menu options and reserve your event date.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-bold text-emerald-800 underline"
                  >
                    Submit another enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Anand Sundaram"
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-[5px] outline-none focus:border-sea-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 98400 12345"
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-[5px] outline-none focus:border-sea-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Dietary Preference</label>
                    <select
                      value={formData.dietPreference}
                      onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-[5px] bg-white outline-none focus:border-sea-600 font-medium"
                    >
                      <option>Both Veg & Non-Veg</option>
                      <option>100% Pure Veg (Separate Kitchen)</option>
                      <option>Seafood & Non-Veg Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Occasion / Function</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-[5px] bg-white outline-none focus:border-sea-600 font-medium"
                    >
                      <option>Wedding / Reception</option>
                      <option>Housewarming (Grahapravesam)</option>
                      <option>Pongal / Diwali / Festival Feast</option>
                      <option>Corporate Party / Milestone</option>
                      <option>Birthday / Family Anniversary</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Guests</label>
                    <select
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-[5px] bg-white outline-none focus:border-sea-600 font-medium"
                    >
                      <option>25 - 50 Guests</option>
                      <option>50 - 150 Guests</option>
                      <option>150 - 500 Guests</option>
                      <option>500 - 2,000+ Guests</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Event Date</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-[5px] outline-none focus:border-sea-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Venue / City Location</label>
                    <input
                      type="text"
                      value={formData.venueLocation}
                      onChange={(e) => setFormData({ ...formData, venueLocation: e.target.value })}
                      placeholder="e.g. ECR / Anna Nagar, Chennai"
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-[5px] outline-none focus:border-sea-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Special Preferences / Specific Dishes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. We require Live Tawa Vanjaram fry along with pure veg Elaneer payasam and Chettinad mushroom biryani..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-[5px] outline-none focus:border-sea-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    style={{ backgroundColor: '#E15E18' }}
                    className="w-full bg-[#E15E18] hover:bg-[#D8511C] active:scale-[0.99] text-white font-extrabold text-sm py-3.5 rounded-[5px] shadow-md transition flex items-center justify-center gap-2 border border-[#F47F19]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Catering Enquiry</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
                    Our banquet team typically responds within 2 hours with customized quotations. No upfront payment required.
                  </p>
                </div>
              </form>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}
