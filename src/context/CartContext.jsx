import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CLEANING_OPTIONS } from '../data/products';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('v2_seafood_cart');
      return saved ? JSON.parse(saved) : [];
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

  const addToCart = (product, cleaningOption = null, qty = 1) => {
    // If raw fish and has multiple cleaning options, default to product default if not passed
    const cut = cleaningOption || product.defaultCleaning || 'whole-cleaned';
    const itemId = `${product.id}_${cut}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          product: product,
          cleaningOption: cut,
          quantity: qty,
          unitPrice: product.price,
        }
      ];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
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
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const isFreeDelivery = cartSubtotal >= 699;
  const deliveryFee = cartSubtotal === 0 ? 0 : (isFreeDelivery ? 0 : 49);
  const packagingFee = cartSubtotal === 0 ? 0 : 19; // Insulated cold box + gel pack
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
