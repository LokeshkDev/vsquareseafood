import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import ImageUploadField from '../../components/admin/ImageUploadField';
import {
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  X,
  Fish,
  UtensilsCrossed,
  Truck,
  MessageSquareQuote,
  LayoutGrid,
  Layers,
  ArrowUpDown,
  Cloud,
  Database,
  Key,
  Copy,
  Check,
  Server,
  Upload,
  ShieldCheck,
  Receipt,
} from 'lucide-react';

const PRESET_BANNERS = [
  {
    title: 'Kasimedu Morning Harbor Catch',
    subtitle: 'Fresh sea fish arriving daily at 4:30 AM. 0% chemicals, 100% seawater ice.',
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/shop',
  },
  {
    title: 'V² Cloud Kitchen Hot Meals',
    subtitle: 'Authentic Chennai fish curry, tawa fry & prawn biryani delivered hot.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/kitchen',
  },
  {
    title: 'Weekend Seafood Feast Box',
    subtitle: 'Save 20% on Jumbo Prawns, Vanjaram steaks & Crab combo boxes.',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '/shop?category=combos',
  },
];

const DEFAULT_SECTIONS = {
  // 1. Hero Carousel
  heroEnabled: true,

  // 2. Quick Category Scroller
  categoriesEnabled: true,
  categoriesTitle: 'Explore Fresh Categories',
  categoriesSubtitle: 'Daily Kasimedu harbor catch cleaned, trimmed & packed chilled',

  // 3. Today's Fresh Catch
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
  deliveryHeading: 'Delivered in 90 Minutes Across Chennai',
  deliveryBadge: 'V² Express Cold Chain',
  deliveryBannerImage: '',

  // 7. Testimonials Carousel
  testimonialsEnabled: true,
  testimonialsTitle: 'What Seafood Lovers Say About V² Seafood',
  testimonialsSubtitle: 'From daily Kasimedu morning harbor catches to grand wedding banquets, hear from our verified customers across Chennai.',

  // Delivery Partner Fee & Free Delivery Rules
  deliveryFeeEnabled: true,
  deliveryFeeRate: 49,
  deliveryFeeLabel: 'Delivery Partner Fee',
  freeDeliveryThreshold: 699,

  // Cold Chain & Vacuum Packaging Fee Rules
  packagingFeeEnabled: true,
  packagingFeeRate: 19,
  packagingFeeLabel: 'Cold Chain & Vacuum Packaging',
  packagingNoticeText: '0-4°C Cold Chain Packaging: Insulated pack with gel ice to preserve harbor freshness.',

  // Top Announcement Bar
  announcementActive: true,
  announcementText: '⚡ Kasimedu Harbor Catch Arrived at 4:30 AM — Delivered in 90 Mins across Chennai!',
};

