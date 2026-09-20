import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Instagram, Globe, Check, Sliders, ShieldCheck, Sparkles } from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';
import { api } from '../../../services/api';

export const EditSalesChannelModal = ({ isOpen, onClose, initialChannel = 'all' }) => {
  const { currentStore, updateStoreProfile, showToast } = useMerchantAdmin();

  const storeKey = currentStore?.id || 'current_store';

  // Read the current store profile; channel integrations are not active yet.
  const getSavedChannels = () => {
    return {
      whatsappNumber: currentStore?.whatsappNumber || currentStore?.ownerPhone || '',
      instagramHandle: currentStore?.instagramHandle || '',
      customDomain: currentStore?.customDomain || '',
      isWhatsAppEnabled: false,
      isInstagramEnabled: false,
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

  const handleSubmit = async (e) => {
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

    const saved = await updateStoreProfile({
      whatsappNumber: updated.whatsappNumber,
      ownerPhone: updated.whatsappNumber,
      instagramHandle: updated.instagramHandle
    });

    if (saved) {
      showToast('Contact details saved.', 'success');
      onClose();
    } else {
      showToast('Contact details were not saved. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E7D9B5] shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E7D9B5] bg-gradient-to-br from-[#FFF1F2] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFDF5] border border-[#DCC78B] flex items-center justify-center text-[#8A6200]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#0F172A]">Configure Sales Channels</h2>
              <p className="text-xs text-[#374151]">Customize your WhatsApp checkout number, Instagram handle, and domain.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#FFFDF5] transition"
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
                Not available
              </span>
            </div>
            <p className="text-[11px] text-blue-800">
              Custom domain verification and TLS provisioning are not configured yet.
            </p>
            <input
              type="text"
              disabled
              value={formData.customDomain}
              placeholder="Custom domain unavailable"
              className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs font-mono font-bold text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E7D9B5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#374151] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A6200] hover:bg-[#6B4D00] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Contact Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
