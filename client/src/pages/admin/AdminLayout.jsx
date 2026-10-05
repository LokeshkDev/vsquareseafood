import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/admin.service';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import {
  LayoutDashboard,
  Fish,
  Tag,
  Boxes,
  ShoppingCart,
  SlidersHorizontal,
  Users,
  RefreshCw,
  ExternalLink,
  LogOut,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Database,
  Cloud,
  ShieldCheck,
  UtensilsCrossed,
  Flame,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Store Catalog & Menus',
    items: [
      {
        name: 'Raw Seafood Catalog',
        path: '/admin/products?dept=raw',
        icon: Fish,
        badge: 'Raw Fish',
        badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-400/30',
        match: (loc) => loc.pathname === '/admin/products' && (loc.search.includes('dept=raw') || (!loc.search.includes('dept=kitchen') && !loc.search.includes('dept=all'))),
      },
      {
        name: 'Cloud Kitchen Menu',
        path: '/admin/products?dept=kitchen',
        icon: UtensilsCrossed,
        badge: 'Hot Food',
        badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
        match: (loc) => loc.pathname === '/admin/products' && loc.search.includes('dept=kitchen'),
      },
      {
        name: 'All Products (Master)',
        path: '/admin/products?dept=all',
        icon: Boxes,
        match: (loc) => loc.pathname === '/admin/products' && loc.search.includes('dept=all'),
      },
      {
        name: 'Categories & Divisions',
        path: '/admin/categories',
        icon: Tag,
        match: (loc) => loc.pathname.startsWith('/admin/categories'),
      },
    ],
  },
  {
    title: 'Operations & Storefront',
    items: [
      { name: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes, match: (loc) => loc.pathname.startsWith('/admin/inventory') },
      { name: 'Orders & Sales', path: '/admin/orders', icon: ShoppingCart, match: (loc) => loc.pathname.startsWith('/admin/orders') },
      { name: 'CMS & Homepage', path: '/admin/cms', icon: SlidersHorizontal, match: (loc) => loc.pathname.startsWith('/admin/cms') },
      { name: 'Customers', path: '/admin/customers', icon: Users, match: (loc) => loc.pathname.startsWith('/admin/customers') },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [r2Status, setR2Status] = useState(null);

  useEffect(() => {
    let mounted = true;
    adminService.getR2Status()
      .then((res) => {
        if (mounted) setR2Status(res?.data || res);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSyncCatalog = async () => {
    if (!window.confirm(`Are you sure you want to synchronize all ${PRODUCTS.length} catalog products and ${CATEGORIES.length} categories into the live database?`)) {
      return;
    }
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await adminService.syncCatalog(PRODUCTS, CATEGORIES);
      setSyncResult({
        type: 'success',
        message: res.message || `Successfully synced ${PRODUCTS.length} products to database!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setSyncResult({
        type: 'error',
        message: err.message || 'Failed to sync catalog items with MySQL database.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Custom Theme Scrollbar Styles */}
      <style>{`
        .admin-theme-scrollbar::-webkit-scrollbar {
          width: 7px;
        }
        .admin-theme-scrollbar::-webkit-scrollbar-track {
          background: #021630;
        }
        .admin-theme-scrollbar::-webkit-scrollbar-thumb {
          background: #E15E18;
          border-radius: 4px;
        }
        .admin-theme-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d8511c;
        }
      `}</style>

      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-ocean-950 text-white px-4 py-3 flex items-center justify-between border-b border-ocean-900 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[5px] bg-[#E15E18] flex items-center justify-center font-black text-white text-base shadow-sm">
            V²
          </div>
          <div>
            <span className="font-black text-sm tracking-tight block leading-none">V² SEAFOOD</span>
            <span className="text-[10px] text-ocean-300 font-bold uppercase tracking-wider">Admin Operations</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[5px] text-slate-200 hover:text-white hover:bg-ocean-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-ocean-950 text-slate-200 z-40 flex flex-col justify-between border-r border-ocean-900 shadow-xl transition-all duration-250 ease-in-out ${
          isSidebarVisible ? 'md:w-72' : 'md:w-0 md:overflow-hidden md:border-none'
        } ${mobileMenuOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 px-5 border-b border-ocean-900/90 bg-ocean-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-gradient-to-br from-[#E15E18] to-amber-600 flex items-center justify-center font-black text-white text-xl shadow-md border border-white/20">
              V²
            </div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tight leading-tight">V² SEAFOOD</h2>
              <span className="text-[11px] font-bold text-sea-400 uppercase tracking-wider block">Admin Control Center</span>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarVisible(false)}
            className="hidden md:flex p-1.5 rounded-[5px] text-slate-400 hover:text-white hover:bg-ocean-900 transition-colors cursor-pointer"
            title="Hide Sidebar (Expand Workspace)"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Links Scroll Area (Styled Theme Scrollbar) */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-5 admin-theme-scrollbar">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-3 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-ocean-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.match
                  ? item.match(location)
                  : item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-[6px] text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#E15E18] text-white shadow-md font-extrabold'
                        : 'text-slate-200 hover:bg-ocean-900/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-sea-400'}`} />
                      <span className="truncate tracking-tight">{item.name}</span>
                    </div>
                    {item.badge ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black shrink-0 ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight className="w-4 h-4 text-white/90 shrink-0 stroke-[3]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User & Store Link */}
        <div className="p-3.5 border-t border-ocean-900/90 bg-ocean-900/40 space-y-2 shrink-0">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-ocean-900 rounded-[6px] transition-colors border border-ocean-800/60"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-sea-400" />
              <span>View Customer Storefront</span>
            </div>
            <span className="text-[10px] font-black bg-[#E15E18] text-white px-2 py-0.5 rounded-[3px]">
              Live
            </span>
          </Link>

          {/* Current Admin User Card */}
          <div className="flex items-center justify-between p-2.5 bg-ocean-900/70 rounded-[6px] border border-ocean-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-[5px] bg-[#E15E18] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-extrabold text-white truncate leading-tight">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Store Admin'}
                </p>
                <p className="text-[11px] font-medium text-ocean-300 truncate">
                  {user?.email || 'admin@vsquareseafood.com'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-ocean-950 rounded-[5px] transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/70 z-30 backdrop-blur-xs"
        />
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-x-hidden min-h-screen flex flex-col">
        
        {/* Top Control Bar (Sidebar Toggle & Quick Actions) */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            {!isSidebarVisible && (
              <button
                onClick={() => setIsSidebarVisible(true)}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-ocean-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-[5px] border border-slate-300 transition cursor-pointer"
                title="Show Sidebar Menu"
              >
                <PanelLeftOpen className="w-4 h-4 text-sea-600" />
                <span>Show Sidebar</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider hidden sm:inline">
                Admin Console
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-sm font-black text-slate-900 capitalize">
                {location.pathname === '/admin' ? 'Dashboard' : location.pathname.replace('/admin/', '').replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncCatalog}
              disabled={syncing}
              className="px-3.5 py-1.5 bg-sea-50 hover:bg-sea-100 text-sea-800 border border-sea-200 rounded-[5px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sea-600 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Catalog to DB'}</span>
            </button>
          </div>
        </header>

        {/* Sync Toast Notification */}
        {syncResult && (
          <div
            className={`m-4 p-4 rounded-[6px] border flex items-center justify-between text-sm font-bold shadow-sm ${
              syncResult.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {syncResult.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{syncResult.message}</span>
            </div>
            <button
              onClick={() => setSyncResult(null)}
              className="text-slate-400 hover:text-slate-700 text-sm px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Workspace Route Page Outlet */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
