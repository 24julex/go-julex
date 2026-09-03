// In Docker the frontend is served by nginx which proxies /api to the backend;
// locally (npm run dev) it falls back to the direct backend URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to make API requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('gojulex_jwt_token') || localStorage.getItem('chronos_jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`API error on ${endpoint}:`, error);
    return { success: false, message: error.message || 'Network connection error.' };
  }
}

export const api = {
  // Auth endpoints
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    me: () => request('/auth/me'),
    impersonate: (tenantId) =>
      request('/auth/impersonate', {
        method: 'POST',
        body: JSON.stringify({ tenantId })
      }),
    stopImpersonate: () =>
      request('/auth/stop-impersonate', {
        method: 'POST'
      }),
    updateProfile: (profileData) =>
      request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      }),
    changePassword: (currentPassword, newPassword) =>
      request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      }),
    getUsers: () => request('/auth/users')
  },

  // Super Admin Master Invoices
  superAdmin: {
    getInvoices: () => request('/super-admin/invoices'),
    createInvoiceTemplate: (templateData) =>
      request('/super-admin/invoices', {
        method: 'POST',
        body: JSON.stringify(templateData)
      }),
    updateInvoiceTemplate: (id, templateData) =>
      request(`/super-admin/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(templateData)
      }),
    deleteInvoiceTemplate: (id) =>
      request(`/super-admin/invoices/${id}`, {
        method: 'DELETE'
      })
  },

  // Merchant Invoices
  merchant: {
    getInvoiceConfig: (tenantId) => request(`/merchant/invoice-config${tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : ''}`),
    updateInvoiceConfig: (configData) =>
      request('/merchant/invoice-config', {
        method: 'PUT',
        body: JSON.stringify(configData)
      }),
    renderInvoice: (orderId) => request(`/merchant/invoices/render/${orderId}`)
  },

  // Theme Catalog (public read; super-admin writes) — shared by both dashboards
  themes: {
    getOverrides: () => request('/themes'),
    updateOverride: (id, patch) =>
      request(`/themes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(patch)
      }),
    deleteOverride: (id) =>
      request(`/themes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    resetOverrides: () => request('/themes/reset', { method: 'POST' })
  },

  // Store Invoice (public — used by customer checkout invoice preview)
  invoices: {
    getStoreConfig: (tenantId) => request(`/invoices/store-config/${encodeURIComponent(tenantId)}`)
  },

  // Upload Media
  upload: {
    file: (uploadPayload) =>
      request('/upload', {
        method: 'POST',
        body: JSON.stringify(uploadPayload)
      })
  },

  // Products endpoints
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.tenantId) query.append('tenantId', params.tenantId);
      if (params.search) query.append('search', params.search);
      if (params.brand) query.append('brand', params.brand);
      if (params.category) query.append('category', params.category);
      if (params.discount) query.append('discount', params.discount);
      if (params.minPrice) query.append('minPrice', params.minPrice);
      if (params.maxPrice) query.append('maxPrice', params.maxPrice);
      if (params.inStock) query.append('inStock', params.inStock);
      if (params.isFeatured) query.append('isFeatured', params.isFeatured);
      if (params.isNewArrival) query.append('isNewArrival', params.isNewArrival);
      if (params.isBestSeller) query.append('isBestSeller', params.isBestSeller);
      if (params.sort) query.append('sort', params.sort);
      const qs = query.toString();
      return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getCategories: () => request('/products/categories'),
    getFeatured: () => request('/products/featured'),
    getById: (id) => request(`/products/${id}`),
    create: (productData) =>
      request('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      }),
    update: (id, productData) =>
      request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      }),
    updatePricing: (id, price, discountPercent) =>
      request(`/products/${id}/pricing`, {
        method: 'PATCH',
        body: JSON.stringify({ price, discountPercent })
      }),
    updateStock: (id, stock) =>
      request(`/products/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock })
      }),
    delete: (id) =>
      request(`/products/${id}`, {
        method: 'DELETE'
      }),
    getReviews: (id) => request(`/products/${id}/reviews`),
    addReview: (id, reviewData) =>
      request(`/products/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(typeof reviewData === 'object' ? reviewData : { rating: reviewData })
      })
  },

  // Brands endpoints
  brands: {
    getAll: (details = false) => request(`/brands${details ? '?details=true' : ''}`),
    create: (name) =>
      request('/brands', {
        method: 'POST',
        body: JSON.stringify({ name })
      }),
    rename: (name, newName) =>
      request(`/brands/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: JSON.stringify({ newName })
      }),
    delete: (name) =>
      request(`/brands/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      })
  },

  // Orders endpoints
  orders: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.tenantId) query.append('tenantId', params.tenantId);
      if (params.status) query.append('status', params.status);
      if (params.search) query.append('search', params.search);
      const qs = query.toString();
      return request(`/orders${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/orders/${encodeURIComponent(id)}`),
    getUserOrders: (email) => request(`/orders/user/${encodeURIComponent(email)}`),
    create: (orderData) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),
    updateStatus: (id, status, trackingNumber, notes) =>
      request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, trackingNumber, notes })
      }),
    delete: (id) =>
      request(`/orders/${id}`, {
        method: 'DELETE'
      })
  },

  // Coupons endpoints
  coupons: {
    getActive: () => request('/coupons'),
    update: (code, patch) =>
      request(`/coupons/${encodeURIComponent(code)}`, {
        method: 'PUT',
        body: JSON.stringify(patch)
      }),
    validate: (code, cartTotal) =>
      request('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cartTotal })
      }),
    getAll: () => request('/coupons/all'),
    create: (couponData) =>
      request('/coupons', {
        method: 'POST',
        body: JSON.stringify(couponData)
      }),
    update: (id, couponData) =>
      request(`/coupons/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(couponData)
      }),
    delete: (id) =>
      request(`/coupons/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      }),
    validate: (code, cartTotal) =>
      request('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cartTotal })
      })
  },

  // Admin endpoints
  admin: {
    getKPIs: () => request('/admin/kpis'),
    getRecentActivity: () => request('/admin/recent-activity'),
    getAnalytics: () => request('/admin/analytics'),
    getDiscounts: () => request('/admin/discounts'),
    reset: () =>
      request('/admin/reset', {
        method: 'POST'
      })
  },

  // Customers endpoints
  customers: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      const qs = query.toString();
      return request(`/customers${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/customers/${id}`),
    update: (id, data) =>
      request(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/customers/${id}`, {
        method: 'DELETE'
      })
  },

  // Extended Super Admin endpoints
  superAdmin: {
    // Invoice Templates
    getInvoices: () => request('/super-admin/invoices'),
    createInvoiceTemplate: (templateData) =>
      request('/super-admin/invoices', {
        method: 'POST',
        body: JSON.stringify(templateData)
      }),
    updateInvoiceTemplate: (id, templateData) =>
      request(`/super-admin/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(templateData)
      }),
    deleteInvoiceTemplate: (id) =>
      request(`/super-admin/invoices/${id}`, {
        method: 'DELETE'
      }),
    // Tenants
    getTenants: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.plan) query.append('plan', params.plan);
      const qs = query.toString();
      return request(`/super-admin/tenants${qs ? `?${qs}` : ''}`);
    },
    getTenantById: (id) => request(`/super-admin/tenants/${id}`),
    createTenant: (data) =>
      request('/super-admin/tenants', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateTenantStatus: (id, data) =>
      request(`/super-admin/tenants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    // Platform Metrics
    getMetrics: () => request('/super-admin/metrics'),
    // Audit Logs
    getAuditLogs: (params = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.tenantId) query.append('tenantId', params.tenantId);
      if (params.action) query.append('action', params.action);
      const qs = query.toString();
      return request(`/super-admin/audit-logs${qs ? `?${qs}` : ''}`);
    },
    // Merchants
    getMerchants: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      const qs = query.toString();
      return request(`/super-admin/merchants${qs ? `?${qs}` : ''}`);
    },
    // Broadcast
    sendBroadcast: (data) =>
      request('/super-admin/broadcast', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  }
};

export default api;
