import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Search,
  Percent,
  IndianRupee,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { CouponModal } from '../../components/admin/CouponModal';
import { formatINR } from '../../utils/formatters';

export const AdminCoupons = () => {
  const { showToast, fetchCoupons: refreshCustomerCoupons } = useCart();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchAdminCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.coupons.getAll();
      if (res?.success && Array.isArray(res?.data)) {
        setCoupons(res.data);
      } else {
        // Fallback to active endpoint if needed
        const activeRes = await api.coupons.getActive();
        if (activeRes?.success && Array.isArray(activeRes?.data)) {
          setCoupons(activeRes.data);
        }
      }
    } catch (err) {
      console.error('Error fetching admin coupons:', err);
      showToast('Failed to load coupons from database.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdminCoupons();
  }, [fetchAdminCoupons]);

  const handleCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently remove coupon code "${code}"?`)) {
      return;
    }

    try {
      const res = await api.coupons.delete(id);
      if (res?.success) {
        showToast(`Coupon "${code}" deleted successfully.`);
        setCoupons((prev) => prev.filter((c) => c.id !== id && c.code !== code));
        await refreshCustomerCoupons();
      } else {
        showToast(res?.message || 'Failed to delete coupon.', 'error');
      }
    } catch (err) {
      showToast('Server error while deleting coupon.', 'error');
    }
  };

  const handleToggleActive = async (coupon) => {
    const updatedStatus = !coupon.isActive;
    try {
      const res = await api.coupons.update(coupon.id, { isActive: updatedStatus });
      if (res?.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: updatedStatus } : c))
        );
        showToast(
          updatedStatus ? `Coupon "${coupon.code}" activated.` : `Coupon "${coupon.code}" deactivated.`,
          'info'
        );
        await refreshCustomerCoupons();
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = coupons.filter((c) => c.isActive).length;
  const maxPercent = coupons
    .filter((c) => c.discountType === 'PERCENT' && c.isActive)
    .reduce((max, c) => Math.max(max, c.discountValue), 0);
  const maxFixed = coupons
    .filter((c) => c.discountType === 'FIXED' && c.isActive)
    .reduce((max, c) => Math.max(max, c.discountValue), 0);

  return (
    <div className="space-y-8 text-[#0F172A] pb-16">
      {/* Coupon Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={editingCoupon}
        onSaved={fetchAdminCoupons}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FBCBCB] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Tag className="w-5 h-5 text-[#9F1239]" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Coupons & Privilege Vouchers
            </h1>
          </div>
          <p className="text-xs text-[#374151]">
            Create and manage promo codes displayed to customers during checkout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminCoupons}
            className="p-2.5 rounded-2xl border border-[#FBCBCB] hover:bg-[#FEE2E2] bg-white text-[#881337] transition shadow-xs"
            title="Refresh coupons list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreate}
            className="py-2.5 px-5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create New Coupon
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-[#FBCBCB] bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#374151] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Coupons</span>
            <Tag className="w-4 h-4 text-[#9F1239]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#0F172A]">{coupons.length}</p>
          <p className="text-[10px] text-[#374151]">Configured promo vouchers</p>
        </div>

        <div className="p-5 rounded-3xl border border-[#FBCBCB] bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#374151] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active & Visible</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-700">{activeCount}</p>
          <p className="text-[10px] text-[#374151]">Live in store for customers</p>
        </div>

        <div className="p-5 rounded-3xl border border-[#FBCBCB] bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#374151] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Max Percent Privilege</span>
            <Percent className="w-4 h-4 text-[#9F1239]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#9F1239]">{maxPercent}% OFF</p>
          <p className="text-[10px] text-[#374151]">Highest percentage discount</p>
        </div>

        <div className="p-5 rounded-3xl border border-[#FBCBCB] bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#374151] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Max Flat Cash Voucher</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-800">
            {maxFixed > 0 ? formatINR(maxFixed) : 'None'}
          </p>
          <p className="text-[10px] text-[#374151]">Highest fixed deduction</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#FBCBCB] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code or description..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#BE123C]"
          />
        </div>
        <p className="text-xs text-[#374151]">
          Showing <span className="font-bold text-[#0F172A]">{filteredCoupons.length}</span> of {coupons.length} vouchers
        </p>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl border border-[#FBCBCB] bg-white flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#9F1239] animate-spin" />
          <p className="text-xs text-[#374151] font-semibold tracking-wider uppercase">
            Loading Coupons Registry...
          </p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-[#FBCBCB] bg-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center mx-auto text-[#9F1239]">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0F172A]">No Coupons Found</h3>
          <p className="text-xs text-[#374151] max-w-sm mx-auto">
            {search
              ? `No coupons match your search "${search}".`
              : 'No promo coupons are registered yet. Click below to create the first coupon for your customers.'}
          </p>
          <button
            onClick={handleCreate}
            className="py-2.5 px-5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#FBCBCB] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#FBCBCB] bg-[#FFE4E6]/60 text-[#881337] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Promo Code</th>
                  <th className="py-4 px-6">Privilege Description</th>
                  <th className="py-4 px-6">Discount Rate</th>
                  <th className="py-4 px-6">Order Threshold</th>
                  <th className="py-4 px-6">Status / Visibility</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FBCBCB]/60 text-[#0F172A]">
                {filteredCoupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  return (
                    <tr
                      key={c.id || c.code}
                      className="hover:bg-[#FEE2E2]/40 transition duration-150 group"
                    >
                      {/* Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#9F1239] bg-[#fedddd] border border-[#F8B4B4] px-2.5 py-1 rounded-xl">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="p-1 text-slate-400 hover:text-[#9F1239] transition"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6 max-w-xs">
                        <p className="font-medium text-[#0F172A] line-clamp-1">{c.description}</p>
                        {c.expiresAt && (
                          <p className="text-[10px] text-[#374151] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Expires:{' '}
                            {new Date(c.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>

                      {/* Discount Rate */}
                      <td className="py-4 px-6">
                        {c.discountType === 'PERCENT' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#EAF5EC] border border-emerald-200 text-[#2D6A4F] font-bold">
                            <Percent className="w-3.5 h-3.5" />
                            <span>{c.discountValue}% OFF</span>
                            {c.maxDiscountAmount && (
                              <span className="text-[10px] text-[#374151] font-normal">
                                (Max {formatINR(c.maxDiscountAmount)})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#fedddd] border border-[#F8B4B4] text-[#881337] font-bold">
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>Flat {formatINR(c.discountValue)} OFF</span>
                          </div>
                        )}
                      </td>

                      {/* Threshold */}
                      <td className="py-4 px-6 text-[#374151]">
                        {c.minOrderAmount > 0 ? (
                          <span className="font-semibold text-[#0F172A]">Min {formatINR(c.minOrderAmount)}</span>
                        ) : (
                          <span className="text-slate-400 italic">No minimum</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 border border-rose-200 text-[#9B1C1C]">
                            <XCircle className="w-3 h-3" /> Expired
                          </span>
                        ) : c.isActive ? (
                          <button
                            onClick={() => handleToggleActive(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EAF5EC] border border-emerald-200 text-[#2D6A4F] hover:bg-emerald-100 transition cursor-pointer"
                            title="Click to deactivate"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Active (Visible)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 border border-stone-200 text-[#374151] hover:bg-stone-200 transition cursor-pointer"
                            title="Click to activate"
                          >
                            <XCircle className="w-3 h-3" /> Inactive (Hidden)
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 rounded-xl bg-white border border-[#FBCBCB] hover:bg-[#FEE2E2] text-[#881337] transition"
                            title="Edit coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#9F1239]" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            className="p-2 rounded-xl bg-white border border-[#FBCBCB] hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
