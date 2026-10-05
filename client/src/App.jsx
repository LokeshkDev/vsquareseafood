import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import StickyMobileCartBar from './components/StickyMobileCartBar';
import CartDrawer from './components/CartDrawer';
import CleaningCutModal from './components/CleaningCutModal';
import LocationModal from './components/LocationModal';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import CloudKitchen from './pages/CloudKitchen';
import Catering from './pages/Catering';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ProductsManager from './pages/admin/ProductsManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import InventoryManager from './pages/admin/InventoryManager';
import OrdersManager from './pages/admin/OrdersManager';
import CMSManager from './pages/admin/CMSManager';
import CustomersManager from './pages/admin/CustomersManager';

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

