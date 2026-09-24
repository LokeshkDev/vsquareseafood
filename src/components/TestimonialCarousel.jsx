import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';
import { TESTIMONIALS } from '../data/products';

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const reviews = [
    ...TESTIMONIALS,
    {
      name: 'Anandhi Meenakshi',
      location: 'Adyar, Chennai',
      review: 'I ordered the Tiger Prawns and Sankara fish for a Sunday family lunch. The fish was so fresh you could smell the sea, completely clean and ready to cook!',
      rating: 5,
      tag: 'Repeat Customer'
    },
    {
      name: 'Capt. Sundaram K.',
      location: 'ECR, Chennai',
      review: 'As someone who grew up along the coast, identifying genuine harbor-fresh catch is second nature. V2 Seafood delivers the real deal with zero chemical preservation.',
      rating: 5,
      tag: 'Seafood Connoisseur'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, reviews.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const current = reviews[currentIndex];

  return (
    <section 
      className="py-12 sm:py-16 text-white border-t border-[#03335F] relative overflow-hidden"
      style={{ backgroundColor: '#021630' }}
    >
      {/* Subtle Corporate Grid / Ambient Glow Background */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#008BC9_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sea-600/10 rounded-[5px] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-v2orange-500/10 rounded-[5px] blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header with 100% High Visibility Fonts */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
            What Seafood Lovers Say About V² Seafood
          </h2>
          <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-xl mx-auto font-medium leading-relaxed">
            From daily Kasimedu morning harbor catches to grand wedding banquets, hear from our verified customers across Chennai.
          </p>
        </div>

        {/* Carousel Card Container with Solid Dark Navy Background */}
        <div 
          className="relative border border-[#034875] rounded-[5px] p-6 sm:p-10 shadow-2xl"
          style={{ backgroundColor: '#03234C' }}
        >
          <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-[#008BC9]/20 absolute top-4 right-4 pointer-events-none" />

          {/* Animated Slide Content */}
          <div className="min-h-[140px] sm:min-h-[120px] flex flex-col justify-center">
            <div key={currentIndex} className="animate-fadeInSlide space-y-4">
              
              {/* Star Rating */}
              <div className="flex items-center gap-1.5">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-v2orange-400 text-v2orange-400" />
                ))}
                <span className="ml-2 text-xs font-extrabold text-white">5.0 / 5.0 Rating</span>
              </div>

              {/* Review Quote in Bright White */}
              <p className="text-base sm:text-xl font-semibold text-white leading-relaxed italic">
                "{current.review}"
              </p>

              {/* Reviewer Details */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#03335F]">
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base">
                    {current.name}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {current.location}
                  </div>
                </div>

                <span 
                  className="text-white border border-[#0070AB] text-[11px] font-bold px-3 py-1 rounded-[5px]"
                  style={{ backgroundColor: '#021630' }}
                >
                  {current.tag}
                </span>
              </div>

            </div>
          </div>

          {/* Controls: Prev / Next buttons & Dots */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#03335F]">
            {/* Pagination Indicators */}
            <div className="flex items-center gap-2">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-2 transition-all duration-300 rounded-[2px] ${
                    currentIndex === idx
                      ? 'w-8 bg-v2orange-500'
                      : 'w-2.5 bg-slate-500 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 border border-[#034875] hover:border-sea-500 bg-[#021630] hover:bg-[#03335F] text-white rounded-[5px] transition shadow-xs"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 border border-[#034875] hover:border-sea-500 bg-[#021630] hover:bg-[#03335F] text-white rounded-[5px] transition shadow-xs"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
