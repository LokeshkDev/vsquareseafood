import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import StickyMobileCartBar from './components/StickyMobileCartBar';
import CartDrawer from './components/CartDrawer';
import CleaningCutModal from './components/CleaningCutModal';
import LocationModal from './components/LocationModal';
import PageSkeleton from './components/PageSkeleton';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Eagerly loaded primary landing page for instant FCP / LCP
import Home from './pages/Home';

// Lazy-loaded code-split pages for high-speed initial bundle & run time
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const CloudKitchen = lazy(() => import('./pages/CloudKitchen'));
const Catering = lazy(() => import('./pages/Catering'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));

// Lazy-loaded admin suite (loaded strictly on-demand)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'));
const InventoryManager = lazy(() => import('./pages/admin/InventoryManager'));
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'));
const CMSManager = lazy(() => import('./pages/admin/CMSManager'));
const CustomersManager = lazy(() => import('./pages/admin/CustomersManager'));

// Auto scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && !isAuthRoute && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/kitchen" element={<CloudKitchen />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="categories" element={<CategoriesManager />} />
              <Route path="inventory" element={<InventoryManager />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="cms" element={<CMSManager />} />
              <Route path="customers" element={<CustomersManager />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && !isAuthRoute && <Footer />}

      {/* Customer Modals & Floating Drawers */}
      {!isAdminRoute && !isAuthRoute && (
        <>
          <CartDrawer />
          <CleaningCutModal />
          <LocationModal />
          <StickyMobileCartBar />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <MainLayout />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
