import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateDiscount } from '../utils/formatters';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('chronos_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('chronos_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch active coupons from backend
  const fetchCoupons = useCallback(async () => {
    try {
      const res = await api.coupons.getActive();
      if (res?.success && Array.isArray(res?.data)) {
        setAvailableCoupons(res.data);
      }
    } catch (e) {
      console.warn('Failed to fetch active coupons:', e);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    localStorage.setItem('chronos_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('chronos_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((current) => (current?.id === toastMessage?.id ? null : current));
    }, 3500);
  };

  const closeToast = () => setToastMessage(null);

  // Add timepiece to cart with max stock validation
  const addToCart = (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const existingIndex = cartItems.findIndex((item) => String(item.id) === String(product.id));

    const price = Number(product.sellingPriceINR ?? product.price ?? 0);
    const comparePrice = Number(product.comparePriceINR ?? product.comparePrice ?? price);
    const discountPercent = product.discountPercent || (comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0);
    const finalPrice = price;
    const stock = Number(product.stockQuantity ?? product.stock ?? 10);
    const image = (product.images && product.images[0]) || product.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';

    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity;
      const newQty = currentQty + qty;
      if (stock > 0 && newQty > stock) {
        showToast(`Stock limit reached. Only ${stock} units available.`, 'error');
        return;
      }
      setCartItems((prev) => {
        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      });
      showToast(`Updated "${product.name}" quantity to ${newQty}.`);
    } else {
      if (stock <= 0) {
        showToast(`"${product.name}" is currently out of stock.`, 'error');
        return;
      }
      const cartItem = {
        id: product.id,
        name: product.name,
        brand: product.brand || product.category || 'Bespoke D2C',
        price,
        sellingPriceINR: price,
        comparePriceINR: comparePrice,
        discountPercent,
        finalPrice,
        stock,
        image,
        quantity: qty,
        storeSubdomain: product.storeSubdomain,
        tenantId: product.tenantId,
        storeName: product.storeName
      };
      setCartItems((prev) => [...prev, cartItem]);
      showToast(`Added "${product.name}" to your shopping bag!`);
    }
  };

  // Remove timepiece from cart
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('Timepiece removed from cart', 'info');
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          if (item.stock !== undefined && qty > item.stock) {
            showToast(`Maximum vault stock is ${item.stock} pieces.`, 'error');
            return item;
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
  };

  // Wishlist toggle
  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Removed "${product.name}" from your Wishlist`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Saved "${product.name}" to your Wishlist!`);
    }
  };

  const isInWishlist = (productId) => wishlist.some((item) => item.id === productId);

  // Apply promo code (supports dynamic coupons from backend and quick presets)
  const applyPromoCode = (code) => {
    const clean = code?.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter a coupon code.' };

    const discountedSubtotal = cartItems.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);

    // 1. Check in dynamically fetched backend coupons
    const matchedCoupon = availableCoupons.find((c) => c.code.toUpperCase() === clean);
    if (matchedCoupon) {
      if (matchedCoupon.minOrderAmount > 0 && discountedSubtotal < matchedCoupon.minOrderAmount) {
        const needed = matchedCoupon.minOrderAmount - discountedSubtotal;
        return {
          success: false,
          message: `Code "${clean}" requires minimum order of ₹${matchedCoupon.minOrderAmount.toLocaleString('en-IN')}. Add ₹${needed.toLocaleString('en-IN')} more to qualify.`
        };
      }

      if (matchedCoupon.discountType === 'FIXED') {
        setAppliedPromo({
          code: matchedCoupon.code,
          fixedDiscount: matchedCoupon.discountValue,
          label: matchedCoupon.description
        });
        showToast(`₹${matchedCoupon.discountValue.toLocaleString('en-IN')} privilege discount applied!`);
        return { success: true };
      } else {
        setAppliedPromo({
          code: matchedCoupon.code,
          discountPercent: matchedCoupon.discountValue,
          maxDiscountAmount: matchedCoupon.maxDiscountAmount,
          label: matchedCoupon.description
        });
        showToast(`${matchedCoupon.discountValue}% discount applied to your order!`);
        return { success: true };
      }
    }

    // 2. Fallbacks for built-in luxury codes
    if (clean === 'CHRONOS10' || clean === 'WELCOME10' || clean === 'VIP10') {
      setAppliedPromo({ code: 'CHRONOS10', discountPercent: 10, label: 'Customer Welcome Discount (10% Off)' });
      showToast('10% Customer discount applied to your order!');
      return { success: true };
    }
    if (clean === 'ROYAL50000' || clean === 'ROYAL500') {
      setAppliedPromo({ code: 'ROYAL50000', fixedDiscount: 50000, label: 'Grand Horology Voucher (₹50,000 Off)' });
      showToast('₹50,000 discount applied!');
      return { success: true };
    }
    if (clean === 'FESTIVE15') {
      setAppliedPromo({ code: 'FESTIVE15', discountPercent: 15, label: 'Festive Connoisseur Celebration (15% Off)' });
      showToast('15% Festive discount applied!');
      return { success: true };
    }

    return { success: false, message: `Promo code "${clean}" is invalid or expired.` };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast('Promo voucher removed', 'info');
  };

  // Calculate cart totals
  const getCartTotals = () => {
    const originalSubtotal = cartItems.reduce((acc, item) => {
      const p = Number(item.comparePriceINR || item.comparePrice || item.price || item.sellingPriceINR || 0);
      const q = Number(item.quantity) || 1;
      return acc + (p * q);
    }, 0);

    const discountedSubtotal = cartItems.reduce((acc, item) => {
      const p = Number(item.finalPrice || item.sellingPriceINR || item.price || 0);
      const q = Number(item.quantity) || 1;
      return acc + (p * q);
    }, 0);

    const productSavings = Math.max(0, originalSubtotal - discountedSubtotal);

    let promoSavings = 0;
    if (appliedPromo) {
      if (appliedPromo.discountPercent) {
        promoSavings = Math.round((discountedSubtotal * Number(appliedPromo.discountPercent)) / 100);
        if (appliedPromo.maxDiscountAmount && promoSavings > Number(appliedPromo.maxDiscountAmount)) {
          promoSavings = Number(appliedPromo.maxDiscountAmount);
        }
      } else if (appliedPromo.fixedDiscount) {
        promoSavings = Math.min(discountedSubtotal, Number(appliedPromo.fixedDiscount));
      }
    }

    const totalSavings = productSavings + promoSavings;
    const finalAmount = Math.max(0, discountedSubtotal - promoSavings);
    const itemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

    return {
      originalSubtotal,
      discountedSubtotal,
      productSavings,
      promoSavings,
      totalSavings,
      finalAmount,
      itemCount
    };
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlist,
        appliedPromo,
        availableCoupons,
        toastMessage,
        fetchCoupons,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyPromoCode,
        removePromoCode,
        getCartTotals,
        getCartCount,
        showToast,
        closeToast
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
