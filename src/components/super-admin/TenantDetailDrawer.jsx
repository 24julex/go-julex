import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  X,
  Store,
  UserCheck,
  Globe,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  User,
  Users,
  Settings,
  Edit,
  Save,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Layers,
  Sparkles,
  Search,
  Package,
  Check
} from 'lucide-react';

export const TenantDetailDrawer = ({ tenantId, isOpen, onClose }) => {
  const {
    tenants,
    plans,
    updateTenant,
    toggleTenantStatus,
    impersonateTenant,
    showToast
  } = useSuperAdmin();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');

  const tenant = tenants.find((t) => t.id === tenantId);

  // Read live products for this tenant in real-time
  const tenantSub = (tenant?.subdomain || tenant?.id || '').toLowerCase().replace(/^store_/, '');
  const tenantProducts = (() => {
    if (!tenant) return [];
    try {
      const keys = [
        `gojulex_store_products_${tenant.id}`,
        `gojulex_store_products_${tenantSub}`,
        `gojulex_store_products_store_${tenantSub}`
      ];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
      const rawAll = localStorage.getItem('gojulex_merchant_products');
      if (rawAll) {
        const parsed = JSON.parse(rawAll);
        const list = parsed[tenant.id] || parsed[tenantSub] || parsed[`store_${tenantSub}`];
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {}
    return [];
  })();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    customDomain: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    planId: '',
    planName: '',
    status: 'active',
    category: '',
    notes: ''
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        customDomain: tenant.customDomain || '',
        adminName: tenant.admin?.name || '',
        adminEmail: tenant.admin?.email || '',
        adminPhone: tenant.admin?.phone || '',
        planId: tenant.planId || '',
        planName: tenant.planName || '',
        status: tenant.status || 'active',
        category: tenant.category || '',
        notes: tenant.notes || ''
      });
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const chosenPlan = plans.find((p) => p.id === formData.planId);
    updateTenant(tenant.id, {
      ...formData,
      planName: chosenPlan ? chosenPlan.name : formData.planName
    });
    showToast(`Store profile "${formData.name}" updated successfully!`, 'success');
  };

  const handleImpersonateClick = () => {
    localStorage.setItem('gojulex_merchant_store_id', tenant.id || `store_${tenant.subdomain}`);
    localStorage.setItem('gojulex_impersonated_tenant', JSON.stringify(tenant));
    impersonateTenant(tenant);
    onClose();
    navigate('/admin');
  };

  const filteredCustomers = (tenant.customers || []).filter((c) => {
    const q = customerSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q);

    const matchesSegment =
      segmentFilter === 'all' || c.segment.toLowerCase() === segmentFilter.toLowerCase();

    return matchesSearch && matchesSegment;
  });

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'More than once':
        return 'bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200';
      case 'Purchased once':
        return 'bg-[#fedddd] text-[#881337] border border-[#F8B4B4]';
      case 'Just a viewer':
        return 'bg-slate-100 text-[#374151] border border-stone-200';
      default:
        return 'bg-slate-100 text-[#374151] border border-stone-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in text-[#0F172A]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-[#FBCBCB] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[#FBCBCB] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={(tenant.logoUrl || tenant.logo || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80')}
                alt={tenant.name}
                className="w-12 h-12 rounded-2xl object-cover border border-[#FBCBCB] shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-[#0F172A] font-serif">{tenant.name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      tenant.status === 'active'
                        ? 'bg-[#EAF5EC] text-[#2D6A4F] border-emerald-200'
                        : tenant.status === 'trialing'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : tenant.status === 'suspended'
                        ? 'bg-red-50 text-[#9B1C1C] border-rose-200'
                        : 'bg-slate-100 text-[#374151] border-stone-200'
                    }`}
                  >
                    {tenant.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#374151] mt-1">
                  <span className="font-mono text-[11px] text-[#9F1239]">{tenant.id}</span>
                  <span>•</span>
                  <span>
                    {(tenant.city || 'Chennai')}, {tenant.state}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleImpersonateClick}
                className="px-3 py-1.5 rounded-xl bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] text-[#881337] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="View as Merchant"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#9F1239]" /> View as Merchant
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#FBCBCB] bg-[#fedddd]/60 px-6 gap-6 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 flex items-center gap-2 border-b-2 transition relative whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-[#BE123C] text-[#0F172A] font-bold'
                  : 'border-transparent text-[#374151] hover:text-[#0F172A]'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#9F1239]" /> Live Store Catalog
              <span className="px-2 py-0.2 rounded-full bg-[#fedddd] text-[10px] font-bold text-[#881337] border border-[#F8B4B4]">
                {tenantProducts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'config'
                  ? 'border-[#BE123C] text-[#0F172A] font-bold'
                  : 'border-transparent text-[#374151] hover:text-[#0F172A]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Store Configuration
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-3 flex items-center gap-2 border-b-2 transition relative whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'border-[#BE123C] text-[#0F172A] font-bold'
                  : 'border-transparent text-[#374151] hover:text-[#0F172A]'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Tenant Customers
              <span className="px-1.5 py-0.2 rounded-full bg-[#fedddd] text-[10px] text-[#881337] border border-[#F8B4B4]">
                {tenant.customers?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-[#BE123C] text-[#0F172A] font-bold'
                  : 'border-transparent text-[#374151] hover:text-[#0F172A]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Commerce Metrics
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 text-xs">
            {/* TAB 0: LIVE STORE PRODUCTS & CATALOG */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Header & Metrics */}
                <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#9F1239]" /> Live Merchant Catalog ({tenantProducts.length} Items)
                    </h4>
                    <p className="text-[11px] text-[#374151] mt-0.5">
                      Products uploaded by the merchant in their console are listed below in real-time.
                    </p>
                  </div>
                  <a
                    href={`/store/${tenantSub}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white text-[10px] font-bold shadow-xs transition"
                  >
                    <span>View Storefront</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Quick Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by title, category, or SKU..."
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[11px] text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  />
                </div>

                {/* Products Table */}
                {tenantProducts.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#fedddd]/30 border border-[#FBCBCB] text-center space-y-2">
                    <Package className="w-8 h-8 mx-auto text-[#9F1239] opacity-60" />
                    <h5 className="font-bold text-[#0F172A] text-xs">No Products Uploaded Yet</h5>
                    <p className="text-[11px] text-[#374151] max-w-sm mx-auto">
                      This merchant hasn't published products to their catalog yet. Use "View as Merchant" to add initial products.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tenantProducts
                      .filter((p) => {
                        const q = productSearch.toLowerCase().trim();
                        if (!q) return true;
                        return (
                          (p.name || '').toLowerCase().includes(q) ||
                          (p.category || '').toLowerCase().includes(q) ||
                          (p.sku || '').toLowerCase().includes(q)
                        );
                      })
                      .map((prod, idx) => {
                        const img = prod.imageUrl || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80';
                        const price = prod.sellingPriceINR || prod.price || 0;
                        const stock = prod.stockQuantity ?? prod.stock ?? 10;
                        const isAvailable = (prod.status === 'Available' || prod.status === true || stock > 0) && prod.status !== 'No';

                        return (
                          <div
                            key={prod.id || idx}
                            className="p-3 rounded-2xl bg-white border border-[#FBCBCB] hover:border-[#BE123C]/50 transition flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={img}
                                alt={prod.name}
                                className="w-12 h-12 rounded-xl object-cover border border-[#FBCBCB] shrink-0 bg-stone-50"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-[#0F172A] truncate">{prod.name}</h5>
                                <div className="flex items-center gap-2 text-[10px] text-[#374151] mt-0.5">
                                  <span className="font-semibold text-[#881337]">{prod.category || tenant.category}</span>
                                  <span>•</span>
                                  <span className="font-mono">{prod.sku || `SKU-${idx + 1}`}</span>
                                  {prod.hasVariants && (
                                    <>
                                      <span>•</span>
                                      <span className="text-purple-700 font-bold">Variants Enabled</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-right">
                              <div>
                                <div className="font-mono font-bold text-xs text-[#9F1239]">
                                  ₹{Number(price).toLocaleString('en-IN')}
                                </div>
                                <div className="text-[10px] text-[#374151]">
                                  Stock: <strong>{stock} units</strong>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  isAvailable
                                    ? 'bg-[#EAF5EC] text-[#2D6A4F] border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {isAvailable ? 'Available' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: STORE CONFIGURATION & EDIT */}
            {activeTab === 'config' && (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Store Profile Fields */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-[#9F1239]" /> Store Identifiers
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Store Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Custom Domain</label>
                      <div className="flex items-center bg-white border border-[#FBCBCB] rounded-2xl overflow-hidden px-3 py-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                        <input
                          type="text"
                          value={formData.customDomain}
                          placeholder="e.g. aurafinejewelry.in"
                          onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                          className="w-full bg-transparent text-[#0F172A] placeholder-stone-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Default Subdomain</label>
                      <input
                        type="text"
                        value={tenant.subdomain}
                        disabled
                        className="w-full px-3 py-2 bg-white/50 border border-[#FBCBCB] rounded-2xl text-slate-400 cursor-not-allowed font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Plan & Subscription */}
                <div className="space-y-4 pt-4 border-t border-[#FBCBCB]">
                  <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#9F1239]" /> Plan & Status
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Assigned Plan</label>
                      <select
                        value={formData.planId}
                        onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                      >
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.priceINR.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Operational Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                      >
                        <option value="active">Active 🟢</option>
                        <option value="trialing">Trialing 🟡</option>
                        <option value="free">Free Tier ⚪</option>
                        <option value="suspended">Suspended 🔴</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Merchant Admin Credentials */}
                <div className="space-y-4 pt-4 border-t border-[#FBCBCB]">
                  <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#9F1239]" /> Primary Merchant Admin
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Owner Name</label>
                      <input
                        type="text"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Email Address</label>
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#374151]">Phone</label>
                      <input
                        type="text"
                        value={formData.adminPhone}
                        onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                      />
                    </div>
                  </div>
                </div>

                {/* Internal Admin Notes */}
                <div className="space-y-2 pt-4 border-t border-[#FBCBCB]">
                  <label className="text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                    Internal Admin Notes & Compliance Audit
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C] text-xs"
                    placeholder="Add operational notes or compliance records..."
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#FBCBCB]">
                  <button
                    type="button"
                    onClick={() => toggleTenantStatus(tenant.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition ${
                      tenant.status === 'suspended'
                        ? 'bg-[#EAF5EC] text-[#2D6A4F] border-emerald-200'
                        : 'bg-red-50 text-[#9B1C1C] border-rose-200'
                    }`}
                  >
                    {tenant.status === 'suspended' ? 'Re-Activate Tenant' : 'Suspend Tenant Store'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FEE2E2] text-[#881337] border border-[#FBCBCB] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: TENANT CUSTOMER DETAILS */}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-xs flex items-center gap-2 font-serif">
                      <Users className="w-4 h-4 text-[#9F1239]" />
                      {tenant.name} Customer Base
                    </h4>
                    <p className="text-[11px] text-[#374151] mt-0.5">
                      Segmented buyer profiles, lifetime spend, and purchase history.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={segmentFilter}
                      onChange={(e) => setSegmentFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[11px] text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                    >
                      <option value="all">All Segments</option>
                      <option value="Purchased once">Purchased Once</option>
                      <option value="More than once">More than once (Repeat)</option>
                      <option value="Just a viewer">Just a viewer</option>
                    </select>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers by name, email, phone, or city..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 text-xs focus:outline-none focus:border-[#BE123C]"
                  />
                </div>

                {/* Customer List */}
                <div className="space-y-2">
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-[#FBCBCB] rounded-3xl">
                      <Users className="w-8 h-8 text-[#9F1239] mx-auto mb-2 opacity-50" />
                      <p className="text-[#374151] text-xs">No customer records matching your filter criteria.</p>
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#FBCBCB] hover:border-[#BE123C] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0F172A]">{customer.name}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getSegmentColor(
                                customer.segment
                              )}`}
                            >
                              {customer.segment}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#374151]">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {customer.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {customer.phone}
                            </span>
                            <span>•</span>
                            <span>{customer.city}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div>
                            <div className="text-xs font-bold text-[#9F1239] font-mono">
                              ₹{customer.totalSpentINR.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-[#374151]">
                              {customer.ordersCount} {customer.ordersCount === 1 ? 'Order' : 'Orders'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: COMMERCE METRICS & AUDIT */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">Store GMV</span>
                    <div className="text-lg font-bold text-[#9F1239] font-mono mt-1">
                      ₹{(tenant.gmvINR ?? 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold">0% Commission charged</span>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">Total Orders</span>
                    <div className="text-lg font-bold text-[#0F172A] font-mono mt-1">
                      {(tenant.totalOrders ?? tenant.ordersCount ?? 0)}
                    </div>
                    <span className="text-[10px] text-[#374151]">
                      AOV: ₹
                      {(tenant.totalOrders ?? tenant.ordersCount ?? 0) > 0
                        ? Math.round((tenant.gmvINR ?? 0) / (tenant.totalOrders ?? tenant.ordersCount ?? 0)).toLocaleString('en-IN')
                        : '0'}
                    </span>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">
                      Normalized MRR
                    </span>
                    <div className="text-lg font-bold text-[#9F1239] font-mono mt-1">
                      ₹{tenant.mrrINR.toLocaleString('en-IN')}/mo
                    </div>
                    <span className="text-[10px] text-[#374151]">{tenant.planName}</span>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">
                      Onboarding Health
                    </span>
                    <div className="text-lg font-bold text-[#0F172A] font-mono mt-1">
                      {tenant.onboardingPercent}%
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold">Catalog & DNS Verified</span>
                  </div>
                </div>

                {/* Feature Entitlements Checklist */}
                <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
                  <h4 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider font-serif">
                    Feature Entitlements (JSON Policy)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-[#0F172A]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Custom Domain: {tenant.features.customDomain ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0F172A]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Catalog Sync: {tenant.features.whatsappSync ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0F172A]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instagram Shopping API: {tenant.features.instagramApi ? 'Connected' : 'Not Connected'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0F172A]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Max Products: {tenant.features.maxProducts}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
