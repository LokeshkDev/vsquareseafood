import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UtensilsCrossed, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import bannerImg1 from '../assets/web-banner.png';
import bannerImg2 from '../assets/web-banner-2.png';

const BANNERS = [
  {
    image: bannerImg1,
    prefix: 'Fresh Seafood, Delivered',
    highlight: 'Right to Your Door',
    accentColor: 'text-[#008BC9]', // Logo cyan-blue fin
    ctaPrimary: { text: 'Shop Fresh Fish', to: '/shop' },
    ctaSecondary: { text: 'Order from Cloud Kitchen', to: '/kitchen', icon: UtensilsCrossed },
    overlayGradient: 'bg-gradient-to-r from-[#021630] via-[#021630]/85 to-[#021630]/30 sm:to-transparent',
  },
  {
    image: bannerImg2,
    prefix: '100% Harbor Fresh Catch,',
    highlight: 'Zero Preservatives',
    accentColor: 'text-[#F47F19]', // Logo bright orange
    ctaPrimary: { text: "Explore Today's Catch", to: '/shop' },
    ctaSecondary: { text: 'Seafood Catering', to: '/catering', icon: CalendarDays },
    overlayGradient: 'bg-gradient-to-r from-[#021630]/95 via-[#021630]/80 to-[#021630]/25 sm:to-transparent',
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrev = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const handleNext = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      handleNext();
    } else if (distance < -40) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const slide = BANNERS[currentSlide];

  return (
    <section 
      className="relative overflow-hidden border-b border-ocean-900 bg-[#021630] text-white aspect-[2048/768] md:aspect-auto md:h-[360px] flex items-center select-none w-full"
      style={{ backgroundColor: '#021630' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full Cover Background Image Carousel with Smooth Fade */}
      {BANNERS.map((b, idx) => (
        <img
          key={idx}
          src={b.image}
          alt={`V² Seafood Banner ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out select-none ${
            currentSlide === idx ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* Deep Ocean Blue Color Overlay for 100% Font & Button Visibility */}
      <div className={`absolute inset-0 ${slide.overlayGradient} z-1 pointer-events-none transition-all duration-700`} />
      <div className="absolute inset-0 bg-[#021630]/20 sm:bg-[#021630]/35 z-1 pointer-events-none" />

      {/* Hero Content: Compact height to keep categories visible on screen */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 w-full h-full flex items-center">
        <div className="max-w-[65%] sm:max-w-xl md:max-w-2xl py-1 sm:py-3">
          
          {/* Animated Carousel Title */}
          <div className="flex flex-col justify-center">
            <div
              key={currentSlide}
              className="animate-fadeInSlide"
            >
              <h1 className="text-xs xs:text-sm sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                {slide.prefix} <br />
                <span className={`${slide.accentColor} drop-shadow-md`}>
                  {slide.highlight}
                </span>
              </h1>
            </div>
          </div>

          {/* 2 Visible CTA Buttons with Strict 5px Radius */}
          <div className="pt-1.5 sm:pt-3 flex flex-wrap items-center gap-1.5 sm:gap-3">
            {/* Primary CTA (Bright V2 Flame Orange) */}
            <Link
              to={slide.ctaPrimary.to}
              style={{ backgroundColor: '#E15E18' }}
              className="bg-[#E15E18] hover:bg-[#D8511C] active:scale-[0.98] text-white font-extrabold text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-5 md:px-6 py-1 sm:py-2 md:py-2.5 rounded-[5px] flex items-center gap-1 sm:gap-2 shadow-md transition border border-[#F47F19]"
            >
              <span>{slide.ctaPrimary.text}</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </Link>

            {/* Secondary CTA (Solid Deep Navy with Sea Blue Border) */}
            <Link
              to={slide.ctaSecondary.to}
              style={{ backgroundColor: '#021630' }}
              className="bg-[#021630] hover:bg-[#03234C] active:scale-[0.98] text-white border border-[#0070AB] font-extrabold text-[10px] sm:text-xs md:text-sm px-2 sm:px-4 md:px-5 py-1 sm:py-2 md:py-2.5 rounded-[5px] flex items-center gap-1 sm:gap-2 transition shadow-xs"
            >
              {slide.ctaSecondary.icon && (
                <slide.ctaSecondary.icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#008BC9] hidden xs:inline" />
              )}
              <span>{slide.ctaSecondary.text}</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Prev / Next Banner Navigation Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-2 rounded-[5px] bg-[#021630]/75 hover:bg-[#021630] text-white border border-ocean-800 transition backdrop-blur-xs"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-2 rounded-[5px] bg-[#021630]/75 hover:bg-[#021630] text-white border border-ocean-800 transition backdrop-blur-xs"
        aria-label="Next banner"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
      </button>

      {/* Carousel Dots */}
      <div className="absolute bottom-1.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentSlide(idx);
            }}
            aria-label={`Go to banner slide ${idx + 1}`}
            className={`h-1 sm:h-1.5 transition-all duration-300 rounded-[2px] ${
              currentSlide === idx
                ? 'w-5 sm:w-7 bg-[#E15E18]'
                : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
