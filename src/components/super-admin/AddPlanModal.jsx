import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  X,
  CreditCard,
  Plus,
  Check,
  Percent,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const AddPlanModal = ({ isOpen, onClose, editingPlan = null }) => {
  const { addPlan, editPlan } = useSuperAdmin();

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    priceINR: 18000,
    interval: '6_months',
    trialDays: 14,
    badge: 'Popular',
    isPopular: false,
    description: '',
    features: {
      customDomain: true,
      whatsappSync: true,
      instagramApi: true,
      maxProducts: 'Unlimited',
      platformFeePercent: 0,
      prioritySupport: true,
      customSsl: true,
      analyticsExport: true
    }
  });

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        tagline: editingPlan.tagline || '',
        priceINR: editingPlan.priceINR,
        interval: editingPlan.interval,
        trialDays: editingPlan.trialDays || 14,
        badge: editingPlan.badge || '',
        isPopular: !!editingPlan.isPopular,
        description: editingPlan.description || '',
        features: { ...editingPlan.features }
      });
    } else {
      setFormData({
        name: '',
        tagline: '',
        priceINR: 18000,
        interval: '6_months',
        trialDays: 14,
        badge: 'Popular',
        isPopular: false,
        description: '',
        features: {
          customDomain: true,
          whatsappSync: true,
          instagramApi: true,
          maxProducts: 'Unlimited',
          platformFeePercent: 0,
          prioritySupport: true,
          customSsl: true,
          analyticsExport: true
        }
      });
    }
  }, [editingPlan, isOpen]);

  if (!isOpen) return null;

  const calculateNormalized = () => {
    const p = Number(formData.priceINR) || 0;
    if (formData.interval === 'month') return p;
    if (formData.interval === '6_months') return Math.round(p / 6);
    if (formData.interval === 'year') return Math.round(p / 12);
    return p;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPlan) {
      editPlan(editingPlan.id, formData);
    } else {
      addPlan(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white border border-[#FBCBCB] rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FBCBCB] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif">
                {editingPlan ? 'Edit Subscription Tier' : 'Configure New Subscription Tier'}
              </h3>
              <p className="text-[11px] text-[#374151]">
                Define pricing model, intervals, and feature entitlements JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-[#374151]">Plan Tier Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. 6-Month Growth Suite"
                className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C]"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-[#374151]">Tagline / Subheading</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Predictable flat SaaS pricing with 0% platform commission"
                className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Price (INR ₹) *</label>
              <div className="flex items-center bg-white border border-[#FBCBCB] rounded-2xl px-3 py-2">
                <span className="text-[#9F1239] mr-1.5 font-bold">₹</span>
                <input
                  type="number"
                  value={formData.priceINR}
                  onChange={(e) => setFormData({ ...formData, priceINR: e.target.value })}
                  className="w-full bg-transparent text-[#0F172A] focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Billing Interval *</label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
              >
                <option value="month">Monthly</option>
                <option value="6_months">6 Months (₹18,000 baseline)</option>
                <option value="year">1 Year (₹36,000 baseline)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Free Trial Duration (Days)</label>
              <input
                type="number"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Badge Label (Optional)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Most Popular"
                className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
              />
            </div>
          </div>

          {/* Normalized MRR Highlight */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#FBCBCB] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">
                Normalized MRR Contribution
              </span>
              <p className="text-[11px] text-[#374151]">Calculated formula: Price / Months in Interval</p>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-[#9F1239] font-mono">
                ₹{calculateNormalized().toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>

          {/* Feature Entitlements JSON Toggles */}
          <div className="space-y-3 pt-3 border-t border-[#FBCBCB]">
            <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] flex items-center gap-1.5 font-serif">
              <Sliders className="w-3.5 h-3.5 text-[#9F1239]" /> Feature Entitlements (Policy Toggles)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#FBCBCB] cursor-pointer hover:border-[#BE123C]">
                <span className="text-[#0F172A] font-medium">Custom Domain Support</span>
                <input
                  type="checkbox"
                  checked={formData.features.customDomain}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, customDomain: e.target.checked }
                    })
                  }
                  className="rounded text-[#9F1239] focus:ring-[#BE123C] bg-white border-[#FBCBCB]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#FBCBCB] cursor-pointer hover:border-[#BE123C]">
                <span className="text-[#0F172A] font-medium">WhatsApp Catalog Sync</span>
                <input
                  type="checkbox"
                  checked={formData.features.whatsappSync}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, whatsappSync: e.target.checked }
                    })
                  }
                  className="rounded text-[#9F1239] focus:ring-[#BE123C] bg-white border-[#FBCBCB]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#FBCBCB] cursor-pointer hover:border-[#BE123C]">
                <span className="text-[#0F172A] font-medium">Instagram Shopping API</span>
                <input
                  type="checkbox"
                  checked={formData.features.instagramApi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, instagramApi: e.target.checked }
                    })
                  }
                  className="rounded text-[#9F1239] focus:ring-[#BE123C] bg-white border-[#FBCBCB]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#FBCBCB] cursor-pointer hover:border-[#BE123C]">
                <span className="text-[#0F172A] font-medium">Priority SLA Support</span>
                <input
                  type="checkbox"
                  checked={formData.features.prioritySupport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, prioritySupport: e.target.checked }
                    })
                  }
                  className="rounded text-[#9F1239] focus:ring-[#BE123C] bg-white border-[#FBCBCB]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#374151]">Max Products Quota</label>
                <input
                  type="text"
                  value={formData.features.maxProducts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, maxProducts: e.target.value }
                    })
                  }
                  placeholder="Unlimited or 500"
                  className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#374151]">Platform Fee %</label>
                <div className="flex items-center bg-white border border-[#FBCBCB] rounded-2xl px-3 py-2">
                  <input
                    type="number"
                    value={formData.features.platformFeePercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          platformFeePercent: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full bg-transparent text-[#0F172A] focus:outline-none font-mono"
                  />
                  <Percent className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#FBCBCB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FEE2E2] text-[#881337] border border-[#FBCBCB] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" /> {editingPlan ? 'Save Changes' : 'Publish Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
