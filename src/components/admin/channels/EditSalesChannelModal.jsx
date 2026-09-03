import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Instagram, Globe, Check, Sliders, ShieldCheck, Sparkles } from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';

export const EditSalesChannelModal = ({ isOpen, onClose, initialChannel = 'all' }) => {
  const { currentStore, updateStoreProfile, showToast } = useMerchantAdmin();

  const storeKey = currentStore?.id || 'current_store';

  // Load saved channel overrides
  const getSavedChannels = () => {
    try {
      const saved = localStorage.getItem(`gojulex_store_channels_${storeKey}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      whatsappNumber: currentStore?.ownerPhone || '+91 98765 43210',
      instagramHandle: currentStore?.instagramHandle || `@${(currentStore?.subdomain || currentStore?.id || 'store').replace(/^store_/, '')}_official`,
      customDomain: currentStore?.customDomain || `${(currentStore?.subdomain || 'store').replace(/^store_/, '')}.in`,
      isWhatsAppEnabled: true,
      isInstagramEnabled: true,
      isStorefrontEnabled: true
    };
  };

  const [formData, setFormData] = useState(getSavedChannels());

  useEffect(() => {
    if (isOpen) {
      setFormData(getSavedChannels());
    }
  }, [isOpen, currentStore]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clean formatting
    let cleanInsta = formData.instagramHandle.trim();
    if (!cleanInsta.startsWith('@') && cleanInsta.length > 0) {
      cleanInsta = `@${cleanInsta}`;
    }

    const updated = {
      ...formData,
      instagramHandle: cleanInsta
    };

    // Save to localStorage
    try {
      localStorage.setItem(`gojulex_store_channels_${storeKey}`, JSON.stringify(updated));
      localStorage.setItem(`gojulex_store_channels_${currentStore?.subdomain}`, JSON.stringify(updated));
    } catch {}

    // Update store profile in context
    if (updateStoreProfile) {
      updateStoreProfile({
        ...currentStore,
        ownerPhone: updated.whatsappNumber,
        instagramHandle: updated.instagramHandle,
        customDomain: updated.customDomain
      });
    }

    showToast('Sales channels & social IDs updated successfully! 🎉', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#FBCBCB] shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#FBCBCB] bg-gradient-to-br from-[#FFF1F2] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#0F172A]">Configure Sales Channels</h2>
              <p className="text-xs text-[#374151]">Customize your WhatsApp checkout number, Instagram handle, and domain.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#fedddd] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* WhatsApp Business Number */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Business Checkout Number
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                1-Click UPI Ready
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Customer orders and 1-Click WhatsApp buy links will be sent to this phone number.
            </p>
            <input
              type="text"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-mono font-bold text-[#0F172A] focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>

          {/* Instagram / FB Shop Handle */}
          <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-pink-900 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" /> Instagram & Facebook Handle
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                Catalog Tagging
              </span>
            </div>
            <p className="text-[11px] text-pink-800">
              Your official Instagram handle used for product tags in Reels, Posts, and Bio links.
            </p>
            <input
              type="text"
              required
              value={formData.instagramHandle}
              onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
              placeholder="@yourstore_official"
              className="w-full px-3 py-2 rounded-xl border border-pink-300 bg-white text-xs font-mono font-bold text-[#0F172A] focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
            />
          </div>

          {/* Custom Domain */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> Online Storefront Custom Domain
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                SSL Active
              </span>
            </div>
            <p className="text-[11px] text-blue-800">
              The primary web address where customers access your live storefront.
            </p>
            <input
              type="text"
              required
              value={formData.customDomain}
              onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
              placeholder="e.g. bookstore.in"
              className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs font-mono font-bold text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#FBCBCB] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Channel Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
