import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { Percent, IndianRupee, X, Check } from 'lucide-react';

export const QuickDiscountModal = ({ product, isOpen, onClose }) => {
  const { updatePricingAndDiscount } = useProducts();

  const [price, setPrice] = useState(product?.price || 0);
  const [discountPercent, setDiscountPercent] = useState(product?.discountPercent || 0);

  if (!isOpen || !product) return null;

  const { finalPrice, discountAmount } = calculateDiscount(price, discountPercent);

  const handleSave = (e) => {
    e.preventDefault();
    updatePricingAndDiscount(product.id, price, discountPercent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#FBCBCB] bg-white p-6 space-y-6 shadow-2xl animate-fade-in text-[#0F172A]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FBCBCB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center">
              <Percent className="w-5 h-5 text-[#9F1239]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Rate & Discount Adjuster (INR ₹)</h3>
              <p className="text-xs text-[#374151] truncate max-w-xs">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#FEE2E2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-4">
            {/* Price (Rate in INR) */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#374151] block mb-1">
                Base Rate (Original Price in INR ₹)
              </label>
              <div className="relative">
                <span className="text-[#9F1239] font-bold absolute left-3.5 top-1/2 -translate-y-1/2">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-mono focus:outline-none focus:border-[#BE123C]"
                />
              </div>
            </div>

            {/* Discount Percent */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
                  Discount Rate (%)
                </label>
                <span className="text-xs font-bold text-[#9F1239]">{discountPercent}% Off</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full accent-[#BE123C] cursor-pointer"
              />
              <div className="flex gap-2 pt-2">
                {[0, 10, 15, 20, 25, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`flex-1 py-1 rounded-xl text-[11px] font-bold border transition ${
                      discountPercent === pct
                        ? 'bg-[#9F1239] text-white border-[#BE123C] shadow-xs'
                        : 'bg-white border-[#FBCBCB] text-[#881337] hover:bg-[#FEE2E2]'
                    }`}
                  >
                    {pct === 0 ? 'None' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Calculated Preview */}
          <div className="p-4 rounded-2xl bg-white border border-[#FBCBCB] space-y-2 text-xs">
            <span className="text-[10px] font-bold text-[#881337] uppercase tracking-wider block font-serif">
              Calculated Customer Pricing Preview (INR)
            </span>
            <div className="flex justify-between text-[#374151]">
              <span>Original Rate:</span>
              <span className="font-mono text-[#0F172A]">{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Customer Savings:</span>
              <span className="font-mono">-{formatCurrency(discountAmount)} ({discountPercent}%)</span>
            </div>
            <div className="flex justify-between text-[#0F172A] font-bold pt-2 border-t border-[#FBCBCB] text-sm">
              <span>Effective Selling Price:</span>
              <span className="font-mono text-emerald-800">{formatCurrency(finalPrice)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#374151] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs flex items-center gap-2 transition shadow-xs"
            >
              <Check className="w-4 h-4" /> Save Rate & Discounts (₹)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
