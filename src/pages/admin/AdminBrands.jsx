import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import {
  Award,
  Plus,
  Trash2,
  Watch,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BRAND_SUGGESTIONS = [
  'Jaeger-LeCoultre',
  'Hublot',
  'Panerai',
  'Zenith',
  'Vacheron Constantin',
  'Chopard',
  'Blancpain',
  'Bell & Ross',
  'A. Lange & Söhne',
  'Girard-Perregaux',
  'Glashütte Original',
  'Ulysse Nardin'
];

export const AdminBrands = () => {
  const { brands, products, addBrand, deleteBrand } = useProducts();
  const [newBrandName, setNewBrandName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddBrand = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newBrandName.trim()) {
      setError('Please enter a valid brand name.');
      return;
    }

    const res = addBrand(newBrandName.trim());
    if (res.success) {
      setSuccess(`Brand "${newBrandName.trim()}" has been successfully added.`);
      setNewBrandName('');
    } else {
      setError(res.message);
    }
  };

  const handleQuickAdd = (brandName) => {
    setError('');
    setSuccess('');
    const res = addBrand(brandName);
    if (res.success) {
      setSuccess(`Brand "${brandName}" added to the catalog.`);
    } else {
      setError(res.message);
    }
  };

  const handleDeleteBrand = (brandName) => {
    const watchCount = products.filter((p) => p.brand.toLowerCase() === brandName.toLowerCase()).length;
    const warning =
      watchCount > 0
        ? `Warning: There are currently ${watchCount} timepieces under "${brandName}". Are you sure you want to delete this brand?`
        : `Are you sure you want to delete the brand "${brandName}"?`;

    if (window.confirm(warning)) {
      deleteBrand(brandName);
      setSuccess(`Brand "${brandName}" was removed.`);
      setError('');
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1 font-serif" style={{ color: 'var(--accent)' }}>
            <Award className="w-4 h-4" /> Brand Registry & Manufactures
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Brand Name Management ({brands.length})
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Add new horological manufactures, remove discontinued brand labels, and manage brand associations.
          </p>
        </div>

        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
        >
          <Watch className="w-4 h-4" style={{ color: 'var(--accent)' }} /> View Catalog
        </Link>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid: Add Form + Quick Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Add Brand Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl border space-y-6 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <Plus className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h2 className="font-serif text-base font-bold" style={{ color: 'var(--text-primary)' }}>Add New Brand Name</h2>
          </div>

          <form onSubmit={handleAddBrand} className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                Manufacture / Brand Name *
              </label>
              <input
                type="text"
                required
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="e.g. Jaeger-LeCoultre"
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-black font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
            >
              <Plus className="w-4 h-4" /> Add Brand to Catalog
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 font-serif" style={{ color: 'var(--accent)' }}>
              <Sparkles className="w-3 h-3" /> Quick Add Popular Luxury Manufactures:
            </span>
            <div className="flex flex-wrap gap-2">
              {BRAND_SUGGESTIONS.map((preset) => {
                const isAlreadyAdded = brands.some((b) => b.toLowerCase() === preset.toLowerCase());
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={isAlreadyAdded}
                    onClick={() => handleQuickAdd(preset)}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer disabled:opacity-40"
                    style={isAlreadyAdded ? {
                      backgroundColor: 'var(--bg-subtle)',
                      borderColor: 'var(--border-card)',
                      color: 'var(--text-muted)'
                    } : {
                      backgroundColor: 'var(--bg-subtle)',
                      borderColor: 'var(--border-card)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {preset} {isAlreadyAdded && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Active Brands Catalog */}
        <div className="lg:col-span-7 p-6 rounded-3xl border space-y-6 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h2 className="font-serif text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Active Brands ({filteredBrands.length})</h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Available across customer search filters and product creator</p>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-2xl focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredBrands.map((brandName) => {
              const watchCount = products.filter((p) => p.brand.toLowerCase() === brandName.toLowerCase()).length;

              return (
                <div
                  key={brandName}
                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition group shadow-xs"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {brandName}
                      </h4>
                      <Link
                        to={`/catalog?brand=${encodeURIComponent(brandName)}`}
                        className="text-[11px] flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {watchCount} {watchCount === 1 ? 'timepiece' : 'timepieces'} in vault <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBrand(brandName)}
                    className="p-2 rounded-xl transition text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    title={`Delete ${brandName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
