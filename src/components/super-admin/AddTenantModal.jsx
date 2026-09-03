import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  X,
  Store,
  CreditCard,
  User,
  Plus,
  Sparkles,
  Globe
} from 'lucide-react';

export const AddTenantModal = ({ isOpen, onClose }) => {
  const { plans, createTenant } = useSuperAdmin();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    customDomain: '',
    category: 'Diamond & Solitaires',
    city: 'Mumbai',
    state: 'Maharashtra',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    planId: 'plan_6mo',
    notes: ''
  });

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({
      ...formData,
      name: val,
      slug: generatedSlug
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedPlan = plans.find((p) => p.id === formData.planId);

    createTenant({
      name: formData.name,
      slug: formData.slug || 'store',
      customDomain: formData.customDomain.trim() ? formData.customDomain.trim() : undefined,
      category: formData.category,
      city: formData.city,
      state: formData.state,
      adminName: formData.adminName,
      adminEmail: formData.adminEmail,
      adminPhone: formData.adminPhone,
      planName: selectedPlan ? selectedPlan.name : 'Pro D2C Storefront',
      pricingINR: selectedPlan ? selectedPlan.priceINR : 14999
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif" style={{ color: 'var(--text-primary)' }}>Provision New Store Instance</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Instantly deploy isolated SaaS tenant environment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Store Trade Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Royal Heritage Horology"
                className="w-full px-3 py-2 rounded-2xl focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Subdomain Slug *</label>
              <div className="flex items-center rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-input)' }}>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  required
                />
                <span className="px-2.5 text-[11px] font-mono whitespace-nowrap" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                  .gojulex.com
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Category Vertical</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              >
                <option value="Diamond & Solitaires">💎 Diamond & Solitaires</option>
                <option value="Boutique Horology">⌚ Boutique Horology</option>
                <option value="Artisan Footwear & Leather">👟 Artisan Footwear & Leather</option>
                <option value="Sustainable Apparel">👗 Sustainable Apparel</option>
                <option value="Millets & Organic Food">🌾 Millets & Organic Food</option>
                <option value="Crafts & Heritage Gifts">🎁 Crafts & Heritage Gifts</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Subscription Plan *</label>
              <select
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.priceINR.toLocaleString('en-IN')}/{p.billingCycle} (0% Fee)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)' }}>
            <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--accent)' }}>
              <User className="w-4 h-4" /> Store Owner Credentials
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Admin Name *</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  placeholder="Rahul Mehta"
                  className="w-full px-3 py-2 rounded-2xl focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Admin Email *</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="owner@brand.com"
                  className="w-full px-3 py-2 rounded-2xl focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                <input
                  type="text"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-2xl focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl font-semibold transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl font-bold flex items-center gap-1.5 shadow-xs transition text-black cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Deploy Tenant Instance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
