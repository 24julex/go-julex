import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEMO_STORES,
  INITIAL_PRODUCTS_BY_STORE,
  INITIAL_ORDERS_BY_STORE,
  INITIAL_CUSTOMERS_BY_STORE,
  INITIAL_DISCOUNTS,
  SALES_CHANNELS_CONFIG
} from '../data/multiVerticalMockData';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const MerchantAdminContext = createContext();

export const MerchantAdminProvider = ({ children }) => {
  const { currentUser, isSuperAdmin, impersonatedTenant } = useAuth();

  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    try {
      return localStorage.getItem('gojulex_merchant_store_id') || '';
    } catch {
      return '';
    }
  });

  // 1. Current Selected Store State (Impersonation & Role-Aware)
  const getInitialImpersonatedStore = () => {
    try {
      const imp = localStorage.getItem('gojulex_impersonated_tenant');
      if (imp) {
        const parsed = JSON.parse(imp);
        if (parsed && (parsed.id || parsed.subdomain)) return parsed;
      }
    } catch {}
    return null;
  };

  // Dynamic Multi-Store Resolver based strictly on logged-in user or Super Admin impersonation
  const resolveCurrentStore = () => {
    // 1. If Super Admin is explicitly impersonating a store
    const imp = impersonatedTenant || getInitialImpersonatedStore();
    if (isSuperAdmin && imp) {
      const cleanSub = (imp.subdomain || imp.id || 'store').toLowerCase().replace(/^store_/, '').replace(/\.gojulex\.com$/, '');
      const storeObj = DEMO_STORES.find(s => s.id === imp.id || s.subdomain?.includes(cleanSub));
      if (storeObj) return storeObj;
      return {
        id: imp.id || `store_${cleanSub}`,
        name: imp.name || `${cleanSub.toUpperCase()} Store`,
        subdomain: cleanSub,
        customDomain: imp.customDomain || `${cleanSub}.in`,
        vertical: (imp.category || '').toLowerCase().includes('jewel') ? 'jewelry' : (imp.category || '').toLowerCase().includes('book') ? 'books' : 'clothes',
        categoryLabel: imp.category || 'Bespoke D2C Store',
        ownerName: imp.ownerName || imp.admin?.name || 'Store Owner',
        ownerEmail: imp.ownerEmail || imp.admin?.email || 'merchant@gojulex.com',
        ownerAvatar: imp.admin?.avatar || imp.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        planTier: imp.planTier || 'SIX_MONTH',
        planName: imp.planName || '6-Month Direct Launch (0% Fee)',
        status: (imp.status || 'active').toLowerCase(),
        city: imp.city || 'Chennai',
        state: imp.state || 'Tamil Nadu',
        gstin: '33AABCL1234A1Z5',
        is2FAEnabled: true
      };
    }

    // 2. If Super Admin is switching stores in dropdown
    if (isSuperAdmin && selectedStoreId) {
      const storeObj = DEMO_STORES.find(s => s.id === selectedStoreId);
      if (storeObj) return storeObj;
    }

    // 3. For Merchant Login (Strict match to logged-in user email, tenantId, or subdomain)
    if (currentUser && !isSuperAdmin) {
      const cleanEmail = (currentUser.email || '').toLowerCase().trim();
      const tenantId = (currentUser.tenantId || '').toLowerCase().trim();
      const userSub = (currentUser.tenant?.subdomain || cleanEmail.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check DEMO_STORES
      const matchedDemo = DEMO_STORES.find(s => 
        s.ownerEmail?.toLowerCase() === cleanEmail ||
        s.id?.toLowerCase() === tenantId ||
        s.subdomain?.toLowerCase().includes(userSub) ||
        cleanEmail.includes(s.subdomain?.toLowerCase().replace(/\.gojulex\.com$/, '')) ||
        cleanEmail.includes(s.id?.toLowerCase().replace(/^store_/, ''))
      );
      if (matchedDemo) return matchedDemo;

      // Check saved custom store profile in localStorage
      try {
        const saved = localStorage.getItem(`gojulex_store_profile_${tenantId}`) ||
                      localStorage.getItem(`gojulex_store_profile_${userSub}`);
        if (saved) {
          const profile = JSON.parse(saved);
          return {
            id: profile.id || `store_${userSub}`,
            name: profile.name || `${userSub.toUpperCase()} Store`,
            subdomain: userSub,
            customDomain: profile.customDomain || `${userSub}.in`,
            vertical: (profile.category || '').toLowerCase().includes('jewel') ? 'jewelry' : (profile.category || '').toLowerCase().includes('book') ? 'books' : 'clothes',
            categoryLabel: profile.category || 'Bespoke D2C Store',
            ownerName: currentUser.name || profile.ownerName || 'Store Owner',
            ownerEmail: cleanEmail,
            ownerAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            planTier: profile.planTier || 'SIX_MONTH',
            planName: '6-Month Direct Launch (0% Fee)',
            status: 'active',
            city: profile.city || 'Chennai',
            state: profile.state || 'Tamil Nadu',
            gstin: '33AABCL1234A1Z5',
            is2FAEnabled: true
          };
        }
      } catch (e) {}

      // Fallback custom store object for logged in merchant
      return {
        id: tenantId || `store_${userSub}`,
        name: currentUser.tenant?.name || `${userSub.charAt(0).toUpperCase() + userSub.slice(1)} Store`,
        subdomain: userSub || 'mystore',
        customDomain: currentUser.tenant?.customDomain || `${userSub || 'mystore'}.in`,
        vertical: cleanEmail.includes('book') ? 'books' : cleanEmail.includes('jewel') ? 'jewelry' : 'clothes',
        categoryLabel: cleanEmail.includes('book') ? 'Books & Literature' : cleanEmail.includes('jewel') ? 'Fine Jewelry & Luxury' : 'Fashion & Designer Apparel',
        ownerName: currentUser.name || 'Store Owner',
        ownerEmail: cleanEmail,
        ownerAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        planTier: 'SIX_MONTH',
        planName: '6-Month Direct Launch (0% Fee)',
        status: 'active',
        city: 'Chennai',
        state: 'Tamil Nadu',
        gstin: '33AABCL1234A1Z5',
        is2FAEnabled: true
      };
    }

    return DEMO_STORES.find(s => s.id === selectedStoreId) || DEMO_STORES[0];
  };

  const currentStore = resolveCurrentStore();
  const currentStoreId = currentStore?.id || 'store_luxestudio';
  const demoStores = DEMO_STORES;

  // 2. Multi-Store Products State
  const [productsByStore, setProductsByStore] = useState(() => {
    try {
      const saved = localStorage.getItem('gojulex_merchant_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PRODUCTS_BY_STORE,
          ...parsed
        };
      }
    } catch (e) {}
    return INITIAL_PRODUCTS_BY_STORE;
  });

  // 3. Multi-Store Orders State
  const [ordersByStore, setOrdersByStore] = useState(() => {
    const saved = localStorage.getItem('gojulex_merchant_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ORDERS_BY_STORE;
      }
    }
    return INITIAL_ORDERS_BY_STORE;
  });

  // 4. Multi-Store Customers State
  const [customersByStore, setCustomersByStore] = useState(() => {
    const saved = localStorage.getItem('gojulex_merchant_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CUSTOMERS_BY_STORE;
      }
    }
    return INITIAL_CUSTOMERS_BY_STORE;
  });

  // 5. Discounts State
  const [discounts, setDiscounts] = useState(() => {
    const saved = localStorage.getItem('gojulex_merchant_discounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DISCOUNTS;
      }
    }
    return INITIAL_DISCOUNTS;
  });

  // 6. Channels State
  const [channels, setChannels] = useState(SALES_CHANNELS_CONFIG);

  // 7. Team Members & Roles (Only the authenticated Store Owner by default)
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'tm_01',
      name: currentStore.ownerName || 'Store Owner',
      email: currentStore.ownerEmail || 'merchant@gojulex.com',
      role: 'Store Owner',
      status: 'Active',
      is2FA: currentStore.is2FAEnabled ?? true,
      avatar: currentStore.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    }
  ]);

  // 8. Payment Provider Gateways
  const [paymentGateways, setPaymentGateways] = useState({
    razorpay: { enabled: true, keyId: 'rzp_live_99214AXYZ', autoCapture: true },
    phonepe: { enabled: true, merchantId: 'M230623091104', saltKey: '••••••••••••4512' },
    cashfree: { enabled: false, appId: '', secretKey: '' },
    cod: { enabled: true, maxAmountINR: 50000, extraFeeINR: 0 }
  });

  // 9. Toast Notifications System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gojulex_merchant_store_id', currentStoreId);
  }, [currentStoreId]);

  useEffect(() => {
    localStorage.setItem('gojulex_merchant_products', JSON.stringify(productsByStore));
    if (productsByStore[currentStoreId]) {
      localStorage.setItem(`gojulex_store_products_${currentStoreId}`, JSON.stringify(productsByStore[currentStoreId]));
      const cleanSub = (currentStore?.subdomain || '').toLowerCase().replace(/\.gojulex\.com$/, '');
      if (cleanSub) {
        localStorage.setItem(`gojulex_store_products_${cleanSub}`, JSON.stringify(productsByStore[currentStoreId]));
        localStorage.setItem(`gojulex_store_products_store_${cleanSub}`, JSON.stringify(productsByStore[currentStoreId]));
      }
    }
  }, [productsByStore, currentStoreId, currentStore]);

  useEffect(() => {
    localStorage.setItem('gojulex_merchant_orders', JSON.stringify(ordersByStore));
  }, [ordersByStore]);

  useEffect(() => {
    localStorage.setItem('gojulex_merchant_customers', JSON.stringify(customersByStore));
  }, [customersByStore]);

  useEffect(() => {
    localStorage.setItem('gojulex_merchant_discounts', JSON.stringify(discounts));
  }, [discounts]);

  // One-time backfill: push locally-created coupons to the backend so they
  // validate at checkout (server-side check is authoritative)
  useEffect(() => {
    if (!currentUser) return;
    const KEY = 'gojulex_merchant_coupons_synced';
    const backfill = async () => {
      try {
        let synced = [];
        try { synced = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
        let changed = false;
        for (const d of discounts) {
          const code = String(d.code || '').trim().toUpperCase();
          if (!code || synced.includes(code)) continue;
          const res = await api.coupons.create({
            code,
            description: d.description || d.title || `Coupon ${code}`,
            discountType: 'PERCENT', // merchant coupons are percentage-based
            discountValue: Number(d.discountValue || d.value || 10),
            minOrderAmount: Number(d.minOrderAmount ?? d.minOrderValueINR ?? d.minCartValue ?? 0) || 0,
            maxDiscountAmount: Number(d.maxDiscountAmount || 0) || null,
            isActive: d.status !== 'Expired'
          }).catch(() => null);
          if (res?.success || res?.message?.includes('already exists')) { synced.push(code); changed = true; }
        }
        if (changed) localStorage.setItem(KEY, JSON.stringify(synced));
      } catch (e) {}
    };
    backfill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // One-time backfill: push any locally-created store products to the backend
  // so the merchant dashboard, super-admin metrics and stock deduction all
  // operate on the same database catalog.
  useEffect(() => {
    if (!currentUser) return;
    const SYNCED_KEY = 'gojulex_merchant_products_db_synced';
    const backfill = async () => {
      try {
        const saved = localStorage.getItem('gojulex_merchant_products');
        if (!saved) return;
        const byStore = JSON.parse(saved);
        let synced = [];
        try { synced = JSON.parse(localStorage.getItem(SYNCED_KEY) || '[]'); } catch (e) {}
        let changed = false;
        for (const [storeKey, list] of Object.entries(byStore)) {
          if (!Array.isArray(list)) continue;
          // Canonicalize to a known demo store so variants like "ramstshirtstore"
          // don't create duplicate tenants in the backend
          const bareKey = storeKey.toLowerCase().replace(/^store_/, '');
          const demoMatch = DEMO_STORES.find(
            (st) => st.id === `store_${bareKey}` || (st.subdomain || '').replace(/\.gojulex\.com$/, '') === bareKey
          );
          // Only push products for KNOWN stores — unknown keys were the ghost-tenant source
          if (!demoMatch) continue;
          const tenantId = demoMatch.id;
          for (const p of list) {
            if (!p?.id || !p?.name || synced.includes(p.id)) continue;
            try {
              const res = await api.products.create({ ...p, tenantId });
              if (res?.success) { synced.push(p.id); changed = true; }
            } catch (e) {}
          }
        }
        if (changed) localStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
      } catch (e) {}
    };
    backfill();
  }, [currentUser]);

  // Live catalog + order sync: the database is the source of truth
  // (checkout writes orders and deducts stock there), so refresh the current
  // store's products and orders from the backend on load and on window focus.
  useEffect(() => {
    if (!currentUser || !currentStoreId) return undefined;
    let cancelled = false;
    const loadLive = () => {
      api.products.getAll({ tenantId: currentStoreId })
        .then(res => {
          if (cancelled || !res?.success || !Array.isArray(res.data) || res.data.length === 0) return;
          setProductsByStore(prev => ({ ...prev, [currentStoreId]: res.data }));
        })
        .catch(() => {});
      api.orders.getAll({ tenantId: currentStoreId })
        .then(res => {
          if (cancelled || !res?.success || !Array.isArray(res.data)) return;
          // Real orders exist in the DB — replace mock/localStorage orders so
          // dashboard KPIs (revenue, order count) reflect actual sales
          if (res.data.length > 0) {
            setOrdersByStore(prev => ({ ...prev, [currentStoreId]: res.data }));
          }
        })
        .catch(() => {});
    };
    loadLive();
    window.addEventListener('focus', loadLive);
    return () => { cancelled = true; window.removeEventListener('focus', loadLive); };
  }, [currentUser, currentStoreId]);

  // Current Store Helpers (Strict Isolation for Personal Merchant Accounts)
  const isDemoStore = DEMO_STORES.some(s => s.id === currentStoreId);
  const cleanSubdomainKey = (currentStore?.subdomain || '').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');
  const products = productsByStore[currentStoreId] ||
                   productsByStore[`store_${cleanSubdomainKey}`] ||
                   productsByStore[cleanSubdomainKey] ||
                   (INITIAL_PRODUCTS_BY_STORE[currentStoreId] || INITIAL_PRODUCTS_BY_STORE[`store_${cleanSubdomainKey}`] || INITIAL_PRODUCTS_BY_STORE[cleanSubdomainKey] || []);
  const orders = ordersByStore[currentStoreId] ||
                 ordersByStore[`store_${cleanSubdomainKey}`] ||
                 ordersByStore[cleanSubdomainKey] ||
                 (INITIAL_ORDERS_BY_STORE[currentStoreId] || INITIAL_ORDERS_BY_STORE[`store_${cleanSubdomainKey}`] || INITIAL_ORDERS_BY_STORE[cleanSubdomainKey] || []);
  const customers = customersByStore[currentStoreId] ||
                    customersByStore[`store_${cleanSubdomainKey}`] ||
                    customersByStore[cleanSubdomainKey] ||
                    (INITIAL_CUSTOMERS_BY_STORE[currentStoreId] || INITIAL_CUSTOMERS_BY_STORE[`store_${cleanSubdomainKey}`] || INITIAL_CUSTOMERS_BY_STORE[cleanSubdomainKey] || []);

    // Dynamic Store-Specific KPIs with full fallbacks
  const totalSalesINR = orders.reduce((sum, o) => sum + (o.totalAmountINR || o.totalAmount || o.sellingPriceINR || 0), 0);
  const totalOrdersCount = orders.length;
  const unfulfilledOrdersCount = orders.filter(
    (o) => o.fulfillmentStatus === 'PROCESSING' || o.fulfillmentStatus === 'UNFULFILLED' || o.status === 'Processing'
  ).length;
  const lowStockItemsCount = products.filter((p) => (p.stockQuantity ?? p.stock ?? 10) <= 3).length;
  const feesSavedINR = Math.round(totalSalesINR * 0.18);

  const kpis = {
    todaySalesINR: 0,
    todaySalesChangePercent: 0,
    totalSalesINR,
    totalOrdersCount,
    unfulfilledOrdersCount,
    lowStockItemsCount,
    feesSavedINR,
    averageOrderValue: totalOrdersCount > 0 ? Math.round(totalSalesINR / totalOrdersCount) : 0,
    conversionRatePercent: totalOrdersCount > 0 ? 3.4 : 0
  };

  // Switch Store Handler (Works for Super Admin & Merchants with multiple stores)
  const switchStore = (storeId) => {
    setSelectedStoreId(storeId);
    const storeObj = DEMO_STORES.find(s => s.id === storeId);
    try {
      localStorage.setItem('gojulex_merchant_store_id', storeId);
    } catch {}
    showToast(`Switched workspace to ${storeObj?.name || 'Selected Store'}`, 'info');
  };

  // --- ORDER ACTIONS ---
  const updateFulfillmentStatus = (orderId, newStatus, trackingNumber = '', carrier = '') => {
    setOrdersByStore(prev => {
      const storeOrders = prev[currentStoreId] || [];
      const updated = storeOrders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            fulfillmentStatus: newStatus,
            trackingNumber: trackingNumber || o.trackingNumber,
            carrierName: carrier || o.carrierName
          };
        }
        return o;
      });
      return { ...prev, [currentStoreId]: updated };
    });
    showToast(`Order #${orderId.toUpperCase()} marked as ${newStatus}`, 'success');
  };

  const sendInvoiceEmail = async (order) => {
    // Simulated async dispatch
    return new Promise((resolve) => {
      setTimeout(() => {
        setOrdersByStore(prev => {
          const storeOrders = prev[currentStoreId] || [];
          const updated = storeOrders.map(o => {
            if (o.id === order.id) {
              return { ...o, invoiceSentAt: new Date().toISOString() };
            }
            return o;
          });
          return { ...prev, [currentStoreId]: updated };
        });
        showToast(`Tax invoice PDF sent to ${order.customerEmail}`, 'success');
        resolve(true);
      }, 1200);
    });
  };

  // --- PRODUCT ACTIONS with AUTO-STOCK & DYNAMIC VARIANTS RULE ---
  const addProduct = (productData) => {
    const isVar = Boolean(productData.hasVariants);
    const stockVal = Number(productData.stockQuantity !== undefined ? productData.stockQuantity : (productData.stock || 0));
    const newProduct = {
      id: `prod_${Date.now().toString().slice(-6)}`,
      brand: currentStore.name,
      rating: 5.0,
      reviewsCount: 0,
      ...productData,
      hasVariants: isVar,
      optionSets: isVar ? (productData.optionSets || []) : [],
      availableSizes: isVar ? (productData.availableSizes || []) : [],
      availableColors: isVar ? (productData.availableColors || []) : [],
      stockQuantity: stockVal,
      stock: stockVal,
      status: stockVal > 0 ? 'Available' : 'No'
    };

    setProductsByStore(prev => {
      const currentList = prev[currentStoreId] || [];
      return { ...prev, [currentStoreId]: [newProduct, ...currentList] };
    });

    try {
      api.products.create({ ...newProduct, tenantId: currentStore.id }).then(res => {
        // Mark as already in the DB so the login backfill never re-uploads it
        if (res?.success) {
          try {
            const KEY = 'gojulex_merchant_products_db_synced';
            const synced = JSON.parse(localStorage.getItem(KEY) || '[]');
            if (!synced.includes(newProduct.id)) {
              synced.push(newProduct.id);
              localStorage.setItem(KEY, JSON.stringify(synced));
            }
          } catch (e) {}
        }
      }).catch(() => {});
    } catch (e) {}

    showToast(`Product "${newProduct.name}" added to catalog!`, 'success');
    return newProduct;
  };

  const updateProduct = (productId, updatedFields) => {
    setProductsByStore(prev => {
      const currentList = prev[currentStoreId] || [];
      const updatedList = currentList.map(p => {
        if (p.id === productId) {
          const newQty = updatedFields.stockQuantity !== undefined
            ? Number(updatedFields.stockQuantity)
            : (updatedFields.stock !== undefined ? Number(updatedFields.stock) : (p.stockQuantity ?? p.stock ?? 10));
          const newStatus = newQty <= 0 ? 'No' : (updatedFields.status || (newQty > 0 ? 'Available' : p.status));
          const isVar = updatedFields.hasVariants !== undefined ? Boolean(updatedFields.hasVariants) : Boolean(p.hasVariants);
          return {
            ...p,
            ...updatedFields,
            hasVariants: isVar,
            optionSets: isVar ? (updatedFields.optionSets || p.optionSets || []) : [],
            availableSizes: isVar ? (updatedFields.availableSizes || p.availableSizes || []) : [],
            availableColors: isVar ? (updatedFields.availableColors || p.availableColors || []) : [],
            stockQuantity: newQty,
            stock: newQty,
            status: newStatus
          };
        }
        return p;
      });
      return { ...prev, [currentStoreId]: updatedList };
    });

    try {
      api.products.update(productId, { ...updatedFields, tenantId: currentStore.id }).catch(() => {});
    } catch (e) {}

    showToast('Product updated successfully', 'success');
  };

  const deleteProduct = (productId) => {
    setProductsByStore(prev => {
      const currentList = prev[currentStoreId] || [];
      return { ...prev, [currentStoreId]: currentList.filter(p => p.id !== productId) };
    });
    showToast('Product removed from catalog', 'info');
  };

  // --- CUSTOMER ACTIONS ---
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: `cust_${Date.now().toString().slice(-6)}`,
      ordersCount: 0,
      totalSpentINR: 0,
      segment: 'Just a viewer',
      lastOrderDate: '-',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      ...customerData
    };
    setCustomersByStore(prev => {
      const currentList = prev[currentStoreId] || [];
      return { ...prev, [currentStoreId]: [newCustomer, ...currentList] };
    });
    showToast(`Customer ${newCustomer.name} created!`, 'success');
    return newCustomer;
  };

  // --- DISCOUNT ACTIONS ---
  const addDiscount = (discountData) => {
    const newDisc = {
      id: `disc_${Date.now().toString().slice(-6)}`,
      status: 'Active',
      usedCount: 0,
      ...discountData
    };
    setDiscounts(prev => [newDisc, ...prev]);

    // Persist to the backend — checkout validates coupons server-side, so a
    // code that exists only in localStorage would be rejected as invalid
    try {
      api.coupons.create({
        code: newDisc.code,
        description: newDisc.description || newDisc.title || `Coupon ${newDisc.code}`,
        discountType: 'PERCENT', // merchant coupons are percentage-based
        discountValue: Number(newDisc.discountValue || newDisc.value || 10),
        minOrderAmount: Number(newDisc.minOrderAmount ?? newDisc.minOrderValueINR ?? newDisc.minCartValue ?? 0) || 0,
        maxDiscountAmount: Number(newDisc.maxDiscountAmount || 0) || null,
        isActive: newDisc.status !== 'Expired'
      }).then(res => {
        if (res?.success) {
          const KEY = 'gojulex_merchant_coupons_synced';
          try {
            const synced = JSON.parse(localStorage.getItem(KEY) || '[]');
            if (!synced.includes(newDisc.code)) { synced.push(newDisc.code); localStorage.setItem(KEY, JSON.stringify(synced)); }
          } catch (e) {}
        }
      }).then(res => {
        if (!res?.success) {
          showToast(`Coupon saved locally but backend rejected it: ${res?.message || 'unknown error'}. It will retry on next login.`, 'warning');
        }
      }).catch(() => {
        showToast('Coupon saved locally — will sync to checkout validation on next login.', 'warning');
      });
    } catch (e) {}

    showToast(`Coupon code ${newDisc.code} created!`, 'success');
    return newDisc;
  };

  const toggleDiscountStatus = (discountId) => {
    setDiscounts(prev =>
      prev.map(d => (d.id === discountId ? { ...d, status: d.status === 'Active' ? 'Expired' : 'Active' } : d))
    );
    // Keep the backend in sync — checkout validates against the DB
    const target = discounts.find(d => d.id === discountId);
    if (target?.code) {
      api.coupons.update(target.code, { isActive: target.status !== 'Active' })
        .then(res => { if (res?.success) showToast(`Coupon ${target.code} ${target.status === 'Active' ? 'deactivated' : 'activated'}`, 'success'); })
        .catch(() => showToast('Status updated locally (backend sync failed)', 'info'));
    } else {
      showToast('Discount status updated', 'info');
    }
  };

  // --- STORE PROFILE & BRAND IDENTITY ACTIONS ---
  const updateStoreProfile = (updatedFields) => {
    setCustomProfile(prev => {
      const updated = { ...prev, ...updatedFields };
      try {
        localStorage.setItem(`gojulex_store_profile_${merchantStoreId}`, JSON.stringify(updated));
        if (updated.subdomain) {
          localStorage.setItem(`gojulex_store_profile_${updated.subdomain}`, JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
    showToast('Store brand profile & domain settings updated!', 'success');
  };

  const clearAllProducts = () => {
    setProductsByStore(prev => {
      const updated = { ...prev, [currentStoreId]: [] };
      localStorage.setItem(`gojulex_store_products_${currentStoreId}`, JSON.stringify([]));
      return updated;
    });
    showToast('Catalog reset. Ready for your own custom products!', 'info');
  };

  const activeCustomersCount = customers.length;

  return (
    <MerchantAdminContext.Provider
      value={{
        // Stores
        demoStores: DEMO_STORES,
        currentStore,
        currentStoreId,
        switchStore,

        // Data
        products,
        orders,
        customers,
        discounts,
        channels,
        teamMembers,
        paymentGateways,
        setPaymentGateways,

        // Actions
        updateStoreProfile,
        clearAllProducts,
        updateFulfillmentStatus,
        sendInvoiceEmail,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        addDiscount,
        toggleDiscountStatus,

        // KPIs
        kpis: {
          ...kpis,
          todaySalesINR: totalSalesINR,
          todaySalesChangePercent: 18.5,
          activeCustomersCount
        },

        // Toast
        toast,
        showToast
      }}
    >
      {children}

      {/* Global Interactive Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'info'
                ? 'bg-sky-950/90 border-sky-500/40 text-sky-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            <span>{toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </MerchantAdminContext.Provider>
  );
};

export const useMerchantAdmin = () => {
  const context = useContext(MerchantAdminContext);
  if (!context) {
    throw new Error('useMerchantAdmin must be used within a MerchantAdminProvider');
  }
  return context;
};
