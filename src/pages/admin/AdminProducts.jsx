import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Globe,
  MessageSquare,
  Instagram
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';

export const AdminProducts = () => {
  const { currentStore, products, updateProduct, deleteProduct, clearAllProducts } = useMerchantAdmin();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const availableCategories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name?.toLowerCase().includes(q);
        const matchSku = prod.sku?.toLowerCase().includes(q);
        const matchCat = prod.category?.toLowerCase().includes(q);
        const matchType = prod.productType?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat && !matchType) return false;
      }

      if (categoryFilter !== 'All' && prod.category !== categoryFilter) {
        return false;
      }

      const isAvailable = (Number(prod.stockQuantity) || 0) > 0;
      if (stockStatusFilter === 'in_stock' && !isAvailable) return false;
      if (stockStatusFilter === 'out_of_stock' && isAvailable) return false;

      return true;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  const handleStockDelta = (product, delta) => {
    const currentQty = Number(product.stockQuantity) || 0;
    const newQty = Math.max(0, currentQty + delta);
    updateProduct(product.id, { stockQuantity: newQty });
  };

  const confirmDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  const renderChannelIcons = (channels = ['web']) => {
    return (
      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
        {channels.includes('web') && (
          <span
            title="Online Storefront"
            className="p-1 rounded-lg border"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--accent)' }}
          >
            <Globe className="w-3 h-3" />
          </span>
        )}
        {channels.includes('whatsapp') && (
          <span
            title="WhatsApp Catalog"
            className="p-1 rounded-lg border bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
          >
            <MessageSquare className="w-3 h-3" />
          </span>
        )}
        {channels.includes('instagram') && (
          <span
            title="Instagram Shop"
            className="p-1 rounded-lg border bg-pink-500/10 text-pink-500 border-pink-500/30"
          >
            <Instagram className="w-3 h-3" />
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <Layers className="w-6 h-6" style={{ color: 'var(--accent)' }} /> Products & Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Universal SKU inventory directory for{' '}
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentStore.name}</span> with dynamic
            variant tracking and automatic out-of-stock rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {products.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition whitespace-nowrap cursor-pointer"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Start Fresh (Clear Demo)
            </button>
          )}

          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition transform active:scale-95 whitespace-nowrap text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
          </Link>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="p-4 rounded-3xl border space-y-3 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'All', label: 'All Products' },
            { id: 'in_stock', label: '🟢 In Stock (Status = Yes)' },
            { id: 'out_of_stock', label: '🔴 Out of Stock (Status = No)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStockStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-2xl font-bold transition whitespace-nowrap cursor-pointer ${
                stockStatusFilter === tab.id ? 'text-black' : ''
              }`}
              style={stockStatusFilter === tab.id ? {
                background: 'linear-gradient(135deg, #D4A017, #F5C842)',
              } : {
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Product Name, SKU, Category, or Product Type..."
              className="w-full pl-10 pr-3 py-2 rounded-2xl focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            >
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Existing Products & Inventory Table */}
      <div className="overflow-x-auto rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b uppercase tracking-wider text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th className="py-3.5 px-4">Product Details</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Product Type</th>
              <th className="py-3.5 px-4 text-center">Stock Count</th>
              <th className="py-3.5 px-4 text-right">Price</th>
              <th className="py-3.5 px-4 text-center">Available</th>
              <th className="py-3.5 px-4">Channels</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No products found matching the criteria</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Try resetting your search query or category filters.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const stock = Number(product.stockQuantity) || 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= 2;

                return (
                  <tr key={product.id} className="hover:bg-amber-500/5 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-2xl object-cover border shrink-0"
                          style={{ borderColor: 'var(--border-card)' }}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/products/new?edit=${product.id}`}
                            className="font-bold hover:underline block truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {product.name}
                          </Link>
                          <span className="text-[10px] block font-normal" style={{ color: 'var(--text-muted)' }}>
                            {product.category || 'General Catalog'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {product.sku}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-xl border text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                        {product.productType || product.category || 'Standard'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 border rounded-2xl p-1" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}>
                        <button
                          type="button"
                          onClick={() => handleStockDelta(product, -1)}
                          disabled={stock <= 0}
                          title="Decrease Stock"
                          className="w-6 h-6 rounded-xl font-bold flex items-center justify-center disabled:opacity-30 transition cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                        >
                          -
                        </button>
                        <span
                          className={`w-8 text-center font-mono font-bold ${
                            isOutOfStock
                              ? 'text-rose-500'
                              : isLowStock
                              ? 'text-amber-500'
                              : ''
                          }`}
                          style={!isOutOfStock && !isLowStock ? { color: 'var(--text-primary)' } : {}}
                        >
                          {stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStockDelta(product, 1)}
                          title="Increase Stock"
                          className="w-6 h-6 rounded-xl font-bold flex items-center justify-center transition cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <p className="font-mono font-bold text-emerald-500">
                        ₹{Number(product.sellingPriceINR).toLocaleString('en-IN')}
                      </p>
                      {product.comparePriceINR > product.sellingPriceINR && (
                        <p className="font-mono text-[10px] line-through" style={{ color: 'var(--text-muted)' }}>
                          ₹{Number(product.comparePriceINR).toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> No (Out of Stock)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Yes ({stock} left)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderChannelIcons(product.channels)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/products/new?edit=${product.id}`}
                          title="Edit Product"
                          className="p-1.5 rounded-xl border transition cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(product.id)}
                          title="Delete Product"
                          className="p-1.5 rounded-xl border transition cursor-pointer text-rose-500"
                          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl text-xs border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Confirm Deletion</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Remove this item from the product catalog?</p>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete this product and delist it from Online Web, WhatsApp, and Instagram channels.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 rounded-2xl border font-semibold transition cursor-pointer"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Demo Products Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl text-xs border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Start with Fresh Catalog</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Remove all demo sample products?</p>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)' }}>
              This resets your product catalog to 0 items so you can start adding your own unique creations and custom images.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-2xl border font-semibold transition cursor-pointer"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllProducts();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs cursor-pointer"
              >
                Clear & Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
