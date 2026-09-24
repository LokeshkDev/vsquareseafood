import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import StickyMobileCartBar from './components/StickyMobileCartBar';
import CartDrawer from './components/CartDrawer';
import CleaningCutModal from './components/CleaningCutModal';
import LocationModal from './components/LocationModal';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import CloudKitchen from './pages/CloudKitchen';
import Catering from './pages/Catering';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Auto scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/kitchen" element={<CloudKitchen />} />
              <Route path="/catering" element={<Catering />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Footer />

          {/* Interactive Modals & Floating Drawers */}
          <CartDrawer />
          <CleaningCutModal />
          <LocationModal />
          <StickyMobileCartBar />
        </div>
      </CartProvider>
    </Router>
  );
}
