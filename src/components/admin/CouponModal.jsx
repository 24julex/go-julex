import React, { useState, useEffect } from 'react';
import { X, Tag, Percent, IndianRupee, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

export const CouponModal = ({ isOpen, onClose, coupon = null, onSaved }) => {
  const { showToast, fetchCoupons } = useCart();
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENT'); // 'PERCENT' | 'FIXED'
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || '');
      setDescription(coupon.description || '');
      setDiscountType(coupon.discountType || 'PERCENT');
      setDiscountValue(coupon.discountValue || 10);
      setMinOrderAmount(coupon.minOrderAmount || 0);
      setMaxDiscountAmount(coupon.maxDiscountAmount || '');
      setExpiresAt(coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : '');
      setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
    } else {
      setCode('');
      setDescription('');
      setDiscountType('PERCENT');
      setDiscountValue(10);
      setMinOrderAmount(0);
      setMaxDiscountAmount('');
      setExpiresAt('');
      setIsActive(true);
    }
    setError('');
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please provide a coupon code.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description / privilege title.');
      return;
    }

    const val = Number(discountValue);
    if (isNaN(val) || val <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }

    if (discountType === 'PERCENT' && val > 90) {
      setError('Percentage discount cannot exceed 90%.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        code: cleanCode,
        description: description.trim(),
        discountType,
        discountValue: val,
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive
      };

      let res;
      if (coupon?.id) {
        res = await api.coupons.update(coupon.id, payload);
      } else {
        res = await api.coupons.create(payload);
      }

      if (res?.success) {
        showToast(
          coupon ? `Coupon "${cleanCode}" updated successfully!` : `Privilege coupon "${cleanCode}" created!`
        );
        await fetchCoupons();
        if (onSaved) onSaved(res.data);
        onClose();
      } else {
        setError(res?.message || 'Failed to save coupon. Please verify all inputs.');
      }
    } catch (err) {
      console.error('Coupon submit error:', err);
      setError('Connection error while saving coupon to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#FBCBCB] bg-white shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-[#0F172A] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center">
              <Tag className="w-5 h-5 text-[#9F1239]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#0F172A] tracking-tight">
                {coupon ? 'Edit Privilege Coupon' : 'Create Privilege Coupon'}
              </h2>
              <p className="text-[11px] text-[#374151] uppercase tracking-wider font-semibold">
                Customer Promo & Discount Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-[#FEE2E2] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-rose-200 text-[#9B1C1C] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coupon Code */}
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Coupon / Promo Code *
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                placeholder="e.g. ROYAL20, FESTIVE15, CHRONOS50K"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#9F1239] font-mono text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#BE123C] uppercase"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Privilege Title / Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Festive Special (20% Off on All Orders)"
              className="w-full px-4 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#BE123C]"
            />
          </div>

          {/* Discount Type Switcher */}
          <div>
            <label className="text-xs font-semibold text-[#374151] block mb-1.5">
              Discount Calculation Type
            </label>
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white border border-[#FBCBCB]">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENT')}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                  discountType === 'PERCENT'
                    ? 'bg-[#9F1239] text-white shadow-xs'
                    : 'text-[#881337] hover:bg-[#FEE2E2]'
                }`}
              >
                <Percent className="w-3.5 h-3.5" /> Percentage (% Off)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('FIXED')}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                  discountType === 'FIXED'
                    ? 'bg-[#9F1239] text-white shadow-xs'
                    : 'text-[#881337] hover:bg-[#FEE2E2]'
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" /> Flat Amount (₹ INR)
              </button>
            </div>
          </div>

          {/* Value and Minimum Order in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                {discountType === 'PERCENT' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹ INR) *'}
              </label>
              <input
                type="number"
                required
                min="1"
                max={discountType === 'PERCENT' ? '90' : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'PERCENT' ? 'e.g. 15' : 'e.g. 50000'}
                className="w-full px-4 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#BE123C] font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                Min. Order Amount (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="0 for no minimum"
                className="w-full px-4 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#BE123C]"
              />
            </div>
          </div>

          {/* Percentage Cap & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {discountType === 'PERCENT' && (
              <div>
                <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                  Max Discount Cap (₹ INR, Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="e.g. 200000 (No limit if empty)"
                  className="w-full px-4 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#BE123C]"
                />
              </div>
            )}

            <div className={discountType !== 'PERCENT' ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-semibold text-[#374151] block mb-1.5">
                Expiry Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#BE123C]"
                />
              </div>
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-white border border-[#FBCBCB]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#9F1239] focus:ring-[#BE123C]"
              />
              <span className="text-xs font-semibold text-[#0F172A]">
                Active & Visible to Customers during checkout
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#FBCBCB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-2xl text-xs font-semibold text-[#881337] hover:bg-[#FEE2E2] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Coupon...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> {coupon ? 'Update Coupon' : 'Create & Publish Coupon'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
