import React, { useState, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';

export const ProductViewsTable = ({ products, onSelectProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }
      if (categoryFilter !== 'All' && p.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [products, searchQuery, categoryFilter]);

  const maxViews = useMemo(() => {
    if (!products.length) return 1;
    return Math.max(...products.map((p) => p.totalViews));
  }, [products]);

  const getConversionBadge = (rate) => {
    if (rate >= 5.0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          🔥 {rate.toFixed(1)}% (High)
        </span>
      );
    } else if (rate >= 2.0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
          ⚡ {rate.toFixed(1)}% (Average)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
          🔴 {rate.toFixed(1)}% (Low)
        </span>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Category Filter */}
      <div className="p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search viewed product by name or SKU..."
            className="w-full pl-10 pr-3 py-2 rounded-2xl text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-2xl text-xs focus:outline-none cursor-pointer"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b uppercase tracking-wider text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th className="py-3.5 px-4">Product Item</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4 min-w-[140px]">Total Views</th>
              <th className="py-3.5 px-4 text-center">Unique Viewers</th>
              <th className="py-3.5 px-4 text-center">Repeat Velocity</th>
              <th className="py-3.5 px-4 text-center">Carts</th>
              <th className="py-3.5 px-4 text-center">Purchases</th>
              <th className="py-3.5 px-4 text-center">Conversion</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
            {filteredProducts.map((p) => {
              const conversionRate = (p.purchasesCount / p.totalViews) * 100;
              const barWidth = Math.round((p.totalViews / maxViews) * 100);

              return (
                <tr key={p.id} className="hover:bg-amber-500/5 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 min-w-[210px]">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-2xl object-cover border shrink-0"
                        style={{ borderColor: 'var(--border-card)' }}
                      />
                      <div className="min-w-0">
                        <button
                          onClick={() => onSelectProduct(p)}
                          className="font-bold hover:underline text-left block truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {p.name}
                        </button>
                        <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                          {p.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {p.sku}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                        {p.totalViews.toLocaleString('en-IN')} views
                      </span>
                      <div className="w-full h-1.5 rounded-full overflow-hidden border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${barWidth}%`, background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    {p.uniqueVisitors.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    <span className="px-2.5 py-0.5 rounded-xl border text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
                      {p.repeatViewsPerVisitor}x / user
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-amber-500 font-bold whitespace-nowrap">
                    {p.addToCartCount}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-500 whitespace-nowrap">
                    {p.purchasesCount}
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getConversionBadge(conversionRate)}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectProduct(p)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition ml-auto cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                    >
                      <Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
