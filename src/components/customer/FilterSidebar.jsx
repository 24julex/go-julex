import React from 'react';
import { Search, X, RotateCcw, Percent, Check, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const FilterSidebar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  onlyDiscounted,
  setOnlyDiscounted,
  priceRange,
  setPriceRange,
  categories,
  brands,
  onReset
}) => {
  return (
    <div
      className="p-6 rounded-3xl border space-y-6 shadow-xs text-xs"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-card)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-serif text-base font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs flex items-center gap-1 transition cursor-pointer font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Search Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
          Search Products & Creators
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, brand, SKU..."
            className="w-full pl-9 pr-8 py-2.5 text-xs rounded-2xl focus:outline-none transition"
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-input)',
              color: 'var(--text-primary)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Discount Only Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setOnlyDiscounted(!onlyDiscounted)}
          className="w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition cursor-pointer"
          style={
            onlyDiscounted
              ? { backgroundColor: 'rgba(212,160,23,0.15)', borderColor: 'rgba(212,160,23,0.3)', color: 'var(--accent)' }
              : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--text-secondary)' }
          }
        >
          <span className="flex items-center gap-2">
            <Percent className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Privilege Deals Only
          </span>
          <div
            className="w-4 h-4 rounded border flex items-center justify-center"
            style={
              onlyDiscounted
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#000' }
                : { borderColor: 'var(--border-input)' }
            }
          >
            {onlyDiscounted && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
          D2C Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className="w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
            style={
              selectedCategory === ''
                ? { backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', fontWeight: 700 }
                : { color: 'var(--text-secondary)' }
            }
          >
            <span>All Categories</span>
            {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-amber-500" />}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
              className="w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
              style={
                selectedCategory === category
                  ? { backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', fontWeight: 700 }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <span>{category}</span>
              {selectedCategory === category && <Check className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
          Artisan Studio & Brand
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedBrand('')}
            className="w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
            style={
              selectedBrand === ''
                ? { backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', fontWeight: 700 }
                : { color: 'var(--text-secondary)' }
            }
          >
            <span>All Studios</span>
            {selectedBrand === '' && <Check className="w-3.5 h-3.5 text-amber-500" />}
          </button>
          {brands.map((b) => {
            const brandName = b.name || b;
            return (
              <button
                key={brandName}
                type="button"
                onClick={() => setSelectedBrand(selectedBrand === brandName ? '' : brandName)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer"
                style={
                  selectedBrand === brandName
                    ? { backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', fontWeight: 700 }
                    : { color: 'var(--text-secondary)' }
                }
              >
                <span>{brandName}</span>
                {selectedBrand === brandName && <Check className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Max Price (INR ₹)
          </label>
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>
            {formatCurrency(priceRange)}
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="200000"
          step="5000"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500"
          style={{ backgroundColor: 'var(--bg-input)' }}
        />
        <div className="flex justify-between text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>₹5,000</span>
          <span>₹2,00,000</span>
        </div>
      </div>
    </div>
  );
};
