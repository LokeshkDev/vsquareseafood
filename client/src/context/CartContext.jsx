import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CLEANING_OPTIONS } from '../data/products';

const CartContext = createContext(null);

const getCmsCartConfig = () => {
  try {
    const saved = localStorage.getItem('v2_cms_sections');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        deliveryFeeEnabled: parsed.deliveryFeeEnabled !== false,
        deliveryFeeRate: parsed.deliveryFeeRate !== undefined && !isNaN(Number(parsed.deliveryFeeRate)) ? Number(parsed.deliveryFeeRate) : 49,
        deliveryFeeLabel: parsed.deliveryFeeLabel || 'Delivery Partner Fee',
        freeDeliveryThreshold: parsed.freeDeliveryThreshold !== undefined && !isNaN(Number(parsed.freeDeliveryThreshold)) ? Number(parsed.freeDeliveryThreshold) : 699,
        packagingFeeEnabled: parsed.packagingFeeEnabled !== false,
        packagingFeeRate: parsed.packagingFeeRate !== undefined && !isNaN(Number(parsed.packagingFeeRate)) ? Number(parsed.packagingFeeRate) : 19,
        packagingFeeLabel: parsed.packagingFeeLabel || 'Cold Chain & Vacuum Packaging',
        packagingNoticeText: parsed.packagingNoticeText || '0-4°C Cold Chain Packaging: Insulated pack with gel ice to preserve harbor freshness.',
      };
    }
  } catch (e) {}
  return {
    deliveryFeeEnabled: true,
    deliveryFeeRate: 49,
    deliveryFeeLabel: 'Delivery Partner Fee',
    freeDeliveryThreshold: 699,
    packagingFeeEnabled: true,
    packagingFeeRate: 19,
    packagingFeeLabel: 'Cold Chain & Vacuum Packaging',
    packagingNoticeText: '0-4°C Cold Chain Packaging: Insulated pack with gel ice to preserve harbor freshness.',
  };
};

