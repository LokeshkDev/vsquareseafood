import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import CategoryScroller from '../components/CategoryScroller';
import FreshCatchSection from '../components/FreshCatchSection';
import PopularTodaySection from '../components/PopularTodaySection';
import DeliveryInfoBanner from '../components/DeliveryInfoBanner';
import TestimonialCarousel from '../components/TestimonialCarousel';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/product.service';
import { Link } from 'react-router-dom';
import { Fish, ArrowRight } from 'lucide-react';

const DEFAULT_CMS_SETTINGS = {
  // 1. Hero Carousel
  heroEnabled: true,
  // 2. Category Scroller
  categoriesEnabled: true,
  categoriesTitle: 'Explore Fresh Categories',
  categoriesSubtitle: 'Daily Kasimedu harbor catch cleaned, trimmed & packed chilled',
  // 3. Fresh Catch
  freshCatchEnabled: true,
  freshCatchTitle: "Today's Fresh Catch",
  freshCatchTamil: 'இன்றைய வரத்து',
  freshCatchSubtitle: 'Directly sourced from Chennai & Tuticorin boats this morning',
  freshCatchBadge: 'Harbor Sourcing Notice',
  // 4. Popular Today
  popularEnabled: true,
  popularTitle: 'Popular Today',
  popularTamil: 'அதிகம் விரும்பி வாங்கியவை',
  popularSubtitle: 'Trending in Chennai',
  // 5. Fresh Seafood Catalog Grid
  catalogGridEnabled: true,
  catalogGridTitle: 'Fresh Seafood Catalog',
  catalogGridTamil: 'கடல் மீன் வகைகள்',
  catalogGridSubtitle: 'Daily Sourced Raw Fish',
  catalogGridLimit: 8,
  // 6. Delivery Highlights Banner
  deliveryBannerEnabled: true,
  // 7. Testimonials Carousel
  testimonialsEnabled: true,
  testimonialsTitle: 'What Seafood Lovers Say About V² Seafood',
  testimonialsSubtitle: 'From daily Kasimedu morning harbor catches to grand wedding banquets, hear from our verified customers across Chennai.',
};

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [cmsSettings, setCmsSettings] = useState(() => {
    const saved = localStorage.getItem('v2_cms_sections');
    if (saved) {
      try {
        return { ...DEFAULT_CMS_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return DEFAULT_CMS_SETTINGS;
  });

  const fetchProducts = () => {
    productService.getProducts({ limit: 100 })
      .then((res) => {
        const items = res?.data || res?.products || res || [];
        setAllProducts(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error('Failed to load products in Home:', err);
      });
  };

  // Listen to live CMS updates and product mutations from admin panel in real-time
  useEffect(() => {
    fetchProducts();

    const handleCmsUpdate = () => {
      const saved = localStorage.getItem('v2_cms_sections');
      if (saved) {
        try {
          setCmsSettings({ ...DEFAULT_CMS_SETTINGS, ...JSON.parse(saved) });
        } catch (e) {}
      }
      fetchProducts();
    };

    window.addEventListener('storage', handleCmsUpdate);
    window.addEventListener('v2_cms_updated', handleCmsUpdate);
    return () => {
      window.removeEventListener('storage', handleCmsUpdate);
      window.removeEventListener('v2_cms_updated', handleCmsUpdate);
    };
  }, []);

  // Sliced raw fish products for the main catalog section based on CMS limit
  const limit = Number(cmsSettings.catalogGridLimit) || 8;
  const rawProducts = allProducts.filter(p => (p.type || '').toLowerCase() === 'raw');
  const featuredRaw = rawProducts.filter(p => Boolean(p.isFeatured));
  const freshFishProducts = (featuredRaw.length > 0 ? featuredRaw : rawProducts).slice(0, limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Carousel Banner Slider */}
      {cmsSettings.heroEnabled && <Hero />}

      {/* 2. Quick Category Scroller Section */}
      {cmsSettings.categoriesEnabled && (
        <CategoryScroller
          title={cmsSettings.categoriesTitle}
          subtitle={cmsSettings.categoriesSubtitle}
        />
      )}

      {/* 3. Today's Fresh Catch Section */}
      {cmsSettings.freshCatchEnabled && (
        <FreshCatchSection
          products={allProducts}
          title={cmsSettings.freshCatchTitle}
          tamil={cmsSettings.freshCatchTamil}
          subtitle={cmsSettings.freshCatchSubtitle}
          badge={cmsSettings.freshCatchBadge}
        />
      )}

      {/* 4. Popular Today Horizontal Scroller */}
      {cmsSettings.popularEnabled && (
        <PopularTodaySection
          products={allProducts}
          title={cmsSettings.popularTitle}
          tamil={cmsSettings.popularTamil}
          subtitle={cmsSettings.popularSubtitle}
        />
      )}

      {/* 5. Main Fresh Seafood Product Grid Section */}
      {cmsSettings.catalogGridEnabled && (
        <section className="py-6 sm:py-10 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-ocean-800 uppercase tracking-wider mb-1">
                  <Fish className="w-3.5 h-3.5 text-sea-600" />
                  <span>{cmsSettings.catalogGridSubtitle || 'Daily Sourced Raw Fish'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {cmsSettings.catalogGridTitle || 'Fresh Seafood Catalog'}
                  </h2>
                  {cmsSettings.catalogGridTamil && (
                    <span className="text-sm font-semibold text-ocean-700 font-tamil">
                      ({cmsSettings.catalogGridTamil})
                    </span>
                  )}
                </div>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-xs font-bold text-sea-600 hover:text-sea-700 transition"
              >
                <span>Explore All Fresh Seafood ({rawProducts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4-col desktop, 3-col tablet, 2-col mobile grid */}
            {freshFishProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {freshFishProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[5px]">
                <Fish className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Fresh catch arriving soon today</p>
                <p className="text-xs text-slate-400 mt-1">Directly from Kasimedu harbor</p>
              </div>
            )}

            {rawProducts.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  to="/shop"
                  className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-[5px] border border-slate-200 transition"
                >
                  View Complete Seafood Catalog ({rawProducts.length} Varieties) →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. Delivery & Cold-Chain Information Highlights */}
      {cmsSettings.deliveryBannerEnabled && <DeliveryInfoBanner />}

      {/* 7. Corporate Dark Theme Testimonial Slider Carousel */}
      {cmsSettings.testimonialsEnabled && (
        <TestimonialCarousel
          title={cmsSettings.testimonialsTitle}
          subtitle={cmsSettings.testimonialsSubtitle}
        />
      )}
    </div>
  );
}
