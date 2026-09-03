import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  IndianRupee,
  ShieldCheck,
  Globe,
  MessageSquare,
  Instagram,
  Store,
  Tag,
  Check,
  Video
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';

export const ProductModal = ({ isOpen, onClose, editingProduct = null }) => {
  const { currentStore, addProduct, updateProduct } = useMerchantAdmin();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sellingPriceINR: '',
    comparePriceINR: '',
    chargeTax: true,
    stockQuantity: 10,
    description: '',
    imageUrl: '',
    videoUrl: '',
    channels: ['web', 'whatsapp', 'instagram'],
    variants: []
  });

  // Default variants based on store vertical
  const getDefaultVariantsForVertical = (vertical) => {
    switch (vertical) {
      case 'jewelry':
        return [
          { name: 'Metal & Purity', value: '22K BIS Hallmarked Gold' },
          { name: 'Gemstone', value: 'Natural VVS Uncut Diamonds' },
          { name: 'Size / Dimension', value: 'Free Adjustable Size' }
        ];
      case 'shoes':
        return [
          { name: 'Shoe Size', value: 'UK/IND 8 (EU 42)' },
          { name: 'Color / Upper', value: 'Midnight Obsidian & Crimson' },
          { name: 'Sole Material', value: 'High-Traction EVA Rubber' }
        ];
      case 'clothes':
        return [
          { name: 'Garment Size', value: 'M (Medium)' },
          { name: 'Fabric Composition', value: '100% Organic Handwoven Khadi Cotton' },
          { name: 'Colorway', value: 'Indigo Blue' },
          { name: 'Fit Style', value: 'Relaxed Oversized Fit' }
        ];
      case 'millets_food':
        return [
          { name: 'Pack Net Weight', value: '1.0 kg (1000g)' },
          { name: 'Form', value: 'Unpolished Whole Grain' },
          { name: 'Shelf Life', value: '9 Months from MFD' }
        ];
      case 'gift_shop':
        return [
          { name: 'Packaging Type', value: 'Luxury Velvet Rigid Box' },
          { name: 'Personalization', value: 'Custom Embossed Gold Foil Lettering' }
        ];
      default:
        return [
          { name: 'Variant Size', value: 'Standard' },
          { name: 'Material / Finish', value: 'Premium Grade' }
        ];
    }
  };

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        sellingPriceINR: editingProduct.sellingPriceINR || '',
        comparePriceINR: editingProduct.comparePriceINR || '',
        chargeTax: editingProduct.chargeTax ?? true,
        stockQuantity: editingProduct.stockQuantity ?? 10,
        description: editingProduct.description || '',
        imageUrl: editingProduct.imageUrl || '',
        videoUrl: editingProduct.videoUrl || '',
        channels: editingProduct.channels || ['web', 'whatsapp', 'instagram'],
        variants: editingProduct.variants || getDefaultVariantsForVertical(currentStore.vertical)
      });
    } else {
      setFormData({
        name: '',
        category: '',
        sellingPriceINR: '',
        comparePriceINR: '',
        chargeTax: true,
        stockQuantity: 10,
        description: '',
        imageUrl: '',
        videoUrl: '',
        channels: ['web', 'whatsapp', 'instagram'],
        variants: getDefaultVariantsForVertical(currentStore.vertical)
      });
    }
  }, [editingProduct, currentStore, isOpen]);

  if (!isOpen) return null;

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    setFormData({ ...formData, variants: updated });
  };

  const addVariantRow = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: 'Attribute', value: 'Specification' }]
    });
  };

  const removeVariantRow = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const toggleChannel = (channelId) => {
    if (formData.channels.includes(channelId)) {
      setFormData({
        ...formData,
        channels: formData.channels.filter((c) => c !== channelId)
      });
    } else {
      setFormData({
        ...formData,
        channels: [...formData.channels, channelId]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sellingPriceINR) return;

    const defaultImg =
      formData.imageUrl ||
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        imageUrl: defaultImg
      });
    } else {
      addProduct({
        ...formData,
        imageUrl: defaultImg
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 text-[#0F172A]">
      <div className="relative w-full max-w-3xl bg-white border border-[#FBCBCB] rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#FBCBCB] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#D4A017]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#0F172A] font-serif">
                {editingProduct ? 'Edit Product Item' : `Add Product to ${currentStore.name}`}
              </h2>
              <p className="text-xs text-[#374151]">
                Configured with dynamic variant schema for{' '}
                <span className="font-semibold text-[#D4A017]">{currentStore.categoryLabel}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white hover:bg-[#FEE2E2] text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Basic Info */}
          <div className="space-y-3">
            <span className="font-bold text-[#0F172A] block uppercase tracking-wider text-[11px] font-serif">
              1. Basic Product Information
            </span>

            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Product Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Antique Gold Heritage Choker / Running Shoes / Foxtail Millet"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#374151]">Category Tag</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Bridal Sets / Formal Footwear / Organic Flours"
                  className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#374151]">Initial Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
                <span className="text-[10px] text-[#374151]">
                  Auto-Stock Rule: 0 quantity automatically marks product Out of Stock.
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Rich Description & Craftsmanship</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed specifications, material sourcing, care instructions..."
                className="w-full px-3.5 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] placeholder-stone-400 focus:outline-none focus:border-[#BE123C]"
              />
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <span className="font-bold text-[#0F172A] block uppercase tracking-wider text-[11px] flex items-center gap-2 font-serif">
              <IndianRupee className="w-4 h-4 text-emerald-700" /> 2. Pricing & Taxes (0% Fee SaaS)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#374151]">Selling Price (₹ S.P) *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sellingPriceINR}
                  onChange={(e) => setFormData({ ...formData, sellingPriceINR: e.target.value })}
                  placeholder="e.g. 84500"
                  required
                  className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-emerald-800 font-mono font-bold focus:outline-none focus:border-[#BE123C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#374151]">Compare-at Price (₹ Strikethrough)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.comparePriceINR}
                  onChange={(e) => setFormData({ ...formData, comparePriceINR: e.target.value })}
                  placeholder="e.g. 98000"
                  className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#374151] font-mono focus:outline-none focus:border-[#BE123C]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#FBCBCB]">
              <div>
                <p className="font-semibold text-[#0F172A]">Charge Applicable GST on Product</p>
                <p className="text-[10px] text-[#374151]">Automates CGST / SGST split at checkout and in invoices.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, chargeTax: !formData.chargeTax })}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                  formData.chargeTax ? 'bg-[#D4A017] justify-end' : 'bg-stone-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* Dynamic Variant Builder */}
          <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0F172A] block uppercase tracking-wider text-[11px] flex items-center gap-2 font-serif">
                  <Tag className="w-4 h-4 text-[#D4A017]" /> 3. Dynamic Variant Builder ({currentStore.categoryLabel})
                </span>
                <p className="text-[10px] text-[#374151]">
                  Customizable attributes tailored to this vertical.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#fedddd] hover:bg-[#FECDD3] text-[#881337] font-bold text-[11px] border border-[#F8B4B4] transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Attribute
              </button>
            </div>

            <div className="space-y-2">
              {formData.variants.map((variant, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    placeholder="Attribute Name (e.g. Size, Metal, Weight)"
                    className="w-1/3 px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  />
                  <input
                    type="text"
                    value={variant.value}
                    onChange={(e) => handleVariantChange(idx, 'value', e.target.value)}
                    placeholder="Specification (e.g. 22K Gold, UK 9, 1 kg)"
                    className="flex-1 px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantRow(idx)}
                    className="p-2 rounded-2xl bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-600 border border-[#FBCBCB] transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Media Upload & URL Simulation */}
          <div className="space-y-2">
            <span className="font-bold text-[#0F172A] block uppercase tracking-wider text-[11px] flex items-center gap-2 font-serif">
              <Upload className="w-4 h-4 text-[#D4A017]" /> 4. Media & High-Resolution Image URL
            </span>

            <div className="p-4 rounded-3xl border-2 border-dashed border-[#FBCBCB] bg-[#fedddd]/50 hover:border-[#BE123C] transition flex flex-col items-center justify-center text-center space-y-2">
              <Upload className="w-6 h-6 text-slate-400" />
              <p className="font-semibold text-[#0F172A]">Drag & Drop product images or video clips</p>
              <p className="text-[10px] text-[#374151]">Supports JPG, PNG, WEBP, MP4 up to 50MB (CDN Hosted)</p>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Or paste Direct Image URL (https://images.unsplash.com/...)"
                className="w-full max-w-md px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-[11px] focus:outline-none focus:border-[#BE123C]"
              />
            </div>
          </div>

          {/* Publishing Channels */}
          <div className="space-y-2">
            <span className="font-bold text-[#0F172A] block uppercase tracking-wider text-[11px] font-serif">
              5. Publishing Sales Channels
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'web', label: 'Online Store', icon: Globe },
                { id: 'whatsapp', label: 'WhatsApp Catalog', icon: MessageSquare },
                { id: 'instagram', label: 'Instagram / FB', icon: Instagram }
              ].map((channel) => {
                const isSelected = formData.channels.includes(channel.id);
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => toggleChannel(channel.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-[#fedddd] border-[#F8B4B4] text-[#881337] font-bold shadow-xs'
                        : 'bg-white border-[#FBCBCB] text-[#374151] hover:bg-[#fedddd]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{channel.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#FBCBCB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-[#881337] font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#D4A017] hover:bg-[#881337] text-white font-bold shadow-xs transition"
            >
              {editingProduct ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