export const CartProvider = ({ children }) => {
  const [cartConfig, setCartConfig] = useState(getCmsCartConfig);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('v2_seafood_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      // Sanitize any existing items in localStorage: heal NaN/undefined unitPrice & images
      return parsed
        .filter(item => item && (item.product || item.productId))
        .map(item => {
          const prod = item.product || {};
          let price = Number(item.unitPrice);
          if (isNaN(price) || price <= 0) {
            price = Number(prod.basePrice ?? prod.price ?? prod.variants?.[0]?.price ?? 0);
          }
          if (isNaN(price)) price = 0;

          const safeImage = prod.image || prod.images?.[0]?.publicUrl || 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800';
          const safeQty = Math.max(1, Number(item.quantity) || 1);

          return {
            ...item,
            quantity: safeQty,
            unitPrice: price,
            product: {
              ...prod,
              image: safeImage,
              basePrice: price,
              price: price,
            }
          };
        });
    } catch (e) {
      return [];
    }
  });

  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    return localStorage.getItem('v2_seafood_location') || 'Mylapore, Chennai - 600004';
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cleaningModalProduct, setCleaningModalProduct] = useState(null);

  // Sync CMS cart rates and toggles in real-time
  useEffect(() => {
    const handleCmsUpdate = () => {
      setCartConfig(getCmsCartConfig());
    };
    window.addEventListener('storage', handleCmsUpdate);
    window.addEventListener('v2_cms_updated', handleCmsUpdate);
    return () => {
      window.removeEventListener('storage', handleCmsUpdate);
      window.removeEventListener('v2_cms_updated', handleCmsUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('v2_seafood_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to local storage', e);
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('v2_seafood_location', deliveryLocation);
  }, [deliveryLocation]);

  const addToCart = (product, cleaningOption = null, qty = 1, customPrice = null) => {
    if (!product) return;

    const isRaw = (product.type || '').toLowerCase() === 'raw';
    const isKitchen = (product.type || '').toLowerCase() === 'kitchen';
    const cut = cleaningOption || product.defaultCleaning || (isKitchen ? 'ready-to-eat' : 'whole-cleaned');
    const itemId = `${product.id}_${cut}`;

    const calculateUnitPrice = () => {
      // 1. If explicit customPrice was passed and valid
      if (customPrice !== null && customPrice !== undefined && !isNaN(Number(customPrice)) && Number(customPrice) > 0) {
        return Number(customPrice);
      }

      // 2. Base price extraction from either backend schema (basePrice) or mock (price) or variants
      const rawBase = Number(product.basePrice ?? product.price ?? product.variants?.[0]?.price ?? 0);

      // 3. Cut modifier pricing for raw seafood
      if (isRaw && cut) {
        if (product.cutPrices && product.cutPrices[cut] !== undefined && !isNaN(Number(product.cutPrices[cut]))) {
          return Number(product.cutPrices[cut]);
        }
        const cutObj = CLEANING_OPTIONS.find((c) => c.id === cut);
        if (cutObj && cutObj.priceModifier !== undefined && !isNaN(Number(cutObj.priceModifier))) {
          return rawBase + Number(cutObj.priceModifier);
        }
      }

      return rawBase;
    };

    const calculatedPrice = calculateUnitPrice();
    const finalPrice = (!isNaN(calculatedPrice) && calculatedPrice > 0)
      ? calculatedPrice
      : (Number(product.basePrice ?? product.price ?? 0) || 0);

    const safeImage = product.image || product.images?.[0]?.publicUrl || 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800';
    const safeProduct = {
      ...product,
      image: safeImage,
      price: finalPrice,
      basePrice: finalPrice,
    };

    const safeQty = Math.max(1, Number(qty) || 1);

    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
          item.id === itemId ? {
            ...item,
            quantity: item.quantity + safeQty,
            unitPrice: finalPrice,
            product: safeProduct
          } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          product: safeProduct,
          cleaningOption: cut,
          quantity: safeQty,
          unitPrice: finalPrice,
        }
      ];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === itemId) {
            const currentQty = Number(item.quantity) || 1;
            const newQty = currentQty + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Get total quantity of a product across any cut variants
  const getProductQty = (productId) => {
    return cart
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const p = Number(item.unitPrice) || 0;
    const q = Number(item.quantity) || 0;
    return sum + (p * q);
  }, 0);

  const freeDeliveryThreshold = Number(cartConfig.freeDeliveryThreshold) || 699;
  const deliveryFeeRate = Number(cartConfig.deliveryFeeRate) || 49;
  const packagingFeeRate = Number(cartConfig.packagingFeeRate) || 19;
  const isDeliveryFeeEnabled = cartConfig.deliveryFeeEnabled !== false;
  const isPackagingFeeEnabled = cartConfig.packagingFeeEnabled !== false;

  const isFreeDelivery = !isDeliveryFeeEnabled || cartSubtotal >= freeDeliveryThreshold;
  const deliveryFee = cartSubtotal === 0 || !isDeliveryFeeEnabled
    ? 0
    : (isFreeDelivery ? 0 : deliveryFeeRate);

  const packagingFee = cartSubtotal === 0 || !isPackagingFeeEnabled
    ? 0
    : packagingFeeRate;

  const grandTotal = cartSubtotal + deliveryFee + packagingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getProductQty,
        cartCount,
        cartSubtotal,
        deliveryFee,
        isFreeDelivery,
        packagingFee,
        grandTotal,
        cartConfig,
        freeDeliveryThreshold,
        deliveryFeeRate,
        packagingFeeRate,
        isDeliveryFeeEnabled,
        isPackagingFeeEnabled,
        deliveryFeeLabel: cartConfig.deliveryFeeLabel || 'Delivery Partner Fee',
        packagingFeeLabel: cartConfig.packagingFeeLabel || 'Cold Chain & Vacuum Packaging',
        packagingNoticeText: cartConfig.packagingNoticeText,
        deliveryLocation,
        setDeliveryLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isCartOpen,
        setIsCartOpen,
        cleaningModalProduct,
        setCleaningModalProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
