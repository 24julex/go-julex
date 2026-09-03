import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, LUXURY_BRANDS, WATCH_CATEGORIES } from '../data/initialData';
import { api } from '../services/api';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('chronos_products');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('chronos_orders');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return INITIAL_ORDERS;
  });

  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('chronos_brands');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return LUXURY_BRANDS;
      }
    }
    return LUXURY_BRANDS;
  });

  const [categories] = useState(WATCH_CATEGORIES);
  const [loading, setLoading] = useState(false);

  const getDeletedProductIds = () => {
    try {
      const saved = localStorage.getItem('chronos_deleted_product_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  // Sync to database on mount with permanent deleted filter & offline auto-upload
  const syncFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, brandRes, orderRes] = await Promise.all([
        api.products.getAll(),
        api.brands.getAll(),
        api.orders.getAll()
      ]);

      const deletedIds = getDeletedProductIds();

      if (prodRes.success && Array.isArray(prodRes.data)) {
        // Filter out any products that were deleted by admin
        let backendProducts = prodRes.data.filter(
          (p) => !deletedIds.includes(p.id) && !deletedIds.includes(p.sku)
        );

        // Check if there are local products that were added offline and need syncing to backend
        const saved = localStorage.getItem('chronos_products');
        if (saved) {
          try {
            const localProducts = JSON.parse(saved);
            for (const lp of localProducts) {
              if (lp.id && lp.id.startsWith('prod-') && !deletedIds.includes(lp.id)) {
                // Auto-sync this custom product to backend SQLite!
                try {
                  const createRes = await api.products.create(lp);
                  if (createRes.success && createRes.data) {
                    backendProducts.unshift(createRes.data);
                  }
                } catch (e) {
                  if (!backendProducts.some((bp) => bp.id === lp.id)) {
                    backendProducts.unshift(lp);
                  }
                }
              }
            }
          } catch (e) {}
        }

        setProducts(backendProducts);
        localStorage.setItem('chronos_products', JSON.stringify(backendProducts));
      }

      if (brandRes.success && Array.isArray(brandRes.data)) {
        setBrands(brandRes.data);
        localStorage.setItem('chronos_brands', JSON.stringify(brandRes.data));
      }

      if (orderRes.success && Array.isArray(orderRes.data)) {
        setOrders(orderRes.data);
        localStorage.setItem('chronos_orders', JSON.stringify(orderRes.data));
      }
    } catch (error) {
      console.warn('Backend sync warning, using local state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  useEffect(() => {
    localStorage.setItem('chronos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('chronos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('chronos_brands', JSON.stringify(brands));
  }, [brands]);

  // Admin Action: Add Brand
  const addBrand = async (brandName) => {
    const trimmed = brandName?.trim();
    if (!trimmed) return { success: false, message: 'Brand name cannot be empty.' };

    const exists = brands.some((b) => b.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      return { success: false, message: `Brand "${trimmed}" already exists.` };
    }

    // Backend call
    api.brands.create(trimmed).catch((e) => console.error(e));

    setBrands((prev) => {
      const updated = [...prev, trimmed];
      localStorage.setItem('chronos_brands', JSON.stringify(updated));
      return updated;
    });
    return { success: true, brand: trimmed };
  };

  // Admin Action: Delete Brand
  const deleteBrand = async (brandName) => {
    api.brands.delete(brandName).catch((e) => console.error(e));

    setBrands((prev) => {
      const updated = prev.filter((b) => b !== brandName);
      localStorage.setItem('chronos_brands', JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  // Admin Action: Add Product (1 to 4 images) with SQLite persistence
  const addProduct = async (newProduct) => {
    const cleanImages = Array.isArray(newProduct.images) && newProduct.images.length > 0
      ? newProduct.images.filter(Boolean).slice(0, 4)
      : ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'];

    const productPayload = {
      ...newProduct,
      price: Number(newProduct.price) || 0,
      discountPercent: Number(newProduct.discountPercent) || 0,
      stock: Number(newProduct.stock) !== undefined ? Number(newProduct.stock) : 1,
      images: cleanImages,
      specs: newProduct.specs || {
        movement: 'Automatic (Self-Winding)',
        caseMaterial: 'Stainless Steel',
        caseDiameter: '41 mm',
        waterResistance: '100m / 330ft',
        strap: 'Stainless Steel'
      }
    };

    let createdProduct = null;
    try {
      const res = await api.products.create(productPayload);
      if (res.success && res.data) {
        createdProduct = res.data;
      }
    } catch (e) {
      console.warn('Backend create product error:', e);
    }

    if (!createdProduct) {
      createdProduct = {
        ...productPayload,
        id: `prod-${Date.now().toString().slice(-6)}`,
        rating: 5.0,
        reviewsCount: 0
      };
    }

    // Remove this product from deleted IDs list if present
    const currentDeleted = getDeletedProductIds().filter(
      (dId) => dId !== createdProduct.id && dId !== createdProduct.sku
    );
    localStorage.setItem('chronos_deleted_product_ids', JSON.stringify(currentDeleted));

    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== createdProduct.id);
      const updated = [createdProduct, ...filtered];
      localStorage.setItem('chronos_products', JSON.stringify(updated));
      return updated;
    });

    return { success: true, product: createdProduct };
  };

  // Admin Action: Update Product
  const updateProduct = async (id, updatedData) => {
    try {
      await api.products.update(id, updatedData);
    } catch (e) {
      console.warn('Backend update product error:', e);
    }

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updatedData,
            price: Number(updatedData.price !== undefined ? updatedData.price : p.price),
            discountPercent: Number(updatedData.discountPercent !== undefined ? updatedData.discountPercent : p.discountPercent),
            stock: Number(updatedData.stock !== undefined ? updatedData.stock : p.stock)
          };
        }
        return p;
      });
      localStorage.setItem('chronos_products', JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  // Admin Action: Delete Product (Guaranteed Permanent Deletion)
  const deleteProduct = async (id) => {
    // 1. Add to permanent deleted IDs list in localStorage so it NEVER reappears
    const currentDeleted = getDeletedProductIds();
    if (!currentDeleted.includes(id)) {
      currentDeleted.push(id);
      localStorage.setItem('chronos_deleted_product_ids', JSON.stringify(currentDeleted));
    }

    // 2. Remove immediately from React state & localStorage
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id && p.sku !== id);
      localStorage.setItem('chronos_products', JSON.stringify(updated));
      return updated;
    });

    // 3. Remove from Cart & Wishlist if present
    try {
      const cart = localStorage.getItem('chronos_cart');
      if (cart) {
        const parsedCart = JSON.parse(cart);
        const filteredCart = parsedCart.filter((item) => item.id !== id && item.sku !== id);
        localStorage.setItem('chronos_cart', JSON.stringify(filteredCart));
      }
      const wishlist = localStorage.getItem('chronos_wishlist');
      if (wishlist) {
        const parsedWishlist = JSON.parse(wishlist);
        const filteredWishlist = parsedWishlist.filter((item) => item.id !== id && item.sku !== id);
        localStorage.setItem('chronos_wishlist', JSON.stringify(filteredWishlist));
      }
    } catch (err) {}

    // 4. Send delete to SQLite backend
    try {
      await api.products.delete(id);
    } catch (e) {
      console.warn('Backend product delete error:', e);
    }

    return { success: true };
  };

  // Admin Action: Quick Rate & Discount modification
  const updatePricingAndDiscount = async (id, price, discountPercent) => {
    try {
      await api.products.updatePricing(id, price, discountPercent);
    } catch (e) {
      console.warn('Backend update pricing error:', e);
    }

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            price: Number(price),
            discountPercent: Number(discountPercent)
          };
        }
        return p;
      });
      localStorage.setItem('chronos_products', JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  // Admin Action: Update Order Status
  const updateOrderStatus = async (orderId, newStatus) => {
    api.orders.updateStatus(orderId, newStatus).catch((e) => console.error(e));

    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      localStorage.setItem('chronos_orders', JSON.stringify(updated));
      return updated;
    });
  };

  // Customer Action: Create Order upon Checkout
  const createOrder = async (orderData) => {
    let placedOrder = null;
    try {
      const res = await api.orders.create(orderData);
      if (res.success && res.data) {
        placedOrder = res.data;
      }
    } catch (e) {
      console.warn('Backend order creation error:', e);
    }

    if (!placedOrder) {
      placedOrder = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString(),
        status: 'Processing',
        ...orderData
      };
    }

    // Reduce stock quantities accordingly — in global state AND in the
    // per-store localStorage lists that storefronts / merchant consoles read
    if (orderData.items && Array.isArray(orderData.items)) {
      const subtractFromList = (list) =>
        Array.isArray(list)
          ? list.map((p) => {
              const orderedItem = orderData.items.find((item) => item.id === p.id);
              if (!orderedItem) return p;
              const newStock = Math.max(0, Number(p.stock ?? p.stockQuantity ?? 0) - (orderedItem.quantity || 1));
              return { ...p, stock: newStock, stockQuantity: newStock };
            })
          : list;

      // Per-store product lists (gojulex_store_products_*)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('gojulex_store_products')) continue;
        try {
          const parsed = JSON.parse(localStorage.getItem(key));
          localStorage.setItem(key, JSON.stringify(subtractFromList(parsed)));
        } catch (e) {}
      }
      // Merchant products map ({ storeKey: [products] })
      try {
        const rawMap = localStorage.getItem('gojulex_merchant_products');
        if (rawMap) {
          const map = JSON.parse(rawMap);
          Object.keys(map).forEach((k) => { map[k] = subtractFromList(map[k]); });
          localStorage.setItem('gojulex_merchant_products', JSON.stringify(map));
        }
      } catch (e) {}

      setProducts((prev) => {
        const updated = prev.map((p) => {
          const orderedItem = orderData.items.find((item) => item.id === p.id);
          if (orderedItem) {
            const newStock = Math.max(0, p.stock - (orderedItem.quantity || 1));
            return { ...p, stock: newStock };
          }
          return p;
        });
        localStorage.setItem('chronos_products', JSON.stringify(updated));
        return updated;
      });
    }

    setOrders((prev) => {
      const updated = [placedOrder, ...prev];
      localStorage.setItem('chronos_orders', JSON.stringify(updated));
      return updated;
    });
    return placedOrder;
  };

  // Customer Action: Add Review
  const addProductReview = async (productId, review) => {
    api.products.addReview(productId, review).catch((e) => console.error(e));

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const currentCount = p.reviewsCount || 0;
          const currentRating = p.rating || 5.0;
          const newCount = currentCount + 1;
          const newRating = Number(((currentRating * currentCount + (review.rating || 5)) / newCount).toFixed(1));
          const existingReviews = p.reviews || [];
          return {
            ...p,
            rating: newRating,
            reviewsCount: newCount,
            reviews: [
              {
                id: `rev-${Date.now()}`,
                authorName: review.authorName || review.name || 'Customer',
                rating: review.rating || 5,
                comment: review.comment || '',
                createdAt: new Date().toISOString()
              },
              ...existingReviews
            ]
          };
        }
        return p;
      });
      localStorage.setItem('chronos_products', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset to initial catalogue
  const resetToFactoryCatalog = async () => {
    api.admin.reset().catch((e) => console.error(e));
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setBrands(LUXURY_BRANDS);
    localStorage.setItem('chronos_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('chronos_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('chronos_brands', JSON.stringify(LUXURY_BRANDS));
  };

  // Computed KPIs for Admin Dashboard
  const getAdminKPIs = () => {
    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    const totalOrdersCount = orders.length;
    const totalProductsCount = products.length;
    const discountedProductsCount = products.filter((p) => (p.discountPercent || 0) > 0).length;
    const totalInventoryPieces = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const outOfStockCount = products.filter((p) => (p.stock || 0) <= 0).length;
    const totalBrandsCount = brands.length;

    return {
      totalRevenue,
      totalOrdersCount,
      totalProductsCount,
      discountedProductsCount,
      totalInventoryPieces,
      outOfStockCount,
      totalBrandsCount
    };
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        orders,
        brands,
        categories,
        loading,
        syncFromBackend,
        addBrand,
        deleteBrand,
        addProduct,
        updateProduct,
        deleteProduct,
        updatePricingAndDiscount,
        updateOrderStatus,
        createOrder,
        addProductReview,
        addReview: addProductReview,
        resetToFactoryCatalog,
        getAdminKPIs
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
