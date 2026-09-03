import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  Percent,
  Truck,
  Gift,
  X
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';

export const AdminDiscounts = () => {
  const { discounts, products, addDiscount, toggleDiscountStatus, showToast } = useMerchantAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'Total Order Amount Off',
    value: 10,
    valueType: 'percentage',
    minOrderValueINR: 0,
    maxUsage: 100,
    expiresAt: '2026-12-31',
    description: '',
    buyProductId: 'all',
    buyProductName: 'Any Product',
    buyQuantity: 1,
    getProductId: 'all',
    getProductName: 'Any Product',
    getQuantity: 1,
    getYDiscountType: 'free'
  });

  const filteredDiscounts = discounts.filter(
    (d) =>
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.buyProductName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.getProductName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDiscount = (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    let typeBadge = 'Discount';
    let autoDesc = formData.description;

    if (formData.type === 'Buy X Get Y (BXGY)') {
      typeBadge = 'BXGY Promo';
      if (!autoDesc.trim()) {
        const discountText = formData.getYDiscountType === 'free' ? 'FREE' : `${formData.value}% OFF`;
        autoDesc = `Buy ${formData.buyQuantity}x ${formData.buyProductName}, Get ${formData.getQuantity}x ${formData.getProductName} ${discountText}`;
      }
    } else if (formData.type === 'Amount Off') {
      typeBadge = `${formData.value}% Off`;
    } else if (formData.type === 'Free Shipping') {
      typeBadge = 'Free Delivery';
    } else if (formData.type === 'Total Order Amount Off') {
      typeBadge = `${formData.value}% Order Off`;
    }

    addDiscount({
      ...formData,
      code: formData.code.toUpperCase().trim(),
      typeBadge,
      description: autoDesc || `${formData.type} (${typeBadge})`,
      value: Number(formData.value),
      minOrderValueINR: Number(formData.minOrderValueINR),
      maxUsage: Number(formData.maxUsage)
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <Tag className="w-6 h-6" style={{ color: 'var(--accent)' }} /> Discounts & Coupons
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {filteredDiscounts.length} Active Rules
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Configure BXGY, Percentage Off, Free Shipping thresholds, and minimum cart value discounts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Discount Rule
        </button>
      </div>

      {/* 2. Search & Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Buy X Get Y (BXGY)', icon: Gift, color: 'text-purple-500' },
          { label: 'Amount Off (Item)', icon: Percent, color: 'text-amber-500' },
          { label: 'Free Shipping Threshold', icon: Truck, color: 'text-emerald-500' },
          { label: 'Total Order % Off', icon: Tag, color: 'text-amber-500' }
        ].map((type, idx) => {
          const Icon = type.icon;
          return (
            <div key={idx} className="p-4 rounded-3xl border space-y-1 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
              <Icon className={`w-5 h-5 ${type.color}`} />
              <p className="font-bold text-xs mt-2" style={{ color: 'var(--text-primary)' }}>{type.label}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Automated checkout evaluation</p>
            </div>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="p-4 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code or discount description..."
            className="w-full pl-10 pr-3 py-2 rounded-2xl text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* 4. Discounts Table */}
      <div className="overflow-x-auto rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b uppercase tracking-wider text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th className="py-3.5 px-4">Coupon Code</th>
              <th className="py-3.5 px-4">Discount Type</th>
              <th className="py-3.5 px-4">Details & Conditions</th>
              <th className="py-3.5 px-4 text-center">Usage Count</th>
              <th className="py-3.5 px-4">Expiry Date</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
            {filteredDiscounts.map((disc) => (
              <tr key={disc.id} className="hover:bg-amber-500/5 transition">
                <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-xl" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
                    {disc.code}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {disc.type}
                </td>

                <td className="py-3.5 px-4" style={{ color: 'var(--text-primary)' }}>
                  <p className="font-medium">{disc.description}</p>
                  
                  {disc.type === 'Buy X Get Y (BXGY)' && (disc.buyProductName || disc.getProductName) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        Buy ({disc.buyQuantity || 1}x): {disc.buyProductName || 'Any Product'}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        Get ({disc.getQuantity || 1}x): {disc.getProductName || 'Any Product'} ({disc.getYDiscountType === 'free' || disc.value === 100 ? 'FREE' : `${disc.value}% OFF`})
                      </span>
                    </div>
                  )}

                  {disc.minOrderValueINR > 0 && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Min Order: ₹{disc.minOrderValueINR.toLocaleString('en-IN')}
                    </p>
                  )}
                </td>

                <td className="py-3.5 px-4 text-center font-mono" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{disc.usedCount}</span> / {disc.maxUsage} used
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  {disc.expiresAt}
                </td>

                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  {disc.status === 'Active' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
                      Expired
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => toggleDiscountStatus(disc.id)}
                    className="px-2.5 py-1 rounded-xl border text-[11px] transition font-semibold cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                  >
                    {disc.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Create Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl text-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Create Discount Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE2026"
                  className="w-full px-3.5 py-2 rounded-2xl font-mono font-bold focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--accent)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  >
                    <option value="Total Order Amount Off">Total Order Amount Off</option>
                    <option value="Amount Off">Item Amount Off</option>
                    <option value="Buy X Get Y (BXGY)">Buy X Get Y (BXGY)</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {formData.type === 'Buy X Get Y (BXGY)' ? 'Discount Value (%)' : 'Discount (%)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-2xl font-bold focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Minimum Order Amount (₹) <span className="text-[10px] font-normal opacity-70">(0 = no minimum)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValueINR}
                    onChange={(e) => setFormData({ ...formData, minOrderValueINR: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-2xl font-bold focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* BUY X GET Y PRODUCT SELECTORS */}
              {formData.type === 'Buy X Get Y (BXGY)' && (
                <div className="p-3.5 rounded-2xl border space-y-3 animate-fade-in" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'rgba(212,160,23,0.3)' }}>
                  <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-amber-500 font-mono">
                      ⚡ Product X & Product Y Assignment
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono font-bold">
                      {products.length} Products in Store
                    </span>
                  </div>

                  {/* BUY PRODUCT X */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold block" style={{ color: 'var(--text-primary)' }}>
                      1. Customer Buys (Product X):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-8">
                        <select
                          value={formData.buyProductId}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            let selectedName = 'Any Product';
                            if (selectedId !== 'all') {
                              const found = products.find(p => String(p.id) === String(selectedId));
                              if (found) selectedName = found.name;
                            }
                            setFormData(prev => ({
                              ...prev,
                              buyProductId: selectedId,
                              buyProductName: selectedName
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                        >
                          <option value="all">🛒 Any Product in Store</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              📦 {p.name} (₹{(p.sellingPriceINR || p.price || 0).toLocaleString('en-IN')})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4 flex items-center gap-1.5">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={formData.buyQuantity}
                          onChange={(e) => setFormData({ ...formData, buyQuantity: Math.max(1, Number(e.target.value)) })}
                          className="w-full px-2.5 py-1.5 rounded-xl font-bold text-xs focus:outline-none text-center"
                          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* GET PRODUCT Y */}
                  <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="text-[11px] font-bold block" style={{ color: 'var(--text-primary)' }}>
                      2. Customer Gets (Product Y):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-8">
                        <select
                          value={formData.getProductId}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            let selectedName = 'Any Product';
                            if (selectedId === 'same') {
                              selectedName = 'Same Product as Buy X';
                            } else if (selectedId !== 'all') {
                              const found = products.find(p => String(p.id) === String(selectedId));
                              if (found) selectedName = found.name;
                            }
                            setFormData(prev => ({
                              ...prev,
                              getProductId: selectedId,
                              getProductName: selectedName
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                        >
                          <option value="all">🛒 Any Product in Store</option>
                          <option value="same">🔄 Same Product as Buy X (e.g. Buy 1 Get 1 Free)</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              🎁 {p.name} (₹{(p.sellingPriceINR || p.price || 0).toLocaleString('en-IN')})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4 flex items-center gap-1.5">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={formData.getQuantity}
                          onChange={(e) => setFormData({ ...formData, getQuantity: Math.max(1, Number(e.target.value)) })}
                          className="w-full px-2.5 py-1.5 rounded-xl font-bold text-xs focus:outline-none text-center"
                          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* GET Y DISCOUNT TYPE */}
                  <div className="pt-2 border-t flex items-center justify-between gap-2 text-[11px]" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Product Y Discount:</span>
                    <select
                      value={formData.getYDiscountType}
                      onChange={(e) => setFormData({ ...formData, getYDiscountType: e.target.value })}
                      className="px-2.5 py-1.5 rounded-xl font-bold text-xs focus:outline-none cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--accent)' }}
                    >
                      <option value="free">🎉 100% FREE (BOGO / Buy X Get Y Free)</option>
                      <option value="percentage">% Percentage Off on Y</option>
                      <option value="fixed">Fixed ₹ Off on Y</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={formData.type === 'Buy X Get Y (BXGY)' ? `e.g. Buy ${formData.buyQuantity}x ${formData.buyProductName}, Get ${formData.getQuantity}x ${formData.getProductName} FREE` : "e.g. Flat 10% Off on orders above ₹3,000"}
                  className="w-full px-3.5 py-2 rounded-2xl focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border font-semibold transition cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl font-bold text-black shadow-xs transition cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                >
                  Save Discount Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