export default function CMSManager() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'sections';
  const [activeTab, setActiveTab] = useState(
    ['sections', 'hero', 'delivery', 'storage'].includes(initialTab) ? initialTab : 'sections'
  );
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);

  // Cloudflare R2 & Storage State
  const [r2Status, setR2Status] = useState(null);
  const [loadingR2, setLoadingR2] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [testUploadResult, setTestUploadResult] = useState(null);
  const [testUploading, setTestUploading] = useState(false);
  const testFileInputRef = useRef(null);

  // Banner Modal State
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submittingBanner, setSubmittingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '/shop',
    placement: 'home_hero',
    sortOrder: 0,
    isActive: true,
  });

  // Homepage Sections CMS State (persisted in localStorage and synced live)
  const [sectionSettings, setSectionSettings] = useState(() => {
    const saved = localStorage.getItem('v2_cms_sections');
    if (saved) {
      try {
        return { ...DEFAULT_SECTIONS, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return DEFAULT_SECTIONS;
  });

  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await adminService.getAllBanners();
      setBanners(res.data || res || []);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchR2Status = async (refresh = false) => {
    setLoadingR2(true);
    try {
      const res = await adminService.getR2Status(refresh);
      setR2Status(res?.data || res);
      if (refresh) {
        setActionNotice({
          type: 'success',
          message: 'Refreshed Cloudflare R2 connection diagnostics live!',
        });
      }
    } catch (err) {
      console.error('Failed to get R2 status:', err);
    } finally {
      setLoadingR2(false);
    }
  };

  // Categories Visibility State
  const [cmsCategories, setCmsCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fetchCmsCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await adminService.getCategories(true);
      setCmsCategories(res.data || res || []);
    } catch (err) {
      console.error('Failed to load CMS categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchR2Status();
    fetchCmsCategories();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['sections', 'hero', 'delivery', 'storage'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTestUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setActionNotice({ type: 'error', message: 'Test file exceeds 10MB limit.' });
      return;
    }

    setTestUploading(true);
    setTestUploadResult(null);

    try {
      const result = await adminService.uploadImage(file, 'diagnostics');
      setTestUploadResult({
        success: true,
        ...result,
      });
      setActionNotice({
        type: 'success',
        message: `Test upload successful! Stored via ${result.storage || (result.url?.startsWith('/uploads/') ? 'LOCAL_DISK' : 'CLOUDFLARE_R2')}`,
      });
    } catch (err) {
      setTestUploadResult({
        success: false,
        error: err.message,
      });
      setActionNotice({
        type: 'error',
        message: err.message || 'Test upload failed.',
      });
    } finally {
      setTestUploading(false);
      if (testFileInputRef.current) {
        testFileInputRef.current.value = '';
      }
    }
  };

  const handleTestDelete = async () => {
    if (!testUploadResult?.url) return;
    try {
      await adminService.deleteImage(testUploadResult.url, testUploadResult.r2Key);
      setTestUploadResult(null);
      setActionNotice({
        type: 'success',
        message: 'Test file removed successfully from storage provider!',
      });
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to remove test file.',
      });
    }
  };

  const openCreateBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: 'Harbor Fresh Catch of the Day',
      subtitle: 'Order pristine sea fish directly from fishing harbor to doorstep.',
      imageUrl: PRESET_BANNERS[0].imageUrl,
      linkUrl: '/shop',
      placement: 'home_hero',
      sortOrder: banners.length + 1,
      isActive: true,
    });
    setBannerModalOpen(true);
  };

  const openEditBanner = (b) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      linkUrl: b.linkUrl || '/shop',
      placement: b.placement || 'home_hero',
      sortOrder: b.sortOrder ?? 0,
      isActive: Boolean(b.isActive),
    });
    setBannerModalOpen(true);
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBanner(true);
    setActionNotice(null);
    try {
      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, bannerForm);
        setActionNotice({ type: 'success', message: 'Hero banner slide updated in database!' });
      } else {
        await adminService.createBanner(bannerForm);
        setActionNotice({ type: 'success', message: 'New hero banner published to homepage!' });
      }
      setBannerModalOpen(false);
      fetchBanners();
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to save banner.' });
    } finally {
      setSubmittingBanner(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner slide from database?')) return;
    try {
      await adminService.deleteBanner(id);
      setActionNotice({ type: 'success', message: 'Banner slide deleted.' });
      fetchBanners();
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to delete banner.' });
    }
  };

  const handleSaveSections = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('v2_cms_sections', JSON.stringify(sectionSettings));
    window.dispatchEvent(new Event('v2_cms_updated'));
    setActionNotice({ type: 'success', message: 'Homepage section settings & visibility saved and live on storefront!' });
  };

  const toggleSection = (key) => {
    const updated = {
      ...sectionSettings,
      [key]: !sectionSettings[key],
    };
    setSectionSettings(updated);
    localStorage.setItem('v2_cms_sections', JSON.stringify(updated));
    window.dispatchEvent(new Event('v2_cms_updated'));
    setActionNotice({
      type: 'success',
      message: `Section visibility updated: ${updated[key] ? 'SHOWING on storefront' : 'HIDDEN from storefront'}`,
    });
  };

  // Section Definitions for Tab 1
  const HOMEPAGE_SECTIONS_LIST = [
    {
      id: 'hero',
      key: 'heroEnabled',
      num: 1,
      title: 'Hero Banner Carousel Slider',
      desc: 'Top animated banner slider with promotional graphics, CTAs, and headlines.',
      icon: ImageIcon,
      color: 'sky',
    },
    {
      id: 'categories',
      key: 'categoriesEnabled',
      num: 2,
      title: 'Quick Category Scroller & Department Nav',
      desc: 'Interactive horizontal scroller displaying Sea Fish, Prawns, Crabs, and Meals icons.',
      icon: Layers,
      color: 'blue',
      fields: [
        { label: 'Section Title', key: 'categoriesTitle' },
        { label: 'Subtitle Description', key: 'categoriesSubtitle' },
      ],
    },
    {
      id: 'freshCatch',
      key: 'freshCatchEnabled',
      num: 3,
      title: "Today's Fresh Harbor Catch Section",
      desc: 'Highlights today morning harbor landing notices with live product cards.',
      icon: Fish,
      color: 'emerald',
      fields: [
        { label: 'Section Title (English)', key: 'freshCatchTitle' },
        { label: 'Tamil Title', key: 'freshCatchTamil', isTamil: true },
        { label: 'Harbor Notice Subtitle', key: 'freshCatchSubtitle' },
        { label: 'Top Badge Tag', key: 'freshCatchBadge' },
      ],
    },
    {
      id: 'popularToday',
      key: 'popularEnabled',
      num: 4,
      title: 'Popular Today (Trending in Chennai)',
      desc: 'Carousel row of highest rated and bestseller seafood chosen by local customers.',
      icon: Sparkles,
      color: 'amber',
      fields: [
        { label: 'Section Title (English)', key: 'popularTitle' },
        { label: 'Tamil Title', key: 'popularTamil', isTamil: true },
        { label: 'Header Subtitle', key: 'popularSubtitle' },
      ],
    },
    {
      id: 'catalogGrid',
      key: 'catalogGridEnabled',
      num: 5,
      title: 'Main Fresh Seafood Catalog Grid',
      desc: 'Responsive 4-column master product showcase with filtering and full catalog link.',
      icon: LayoutGrid,
      color: 'indigo',
      fields: [
        { label: 'Section Title (English)', key: 'catalogGridTitle' },
        { label: 'Tamil Title', key: 'catalogGridTamil', isTamil: true },
        { label: 'Subtitle Tagline', key: 'catalogGridSubtitle' },
        { label: 'Display Count (Items to Show)', key: 'catalogGridLimit', isSelect: true, options: [4, 8, 12, 16] },
      ],
    },
    {
      id: 'deliveryBanner',
      key: 'deliveryBannerEnabled',
      num: 6,
      title: 'Delivery & Cold-Chain Information Banner',
      desc: 'Highlights 90-minute delivery across Chennai, chemical-free guarantee, and custom cleaning.',
      icon: Truck,
      color: 'teal',
      fields: [
        { label: 'Heading Text', key: 'deliveryHeading' },
        { label: 'Cold-Chain Badge', key: 'deliveryBadge' },
      ],
    },
    {
      id: 'testimonials',
      key: 'testimonialsEnabled',
      num: 7,
      title: 'Customer Reviews & Testimonials Carousel',
      desc: 'Corporate dark theme slider showcasing genuine 5-star customer feedback from Chennai.',
      icon: MessageSquareQuote,
      color: 'purple',
      fields: [
        { label: 'Section Title', key: 'testimonialsTitle' },
        { label: 'Subtitle Description', key: 'testimonialsSubtitle' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[5px] bg-ocean-100 text-ocean-900">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Homepage CMS Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Toggle section visibility (Hide/Show), configure titles & subtitles, and manage banner images.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {r2Status && (
            <div
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1.5 rounded-[5px] border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                r2Status.connected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
              title="Click to manage Cloudflare R2 Object Storage"
            >
              <Cloud className={`w-4 h-4 ${r2Status.connected ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      r2Status.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{r2Status.connected ? 'Cloudflare R2 Active' : 'R2 Standby (Local Disk)'}</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">
                  {r2Status.connected ? `Bucket: ${r2Status.bucketName}` : 'Uploads saved to /uploads'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSaveSections}
            style={{ backgroundColor: '#E15E18' }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] shadow-card transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            Save All CMS Settings
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-[5px] border flex items-center justify-between text-xs font-medium ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sections')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sections'
              ? 'border-[#E15E18] text-[#E15E18]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Homepage Sections & Visibility ({HOMEPAGE_SECTIONS_LIST.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'hero'
              ? 'border-[#E15E18] text-[#E15E18]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Banners Carousel ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'delivery'
              ? 'border-[#E15E18] text-[#E15E18]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery, Packaging & Cart Charges</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'storage'
              ? 'border-[#E15E18] text-[#E15E18]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Cloudflare R2 & Media Storage</span>
          {r2Status?.connected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: ALL HOMEPAGE SECTIONS WITH HIDE / SHOW TOGGLE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'sections' && (
        <form onSubmit={handleSaveSections} className="space-y-5">
          <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-[5px] text-xs text-sky-900 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-bold">✨ Live Homepage Section Controller:</span> Toggling any section ON or OFF immediately updates the customer storefront.
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-sky-800 hover:text-sky-950 underline text-[11px]"
            >
              <span>Preview Live Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-4">
            {HOMEPAGE_SECTIONS_LIST.map((sec) => {
              const isEnabled = Boolean(sectionSettings[sec.key]);
              const Icon = sec.icon;

              return (
                <div
                  key={sec.id}
                  className={`bg-white rounded-[5px] border transition-all shadow-subtle overflow-hidden ${
                    isEnabled ? 'border-slate-200' : 'border-slate-200 bg-slate-50/50 opacity-75'
                  }`}
                >
                  {/* Section Top Header & Toggle Bar */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-[5px] bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {sec.num}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-sm tracking-tight">{sec.title}</h3>
                          {isEnabled ? (
                            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              VISIBLE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-black bg-slate-200 text-slate-600 border border-slate-300">
                              HIDDEN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sec.desc}</p>
                      </div>
                    </div>

                    {/* Instant Hide / Show Switch Button */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.key)}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          isEnabled
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-300 hover:bg-slate-400 text-slate-800'
                        }`}
                      >
                        {isEnabled ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Section Visible (Click to Hide)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Section Hidden (Click to Show)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Section Configurable Fields (Only if enabled) */}
                  {sec.fields && (
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {sec.fields.map((f, fIdx) => (
                          <div key={fIdx} className={f.isSelect ? 'sm:col-span-1' : ''}>
                            <label className="block font-bold text-slate-700 mb-1">{f.label}</label>
                            {f.isSelect ? (
                              <select
                                value={sectionSettings[f.key] || 8}
                                onChange={(e) =>
                                  setSectionSettings({ ...sectionSettings, [f.key]: Number(e.target.value) })
                                }
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs"
                              >
                                {f.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt} Products on Homepage
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={sectionSettings[f.key] || ''}
                                onChange={(e) =>
                                  setSectionSettings({ ...sectionSettings, [f.key]: e.target.value })
                                }
                                className={`w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs ${
                                  f.isTamil ? 'font-tamil' : ''
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Show / Hide Controller for Quick Category Scroller */}
                  {sec.id === 'categories' && (
                    <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <span>📂 All Category Divisions Visibility (Raw Seafood 🐟 & Cloud Kitchen 🍳)</span>
                            <span className="text-[10px] font-normal text-slate-500 normal-case">
                              ({cmsCategories.length} categories found in database)
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Click the toggle button on any category (Raw or Cloud Kitchen) to instantly show or hide it from customer scrollers and department grids.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={fetchCmsCategories}
                          className="text-xs font-bold text-ocean-700 hover:text-ocean-900 flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingCategories ? 'animate-spin' : ''}`} />
                          <span>Refresh List</span>
                        </button>
                      </div>

                      {loadingCategories ? (
                        <div className="p-4 text-center text-xs text-slate-400">Loading categories from database...</div>
                      ) : cmsCategories.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">No categories found in database.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                          {cmsCategories.map((c) => {
                            const isCatActive = Boolean(c.isActive);
                            const slug = (c.slug || c.id || '').toLowerCase();
                            const isKitchen = slug.startsWith('kitchen-') || slug === 'cloud-kitchen' || c.department === 'kitchen';

                            return (
                              <div
                                key={c.id || c.slug}
                                className={`p-3 rounded-[5px] border transition-all flex items-center justify-between gap-2.5 ${
                                  isCatActive
                                    ? 'bg-white border-slate-200 shadow-xs'
                                    : 'bg-slate-100/80 border-slate-200 opacity-80'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {c.image ? (
                                    <img
                                      src={c.image}
                                      alt={c.name}
                                      className="w-9 h-9 rounded-[4px] object-cover border border-slate-200 shrink-0 bg-white"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className={`w-9 h-9 rounded-[4px] flex items-center justify-center font-bold text-xs shrink-0 border ${
                                        isKitchen
                                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                                          : 'bg-sky-100 text-sky-900 border-sky-300'
                                      }`}
                                    >
                                      {isKitchen ? '🍳' : '🐟'}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="font-bold text-xs text-slate-900 truncate">{c.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span
                                        className={`text-[9px] font-extrabold px-1 py-0.2 rounded-[3px] border ${
                                          isKitchen
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : 'bg-sky-50 text-sky-800 border-sky-200'
                                        }`}
                                      >
                                        {isKitchen ? 'Kitchen' : 'Raw'}
                                      </span>
                                      <span className="text-[10px] text-slate-500 truncate font-tamil">
                                        {c.tamilName || `/${c.slug}`}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await adminService.updateCategory(c.id || c.slug, { isActive: !isCatActive });
                                      setCmsCategories((prev) =>
                                        prev.map((item) => (item.id === c.id ? { ...item, isActive: !isCatActive } : item))
                                      );
                                      window.dispatchEvent(new Event('v2_cms_updated'));
                                      setActionNotice({
                                        type: 'success',
                                        message: `Category "${c.name}" is now ${!isCatActive ? 'VISIBLE' : 'HIDDEN'} on store!`,
                                      });
                                    } catch (err) {
                                      setActionNotice({
                                        type: 'error',
                                        message: err.message || 'Failed to update category visibility.',
                                      });
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-[4px] text-[10px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                                    isCatActive
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  }`}
                                >
                                  {isCatActive ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Visible (Click to Hide)</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Hidden (Click to Show)</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Special Link for Hero Section */}
                  {sec.id === 'hero' && (
                    <div className="p-4 sm:p-5 bg-slate-50/50 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Contains {banners.length} active slides with image upload/replace/delete controls.
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('hero')}
                        className="font-bold text-ocean-700 hover:text-ocean-900 underline cursor-pointer"
                      >
                        Manage Slides & Upload Images →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky or Bottom Save Bar */}
          <div className="p-4 bg-white rounded-[5px] border border-slate-200 shadow-subtle flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Click save to sync all heading changes and section visibility to the live storefront.
            </span>
            <button
              type="submit"
              style={{ backgroundColor: '#E15E18' }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Section Settings
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: HERO CAROUSEL BANNERS (WITH IMAGE UPLOAD / REPLACE / DELETE) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-[5px] border border-slate-200 shadow-subtle">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Hero Carousel Slides</h3>
              <p className="text-[11px] text-slate-500">
                Large animated banner images displayed at the top of the homepage.
              </p>
            </div>
            <button
              onClick={openCreateBanner}
              style={{ backgroundColor: '#E15E18' }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Banner Slide
            </button>
          </div>

          <div className="bg-white rounded-[5px] border border-slate-200 shadow-subtle overflow-hidden">
            {loadingBanners ? (
              <div className="p-12 text-center text-slate-400 text-xs">Loading banners...</div>
            ) : banners.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No hero banners configured yet. Add your first slide above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-4">Banner Preview</th>
                      <th className="py-3 px-3">Title & Subtitle</th>
                      <th className="py-3 px-3">Click Target URL</th>
                      <th className="py-3 px-3">Sort Order</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {banners.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="w-28 h-14 object-cover rounded-[5px] border border-slate-200 bg-slate-100"
                            onError={(e) => {
                              e.currentTarget.src = PRESET_BANNERS[0].imageUrl;
                            }}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{b.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{b.subtitle}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{b.linkUrl}</td>
                        <td className="py-3 px-3 text-slate-600 font-semibold">#{b.sortOrder}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${
                              b.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {b.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditBanner(b)}
                              className="p-1.5 text-slate-600 hover:text-ocean-700 hover:bg-ocean-50 rounded-[4px] cursor-pointer"
                              title="Edit Banner"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(b.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px] cursor-pointer"
                              title="Delete Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 3: DELIVERY, PACKAGING & CART CHARGES */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'delivery' && (
        <form onSubmit={handleSaveSections} className="space-y-6">

          {/* 1. Delivery Partner Fee & Free Delivery Threshold */}
          <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[5px] bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Delivery Partner Fee Settings</h3>
                  <p className="text-[11px] text-slate-500">Configure standard customer delivery charge and free delivery threshold</p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-[5px] border border-slate-200">
                <input
                  type="checkbox"
                  checked={sectionSettings.deliveryFeeEnabled !== false}
                  onChange={(e) =>
                    setSectionSettings({ ...sectionSettings, deliveryFeeEnabled: e.target.checked })
                  }
                  className="rounded text-ocean-600 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  {sectionSettings.deliveryFeeEnabled !== false ? 'Enable Delivery Fee' : 'Disable Delivery Fee (FREE Delivery for All)'}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase ${
                  sectionSettings.deliveryFeeEnabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {sectionSettings.deliveryFeeEnabled !== false ? 'Charging Active' : 'Free for All'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Standard Delivery Fee Rate (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={sectionSettings.deliveryFeeEnabled === false}
                    value={sectionSettings.deliveryFeeRate !== undefined ? sectionSettings.deliveryFeeRate : 49}
                    onChange={(e) =>
                      setSectionSettings({
                        ...sectionSettings,
                        deliveryFeeRate: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Charged on orders below minimum threshold (e.g. ₹49)</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Free Delivery Minimum Order Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    disabled={sectionSettings.deliveryFeeEnabled === false}
                    value={sectionSettings.freeDeliveryThreshold !== undefined ? sectionSettings.freeDeliveryThreshold : 699}
                    onChange={(e) =>
                      setSectionSettings({
                        ...sectionSettings,
                        freeDeliveryThreshold: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Orders reaching this amount get 100% Free Delivery (e.g. ₹699)</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cart Bill Display Label</label>
                <input
                  type="text"
                  value={sectionSettings.deliveryFeeLabel || 'Delivery Partner Fee'}
                  onChange={(e) =>
                    setSectionSettings({ ...sectionSettings, deliveryFeeLabel: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Label shown on cart drawer and checkout bill summary</p>
              </div>
            </div>
          </div>

          {/* 2. Cold Chain & Vacuum Packaging Cost */}
          <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Cold Chain & Vacuum Packaging Cost Settings</h3>
                  <p className="text-[11px] text-slate-500">Manage temperature-controlled EPS boxes, ice gel packs & clean packaging charges</p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-[5px] border border-slate-200">
                <input
                  type="checkbox"
                  checked={sectionSettings.packagingFeeEnabled !== false}
                  onChange={(e) =>
                    setSectionSettings({ ...sectionSettings, packagingFeeEnabled: e.target.checked })
                  }
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  {sectionSettings.packagingFeeEnabled !== false ? 'Enable Packaging Fee' : 'Disable Packaging Fee (Not Charged / Free)'}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase ${
                  sectionSettings.packagingFeeEnabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {sectionSettings.packagingFeeEnabled !== false ? 'Active (₹' + (sectionSettings.packagingFeeRate ?? 19) + ')' : 'Disabled (₹0)'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Packaging Fee Rate (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={sectionSettings.packagingFeeEnabled === false}
                    value={sectionSettings.packagingFeeRate !== undefined ? sectionSettings.packagingFeeRate : 19}
                    onChange={(e) =>
                      setSectionSettings({
                        ...sectionSettings,
                        packagingFeeRate: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Covers dry ice sheets, insulated box and sanitized vacuum sealing (e.g. ₹19)</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cart Bill Display Label</label>
                <input
                  type="text"
                  value={sectionSettings.packagingFeeLabel || 'Cold Chain & Vacuum Packaging'}
                  onChange={(e) =>
                    setSectionSettings({ ...sectionSettings, packagingFeeLabel: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Exact title displayed to customer on the cart breakdown</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Packaging Hygiene Guarantee Notice</label>
                <input
                  type="text"
                  value={sectionSettings.packagingNoticeText || '0-4°C Cold Chain Packaging: Insulated pack with gel ice to preserve harbor freshness.'}
                  onChange={(e) =>
                    setSectionSettings({ ...sectionSettings, packagingNoticeText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Displayed with green shield badge inside the cart drawer below items</p>
              </div>
            </div>
          </div>

          {/* 3. Live Customer Bill Breakdown Simulator */}
          <div className="bg-slate-50 p-5 rounded-[5px] border border-dashed border-slate-300 space-y-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-ocean-700" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-ocean-900">
                Live Storefront Cart Bill Preview (Simulation)
              </h4>
            </div>
            <p className="text-[11px] text-slate-500">
              Here is how customer order bills will compute and appear on the cart drawer based on your current settings above:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Scenario 1: Below Free Delivery Threshold (Sample order ₹450) */}
              <div className="bg-white p-4 rounded-[5px] border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">Scenario A: Order under threshold</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Sample Cart: ₹450</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Item Total</span>
                    <span className="font-semibold text-slate-900">₹450</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{sectionSettings.deliveryFeeLabel || 'Delivery Partner Fee'}</span>
                    <span>
                      {sectionSettings.deliveryFeeEnabled === false ? (
                        <span className="text-slate-400 italic font-medium">Hidden (Disabled)</span>
                      ) : (
                        <span className="font-bold text-slate-800">₹{sectionSettings.deliveryFeeRate ?? 49}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{sectionSettings.packagingFeeLabel || 'Cold Chain & Vacuum Packaging'}</span>
                    <span>
                      {sectionSettings.packagingFeeEnabled === false ? (
                        <span className="text-slate-400 italic font-medium">Hidden (Disabled)</span>
                      ) : (
                        <span className="font-bold text-slate-800">₹{sectionSettings.packagingFeeRate ?? 19}</span>
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-ocean-900 text-sm">
                    <span>Grand Total</span>
                    <span>
                      ₹{
                        450 +
                        (sectionSettings.deliveryFeeEnabled === false ? 0 : Number(sectionSettings.deliveryFeeRate ?? 49)) +
                        (sectionSettings.packagingFeeEnabled === false ? 0 : Number(sectionSettings.packagingFeeRate ?? 19))
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenario 2: Above Free Delivery Threshold (Sample order ₹750) */}
              <div className="bg-white p-4 rounded-[5px] border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">Scenario B: Order qualifying for Free Delivery</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">Sample Cart: ₹750</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Item Total</span>
                    <span className="font-semibold text-slate-900">₹750</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{sectionSettings.deliveryFeeLabel || 'Delivery Partner Fee'}</span>
                    <span className="text-emerald-600 font-bold">
                      FREE (Orders ≥ ₹{sectionSettings.freeDeliveryThreshold ?? 699})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{sectionSettings.packagingFeeLabel || 'Cold Chain & Vacuum Packaging'}</span>
                    <span>
                      {sectionSettings.packagingFeeEnabled === false ? (
                        <span className="text-emerald-600 font-bold">FREE (Disabled)</span>
                      ) : (
                        <span className="font-bold text-slate-800">₹{sectionSettings.packagingFeeRate ?? 19}</span>
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-ocean-900 text-sm">
                    <span>Grand Total</span>
                    <span>
                      ₹{
                        750 +
                        0 +
                        (sectionSettings.packagingFeeEnabled === false ? 0 : Number(sectionSettings.packagingFeeRate ?? 19))
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Top Announcement Notice Bar */}
          <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Top Announcement Notice Bar</h3>
                <p className="text-[11px] text-slate-500">Pinned at the very top of all customer pages</p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sectionSettings.announcementActive}
                  onChange={(e) =>
                    setSectionSettings({ ...sectionSettings, announcementActive: e.target.checked })
                  }
                  className="rounded text-ocean-600"
                />
                <span className="text-xs font-bold text-slate-700">Display Bar</span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Text</label>
                <input
                  type="text"
                  value={sectionSettings.announcementText}
                  onChange={(e) =>
                    setSectionSettings({ ...sectionSettings, announcementText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* 5. Delivery Section Image / Promo Graphic */}
          <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">Delivery Promo Graphic (Optional)</h3>
              <p className="text-[11px] text-slate-500">Custom promotional image or banner for delivery cold chain</p>
            </div>

            <ImageUploadField
              value={sectionSettings.deliveryBannerImage || ''}
              onChange={(newUrl) => setSectionSettings({ ...sectionSettings, deliveryBannerImage: newUrl })}
              folder="delivery"
              recommendedDimensions="1200 × 400 px (3:1 Wide Banner)"
              label="Delivery Banner Graphic"
              aspectRatio="banner"
              helpText="Upload a promotional delivery graphic (Auto-compressed to ~100KB WebP)"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              style={{ backgroundColor: '#E15E18' }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Delivery & Packaging Settings
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 4: CLOUDFLARE R2 OBJECT STORAGE & MEDIA MANAGEMENT */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* Top Status Banner */}
          <div
            className={`p-5 rounded-[5px] border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              r2Status?.connected
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-amber-50/80 border-amber-300'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-[5px] shrink-0 ${
                  r2Status?.connected ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900">
                    {r2Status?.connected
                      ? 'Cloudflare R2 Object Storage: Connected & Active'
                      : 'Media Storage Mode: Local Disk Fallback Active (R2 Standby)'}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r2Status?.connected
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        r2Status?.connected ? 'bg-emerald-700 animate-pulse' : 'bg-amber-700'
                      }`}
                    />
                    {r2Status?.storage || (r2Status?.connected ? 'CLOUDFLARE_R2' : 'LOCAL_DISK')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {r2Status?.message ||
                    (r2Status?.connected
                      ? 'High-speed edge media delivery is enabled. All product photos, category cards, and CMS banners are uploaded directly to your Cloudflare R2 bucket with 0ms egress fees.'
                      : 'All image upload, replacement, and deletion features are 100% operational using the server public uploads directory (/uploads). Once you provide your Cloudflare R2 credentials in server/.env, direct bucket uploads will automatically activate.')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchR2Status(true)}
              disabled={loadingR2}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-[5px] shadow-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingR2 ? 'animate-spin' : ''}`} />
              <span>{loadingR2 ? 'Testing Connection...' : 'Test / Ping R2 Status'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Live Connection Diagnostics */}
            <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-ocean-700" />
                  <h4 className="font-black text-slate-900 text-sm">R2 Bucket Diagnostics</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">AWS S3 Compatible API</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="font-bold text-slate-600">Storage Engine</span>
                  <span className="font-mono font-bold text-slate-900">
                    {r2Status?.storage === 'CLOUDFLARE_R2' ? 'Cloudflare R2 Bucket' : 'Express Local Disk (/uploads)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="font-bold text-slate-600">Bucket Name</span>
                  <span className="font-mono font-bold text-ocean-800 bg-ocean-50 px-2 py-0.5 rounded-[3px]">
                    {r2Status?.details?.bucketName || r2Status?.bucketName || 'vsquare-seafood'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="font-bold text-slate-600">Account ID</span>
                  <span className="font-mono text-slate-700">
                    {r2Status?.details?.hasAccountId || r2Status?.details?.accountId
                      ? (r2Status?.details?.accountId || 'Configured (Set)')
                      : '<Not Configured>'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="font-bold text-slate-600">Access Key & Secret</span>
                  <span className="font-mono">
                    {r2Status?.details?.hasAccessKeyId && r2Status?.details?.hasSecretAccessKey ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-[3px] border border-emerald-200">
                        Present & Ready
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-[3px] border border-amber-200">
                        Pending in server/.env
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="font-bold text-slate-600">Public CDN Base URL</span>
                  <span className="font-mono text-slate-700 text-[11px] truncate max-w-[200px]" title={r2Status?.publicBaseUrl || 'Default R2 URL'}>
                    {r2Status?.publicBaseUrl || (r2Status?.details?.publicBaseUrl ? r2Status.details.publicBaseUrl : 'Auto Cloudflare Domain')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="font-bold text-slate-600">Upload, Replace, Delete Status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    100% Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Real-Time Interactive Upload & Delete Test */}
            <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#E15E18]" />
                  <h4 className="font-black text-slate-900 text-sm">Interactive Live Upload Test</h4>
                </div>
                <span className="text-[10px] text-slate-400">Verifies End-to-End Upload Flow</span>
              </div>

              <p className="text-xs text-slate-500">
                Choose any sample image from your computer to test the live upload, file hashing, and deletion pipeline.
              </p>

              <input
                type="file"
                ref={testFileInputRef}
                onChange={handleTestUpload}
                accept="image/png, image/jpeg, image/webp, image/avif, image/gif"
                className="hidden"
              />

              {!testUploadResult ? (
                <div
                  onClick={() => testFileInputRef.current && testFileInputRef.current.click()}
                  className={`p-6 border-2 border-dashed border-slate-300 hover:border-ocean-500 bg-slate-50 hover:bg-ocean-50/30 rounded-[5px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    testUploading ? 'pointer-events-none opacity-60' : ''
                  }`}
                >
                  {testUploading ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin text-ocean-600 mb-2" />
                      <span className="text-xs font-bold text-ocean-900">Uploading Test Image...</span>
                      <span className="text-[10px] text-slate-400">Communicating with storage endpoint</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 bg-white rounded-full border border-slate-200 shadow-xs mb-2 text-ocean-700">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Click to Upload Live Test Image</span>
                      <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP (Max 10MB)</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[5px] space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={testUploadResult.url}
                      alt="Uploaded test"
                      className="w-16 h-16 object-cover rounded-[4px] border border-slate-200 bg-white"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 truncate max-w-[150px]">{testUploadResult.filename}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] border ${
                            testUploadResult.storage === 'CLOUDFLARE_R2'
                              ? 'bg-sky-100 text-sky-800 border-sky-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {testUploadResult.storage === 'CLOUDFLARE_R2' ? 'Cloudflare R2' : 'Local Disk (/uploads)'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5 max-w-xs">
                        {testUploadResult.url}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>Size: <strong className="text-emerald-700 font-bold">{Math.round((testUploadResult.size || testUploadResult.compressedSize || 0) / 1024)} KB</strong></span>
                        <span>· Format: <strong>{testUploadResult.mimetype || 'image/webp'}</strong></span>
                        {testUploadResult.savingsPercent ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] border border-emerald-300">
                            ⚡ {testUploadResult.savingsPercent}% Compressed
                          </span>
                        ) : null}
                      </div>
                      {testUploadResult.optimizationNote && (
                        <div className="text-[10px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          ✨ {testUploadResult.optimizationNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <a
                      href={testUploadResult.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-ocean-700 hover:text-ocean-900 underline"
                    >
                      <span>View in New Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => testFileInputRef.current && testFileInputRef.current.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-ocean-700 bg-white hover:bg-ocean-50 border border-ocean-200 rounded-[4px] cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTestDelete}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-[4px] cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Test File</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Box 3: .env Setup Guide & Documentation */}
          <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-ocean-700" />
                <h4 className="font-black text-slate-900 text-sm">
                  How to Point Cloudflare R2 Credentials in server/.env
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  const snippet = `# ─── Cloudflare R2 Object Storage ───
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=vsquare-seafood
R2_ENDPOINT=
R2_PUBLIC_BASE_URL=`;
                  navigator.clipboard.writeText(snippet);
                  setCopiedEnv(true);
                  setTimeout(() => setCopiedEnv(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ocean-800 bg-ocean-50 hover:bg-ocean-100 border border-ocean-200 rounded-[4px] transition-colors cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? 'Copied to Clipboard!' : 'Copy .env Template'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800">Step-by-step Cloudflare Setup:</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                  <li>
                    Log in to your <strong>Cloudflare Dashboard</strong> and select <strong>R2</strong> from the left sidebar.
                  </li>
                  <li>
                    Create a bucket named <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">vsquare-seafood</code> (or match your preferred name).
                  </li>
                  <li>
                    Click <strong>Manage R2 API Tokens</strong> &rarr; <strong>Create API Token</strong> with <em>Admin Read & Write</em> permissions.
                  </li>
                  <li>
                    Copy the <strong>Access Key ID</strong>, <strong>Secret Access Key</strong>, and your 32-character <strong>Account ID</strong>.
                  </li>
                  <li>
                    In your R2 bucket settings, enable <strong>R2.dev subdomain</strong> or connect your Custom Domain (e.g. <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">media.vsquareseafood.com</code>) for public browser access.
                  </li>
                  <li>
                    Paste these values into <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">server/.env</code> and click &quot;Test / Ping R2 Status&quot; above!
                  </li>
                </ol>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-[5px] font-mono text-[11px] overflow-x-auto space-y-1 border border-slate-800">
                <div className="text-slate-400 pb-1"># File: server/.env (Lines 30-36)</div>
                <div className="text-sky-300">R2_ACCOUNT_ID=<span className="text-amber-300">&lt;your_cloudflare_account_id&gt;</span></div>
                <div className="text-sky-300">R2_ACCESS_KEY_ID=<span className="text-amber-300">&lt;your_r2_access_key_id&gt;</span></div>
                <div className="text-sky-300">R2_SECRET_ACCESS_KEY=<span className="text-amber-300">&lt;your_r2_secret_access_key&gt;</span></div>
                <div className="text-sky-300">R2_BUCKET_NAME=<span className="text-emerald-400">vsquare-seafood</span></div>
                <div className="text-sky-300">R2_ENDPOINT=<span className="text-slate-400">https://&lt;ACCOUNT_ID&gt;.r2.cloudflarestorage.com</span></div>
                <div className="text-sky-300">R2_PUBLIC_BASE_URL=<span className="text-amber-300">https://pub-xxxxxx.r2.dev</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BANNER ADD / EDIT MODAL WITH IMAGE UPLOAD, REPLACE, DELETE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[5px] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-black text-slate-900">
                {editingBanner ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}
              </h3>
              <button
                onClick={() => setBannerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[4px] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Headline Title *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. Kasimedu Morning Harbor Catch"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Promotion Text</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="e.g. Fresh sea fish arriving daily at 4:30 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white"
                />
              </div>

              {/* Banner Image with Upload, Replace, Delete */}
              <ImageUploadField
                value={bannerForm.imageUrl}
                onChange={(newUrl) => setBannerForm({ ...bannerForm, imageUrl: newUrl })}
                presets={PRESET_BANNERS.map((b) => ({ name: b.title, url: b.imageUrl }))}
                folder="banners"
                recommendedDimensions="1920 × 1080 px (16:9 Widescreen)"
                label="Slide Banner Image *"
                required
                aspectRatio="banner"
                helpText="High-resolution widescreen banner (Auto-resized & compressed to ~150KB WebP)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Click Destination URL</label>
                  <input
                    type="text"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    placeholder="/shop"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={bannerForm.sortOrder}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, sortOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerForm.isActive}
                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                    className="rounded text-ocean-600"
                  />
                  <span className="font-bold text-slate-700">Slide Active & Visible on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-[5px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBanner}
                  style={{ backgroundColor: '#E15E18' }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] transition-all disabled:opacity-60 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingBanner
                    ? 'Saving...'
                    : editingBanner
                    ? 'Save Banner Changes'
                    : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
