import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEMO_STORES,
  SALES_CHANNELS_CONFIG
} from '../data/multiVerticalMockData';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const MerchantAdminContext = createContext();

const presentCoupon = (coupon) => ({
  ...coupon,
  type: coupon.discountType === 'FIXED' ? 'Flat Amount Off' : 'Total Order Amount Off',
  value: coupon.discountValue,
  usedCount: coupon.usageCount || 0,
  maxUsage: '—',
  minOrderValueINR: coupon.minOrderAmount || 0,
  expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-IN') : 'No expiry',
  status: coupon.isActive ? 'Active' : 'Inactive'
});

export const MerchantAdminProvider = ({ children }) => {
  const { currentUser, isSuperAdmin, impersonatedTenant } = useAuth();

  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    try {
      return localStorage.getItem('gojulex_merchant_store_id') || '';
    } catch {
      return '';
    }
  });
  const [storeProfileById, setStoreProfileById] = useState({});

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
      return {
        id: imp.id || `store_${cleanSub}`,
        name: imp.name || `${cleanSub.toUpperCase()} Store`,
        subdomain: cleanSub,
        customDomain: imp.customDomain || null,
        vertical: (imp.category || '').toLowerCase().includes('jewel') ? 'jewelry' : (imp.category || '').toLowerCase().includes('book') ? 'books' : 'clothes',
        categoryLabel: imp.category || 'Bespoke D2C Store',
        ownerName: imp.ownerName || imp.admin?.name || 'Store Owner',
        ownerEmail: imp.ownerEmail || imp.admin?.email || '',
        ownerAvatar: imp.admin?.avatar || imp.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        planTier: imp.planTier || 'FREE',
        planName: imp.planName || 'Go Julex Plan',
        status: (imp.status || 'draft').toLowerCase(),
        city: imp.city || null,
        state: imp.state || null,
        gstin: imp.gstin || null,
        is2FAEnabled: true
      };
    }

    // 2. If Super Admin is switching stores in dropdown
    if (isSuperAdmin && selectedStoreId) {
      const storeObj = (backendStores || []).find(s => s.id === selectedStoreId);
      if (storeObj) return storeObj;
    }
    if (isSuperAdmin && backendStores?.length) return backendStores[0];

    // 3. For Merchant Login (Strict match to logged-in user email, tenantId, or subdomain)
    if (currentUser && !isSuperAdmin) {
      const cleanEmail = (currentUser.email || '').toLowerCase().trim();
      const tenantId = (currentUser.tenantId || '').toLowerCase().trim();
      const tenant = currentUser.tenant || null;
      if (tenant) {
        const slug = String(tenant.subdomain || '').toLowerCase().replace(/\.go\.julex\.shop$/, '').replace(/\.gojulex\.com$/, '');
        return {
          ...tenant,
          id: tenant.id,
          subdomain: slug,
          categoryLabel: tenant.category || 'Store',
          ownerName: currentUser.name || '',
          ownerEmail: currentUser.email || '',
          ownerAvatar: tenant.profileImageUrl || tenant.logoUrl || currentUser.avatarUrl || null,
          status: String(tenant.status || 'DRAFT').toLowerCase(),
          is2FAEnabled: Boolean(currentUser.twoFactorEnabled)
        };
      }
      // The store slug comes ONLY from the linked tenant's subdomain —
      // never invented from the owner's email (abinaya.23ad@… must not
      // become abinaya23ad.go.julex.shop).
      const userSub = (tenant?.subdomain || '')
        .toLowerCase()
        .replace(/\.go\.julex\.shop$/, '')
        .replace(/\.gojulex\.com$/, '')
        .replace(/[^a-z0-9]/g, '');

      // Fallback custom store object for logged in merchant — built from the
      // REAL linked tenant; nothing is invented from the email. A missing
      // tenant (broken signup) shows a neutral "My Store" instead.
      return {
        id: tenant?.id || tenantId || (userSub ? `store_${userSub}` : 'store_mystore'),
        name: tenant?.name || 'My Store',
        subdomain: userSub || 'mystore',
        customDomain: tenant?.customDomain || null,
        logoUrl: tenant?.logoUrl || null,
        profileImageUrl: tenant?.profileImageUrl || null,
        vertical: (tenant?.category || '').toLowerCase().includes('jewel') ? 'jewelry' : (tenant?.category || '').toLowerCase().includes('book') ? 'books' : 'clothes',
        categoryLabel: tenant?.category || 'Custom E-Commerce Store',
        ownerName: currentUser.name || 'Store Owner',
        ownerEmail: currentUser?.email || cleanEmail,
        // The merchant's OWN uploaded images win over the generated
        // initials avatar (currentUser.avatar is always set).
        ownerAvatar: tenant?.profileImageUrl || tenant?.logoUrl || currentUser.avatar || null,
        planTier: tenant?.planTier || 'FREE',
        planName: 'Go Julex Plan (0% Platform Fee)',
        status: (tenant?.status || 'draft').toLowerCase(),
        city: tenant?.city || null,
        state: tenant?.state || null,
        gstin: tenant?.gstin || null,
        is2FAEnabled: Boolean(currentUser.twoFactorEnabled)
      };
    }

    return { id: null, name: 'Select a store', subdomain: '', status: 'draft' };
  };

  // Real stores from the backend (super admin sees every tenant in the switcher).
  // Falls back to the static demo list only if the API is unreachable.
  const [backendStores, setBackendStores] = useState(null);
  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    api.superAdmin.getTenants()
      .then((res) => {
        if (cancelled || !res?.success) return;
        const list = Array.isArray(res.data) ? res.data : res.data?.tenants || [];
        const mapped = list.map((t) => ({
          id: t.id || t.tenantId,
          name: t.name || t.tenant?.name || 'Store',
          subdomain: String(t.subdomain || t.id || '').toLowerCase().replace(/^store_/, '').replace(/\.go\.julex\.shop$/, '').replace(/\.gojulex\.com$/, ''),
          customDomain: t.customDomain || t.tenant?.customDomain,
          vertical: (t.category || t.tenant?.category || '').toLowerCase().includes('jewel') ? 'jewelry' : (t.category || '').toLowerCase().includes('book') ? 'books' : 'clothes',
          categoryLabel: t.category || t.tenant?.category || 'Bespoke D2C Store',
          status: (t.status || 'active').toLowerCase(),
          logo: t.logoUrl || null
        })).filter((x) => x.id);
        if (mapped.length > 0) setBackendStores(mapped);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isSuperAdmin]);
  const demoStores = backendStores || [];

  const resolvedStore = resolveCurrentStore();
  const currentStore = { ...resolvedStore, ...(storeProfileById[resolvedStore.id] || {}) };
  const currentStoreId = currentStore?.id || null;



  // 2. Multi-Store Products State
  const [productsByStore, setProductsByStore] = useState({});

  // 3. Multi-Store Orders State
  const [ordersByStore, setOrdersByStore] = useState({});

  // 4. Multi-Store Customers State
  const [customersByStore, setCustomersByStore] = useState({});

  // 5. Discounts State
  const [discountsByStore, setDiscountsByStore] = useState({});
  const discounts = discountsByStore[currentStoreId] || [];

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
    razorpay: { enabled: false, keyId: '', autoCapture: false },
    phonepe: { enabled: false, merchantId: '', saltKey: '' },
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

  // Remember only the selected workspace. Commerce records come from the API.
  useEffect(() => {
    if (currentStoreId) localStorage.setItem('gojulex_merchant_store_id', currentStoreId);
  }, [currentStoreId]);

  // One-time backfill: push locally-created coupons to the backend so they
  // validate at checkout (server-side check is authoritative)
  useEffect(() => {
    if (!import.meta.env.VITE_ENABLE_DEMO_BACKFILL || !currentUser) return;
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
    if (!import.meta.env.VITE_ENABLE_DEMO_BACKFILL || !currentUser) return;
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
          if (cancelled || !res?.success || !Array.isArray(res.data)) return;
          setProductsByStore(prev => ({ ...prev, [currentStoreId]: res.data }));
        })
        .catch(() => {});
      api.orders.getAll({ tenantId: currentStoreId })
        .then(res => {
          if (cancelled || !res?.success || !Array.isArray(res.data)) return;
          // Real orders exist in the DB — replace mock/localStorage orders so
          // dashboard KPIs (revenue, order count) reflect actual sales
          setOrdersByStore(prev => ({ ...prev, [currentStoreId]: res.data }));
        })
        .catch(() => {});
      api.customers.forStore(currentStoreId)
        .then(res => {
          if (!cancelled && res?.success && Array.isArray(res.data)) {
            setCustomersByStore(prev => ({ ...prev, [currentStoreId]: res.data }));
          }
        })
        .catch(() => {});
      api.coupons.getAll()
        .then(res => {
          if (!cancelled && res?.success && Array.isArray(res.data)) {
            setDiscountsByStore(prev => ({ ...prev, [currentStoreId]: res.data.map(presentCoupon) }));
          }
        })
        .catch(() => {});
    };
    loadLive();
    window.addEventListener('focus', loadLive);
    return () => { cancelled = true; window.removeEventListener('focus', loadLive); };
  }, [currentUser, currentStoreId]);

  // Current Store Helpers (Strict Isolation for Personal Merchant Accounts)
  const products = productsByStore[currentStoreId] || [];
  const orders = ordersByStore[currentStoreId] || [];
  const customers = customersByStore[currentStoreId] || [];

    // Dynamic Store-Specific KPIs with full fallbacks
  const paidOrders = orders.filter(o => String(o.paymentStatus).toUpperCase() === 'PAID' && String(o.fulfillmentStatus || o.status).toUpperCase() !== 'CANCELLED');
  const totalSalesINR = paidOrders.reduce((sum, o) => sum + Number(o.totalAmountINR || o.totalAmount || 0), 0);
  const todayKey = new Date().toDateString();
  const todaySalesINR = paidOrders.filter(o => new Date(o.date || o.createdAt).toDateString() === todayKey).reduce((sum, o) => sum + Number(o.totalAmountINR || o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const unfulfilledOrdersCount = orders.filter(
    (o) => o.fulfillmentStatus === 'PROCESSING' || o.fulfillmentStatus === 'UNFULFILLED' || o.status === 'Processing'
  ).length;
  const lowStockItemsCount = products.filter((p) => { const stock = Number(p.stockQuantity ?? p.stock ?? 0); return stock > 0 && stock <= 2; }).length;
  const feesSavedINR = 0;

  const kpis = {
    todaySalesINR,
    totalSalesINR,
    totalOrdersCount,
    unfulfilledOrdersCount,
    lowStockItemsCount,
    feesSavedINR,
    averageOrderValue: paidOrders.length > 0 ? Math.round(totalSalesINR / paidOrders.length) : 0
  };

  // Switch Store Handler (Works for Super Admin & Merchants with multiple stores)
  const switchStore = (storeId) => {
    setSelectedStoreId(storeId);
    const storeObj = demoStores.find(s => s.id === storeId);
    try {
      localStorage.setItem('gojulex_merchant_store_id', storeId);
    } catch {}
    showToast(`Switched workspace to ${storeObj?.name || 'Selected Store'}`, 'info');
  };

  // --- ORDER ACTIONS ---
  const updateFulfillmentStatus = async (orderId, newStatus, trackingNumber = '', carrier = '') => {
    const res = await api.orders.updateStatus(orderId, newStatus.toUpperCase(), trackingNumber || undefined, carrier || undefined);
    if (!res?.success) {
      showToast(res?.message || 'Could not update the order.', 'error');
      return false;
    }
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
    return true;
  };

  const recordCodCollection = async (orderId) => {
    const res = await api.orders.collectCod(orderId);
    if (!res?.success) {
      showToast(res?.message || 'Could not record cash collection.', 'error');
      return false;
    }
    setOrdersByStore(prev => ({ ...prev, [currentStoreId]: (prev[currentStoreId] || []).map(o => o.id === orderId ? { ...o, paymentStatus: 'PAID' } : o) }));
    showToast('Cash collection recorded for this order.', 'success');
    return true;
  };

  const sendInvoiceEmail = async () => {
    showToast('Invoice email delivery is not configured yet.', 'info');
    return false;
  };

  // --- PRODUCT ACTIONS with AUTO-STOCK & DYNAMIC VARIANTS RULE ---
  const addProduct = async (productData) => {
    const isVar = Boolean(productData.hasVariants);
    const stockVal = Number(productData.stockQuantity !== undefined ? productData.stockQuantity : (productData.stock || 0));
    const newProduct = {
      id: `prod_${window.crypto.randomUUID()}`,
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

    const res = await api.products.create({ ...newProduct, tenantId: currentStore.id });
    if (!res?.success) {
      showToast(res?.message || 'Could not save product.', 'error');
      return null;
    }
    const saved = res.data || newProduct;
    setProductsByStore(prev => ({ ...prev, [currentStoreId]: [saved, ...(prev[currentStoreId] || [])] }));
    showToast(`Product "${saved.name}" added to catalog!`, 'success');
    return saved;
  };

  const updateProduct = async (productId, updatedFields) => {
    const res = await api.products.update(productId, { ...updatedFields, tenantId: currentStore.id });
    if (!res?.success) {
      showToast(res?.message || 'Could not update product.', 'error');
      return null;
    }
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

    showToast('Product updated successfully', 'success');
    return res.data;
  };

  const deleteProduct = async (productId) => {
    const res = await api.products.delete(productId);
    if (!res?.success) {
      showToast(res?.message || 'Could not delete product.', 'error');
      return false;
    }
    setProductsByStore(prev => {
      const currentList = prev[currentStoreId] || [];
      return { ...prev, [currentStoreId]: currentList.filter(p => p.id !== productId) };
    });
    showToast('Product removed from catalog', 'info');
    return true;
  };

  // --- CUSTOMER ACTIONS ---
  const addCustomer = () => {
    showToast('Customers are added from real store orders. Manual customer creation is not available yet.', 'info');
    return null;
  };

  // --- DISCOUNT ACTIONS ---
  const addDiscount = async (discountData) => {
    if (discountData.type !== 'Total Order Amount Off') {
      showToast('Only percentage discounts on the total order are available.', 'error');
      return null;
    }
    const percent = Number(discountData.value);
    if (!Number.isFinite(percent) || percent <= 0 || percent > 90) {
      showToast('Enter a discount from 1% to 90%.', 'error');
      return null;
    }
    const res = await api.coupons.create({
        code: discountData.code,
        description: discountData.description || `Coupon ${discountData.code}`,
        discountType: 'PERCENT',
        discountValue: percent,
        minOrderAmount: Number(discountData.minOrderValueINR || 0),
        expiresAt: discountData.expiresAt || null,
        isActive: true
      });
    if (!res?.success) {
      showToast(res?.message || 'Could not create coupon.', 'error');
      return null;
    }
    const saved = presentCoupon(res.data);
    setDiscountsByStore(prev => ({ ...prev, [currentStoreId]: [saved, ...(prev[currentStoreId] || [])] }));

    showToast(`Coupon code ${saved.code} created!`, 'success');
    return saved;
  };

  const toggleDiscountStatus = async (discountId) => {
    const target = discounts.find(d => d.id === discountId);
    if (!target?.code) return false;
    const res = await api.coupons.update(target.code, { isActive: target.status !== 'Active' });
    if (!res?.success) {
      showToast(res?.message || 'Could not update coupon.', 'error');
      return false;
    }
    setDiscountsByStore(prev => ({ ...prev, [currentStoreId]: (prev[currentStoreId] || []).map(d => d.id === discountId ? presentCoupon(res.data) : d) }));
    showToast(`Coupon ${target.code} ${target.status === 'Active' ? 'deactivated' : 'activated'}`, 'success');
    return true;
  };

  // --- STORE PROFILE & BRAND IDENTITY ACTIONS ---
  const updateStoreProfile = async (updatedFields) => {
    if (!currentStoreId) return false;
    if (Object.prototype.hasOwnProperty.call(updatedFields, 'customDomain')) {
      showToast('Custom domain changes are not available yet.', 'info');
      return false;
    }
    const allowed = ['name', 'logoUrl', 'profileImageUrl', 'whatsappNumber', 'instagramHandle', 'ownerPhone', 'category'];
    const payload = Object.fromEntries(allowed.filter(key => updatedFields[key] !== undefined).map(key => [key, updatedFields[key]]));
    if (updatedFields.categoryLabel && !payload.category) payload.category = updatedFields.categoryLabel;
    if (Object.keys(payload).length > 0) {
      const res = await api.storeStatus.saveProfile(payload);
      if (!res?.success) { showToast(res?.message || 'Could not save store profile.', 'error'); return false; }
    }
    setStoreProfileById(prev => ({ ...prev, [currentStoreId]: { ...(prev[currentStoreId] || {}), ...updatedFields } }));
    showToast('Store profile saved.', 'success');
    return true;
  };

  const clearAllProducts = async () => {
    for (const product of products) {
      const res = await api.products.delete(product.id);
      if (!res?.success) {
        const refreshed = await api.products.getAll({ tenantId: currentStoreId });
        if (refreshed?.success && Array.isArray(refreshed.data)) {
          setProductsByStore(prev => ({ ...prev, [currentStoreId]: refreshed.data }));
        }
        showToast(res?.message || 'Could not clear the catalog.', 'error');
        return false;
      }
    }
    setProductsByStore(prev => {
      const updated = { ...prev, [currentStoreId]: [] };
      return updated;
    });
    showToast('Catalog reset. Ready for your own custom products!', 'info');
    return true;
  };

  const activeCustomersCount = customers.length;

  return (
    <MerchantAdminContext.Provider
      value={{
        // Stores
        demoStores,
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
        recordCodCollection,
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
