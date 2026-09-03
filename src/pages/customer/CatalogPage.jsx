import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { WatchCard } from '../../components/customer/WatchCard';
import { FilterSidebar } from '../../components/customer/FilterSidebar';
import { calculateDiscount } from '../../utils/formatters';
import { INITIAL_PRODUCTS_BY_STORE, DEMO_STORES } from '../../data/multiVerticalMockData';
import { HARMONIOUS_THEME_PRESETS } from '../admin/channels/AdminThemeBuilder';
import { api } from '../../services/api';
import { SlidersHorizontal, ArrowUpDown, X, Store } from 'lucide-react';

export const CatalogPage = () => {
  const { products: globalProducts, categories, brands } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const { subdomain } = useParams();

  const cleanSubdomain = (subdomain || '').toLowerCase().replace(/\.gojulex\.com$/, '');
  const matchedStore = cleanSubdomain ? DEMO_STORES.find(s => s.subdomain?.includes(cleanSubdomain) || s.id?.includes(cleanSubdomain)) || { name: cleanSubdomain.toUpperCase() + ' STORE' } : null;

  // Resolve the store's saved theme (same keys as DynamicStorefrontPage) so the
  // catalog inherits the storefront's activated theme instead of the global default
  const themeStyles = (() => {
    if (!cleanSubdomain) return null;
    try {
      const storeId = matchedStore?.id || `store_${cleanSubdomain}`;
      const saved = localStorage.getItem(`gojulex_store_theme_${storeId}`) ||
                    localStorage.getItem(`gojulex_store_theme_store_${cleanSubdomain}`) ||
                    localStorage.getItem(`gojulex_store_theme_${cleanSubdomain}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.styles) return { ...HARMONIOUS_THEME_PRESETS[0], ...parsed.styles };
      }
    } catch (e) {}
    return { ...HARMONIOUS_THEME_PRESETS[0] };
  })();

  // Map theme styles onto the CSS variables consumed by this page,
  // FilterSidebar and WatchCard. Unset values fall back to the global theme.
  const themeVars = (() => {
    if (!themeStyles) return {};
    const borderHex = (themeStyles.cardBorder || '').match(/#([0-9a-f]{3,8})/i)?.[0];
    const vars = {
      '--accent': themeStyles.accentColor,
      '--bg-page': themeStyles.backgroundColor,
      '--bg-surface': themeStyles.surfaceColor || themeStyles.cardSurface,
      '--bg-subtle': themeStyles.cardSurface || themeStyles.surfaceColor,
      '--bg-input': themeStyles.surfaceColor || themeStyles.backgroundColor,
      '--text-primary': themeStyles.headingColor,
      '--text-secondary': themeStyles.textColor,
      '--text-muted': themeStyles.textColor,
      '--border-card': borderHex,
      '--border-subtle': borderHex,
      '--border-input': borderHex
    };
    return Object.fromEntries(Object.entries(vars).filter(([, v]) => Boolean(v)));
  })();

  const accentButtonStyle = themeVars['--accent']
    ? { backgroundColor: themeVars['--accent'], color: '#FFFFFF' }
    : { background: 'linear-gradient(135deg, #D4A017, #F5C842)' };

  // Layout identity of the active theme — the catalog mirrors the storefront's structure
  const layoutStyle = themeStyles?.layoutStyle || 'haute_atelier';

  // Resolve store-specific products if in a store subdomain
  const localProducts = useMemo(() => {
    if (!cleanSubdomain) return globalProducts;
    try {
      const directKeys = [
        `gojulex_store_products_${cleanSubdomain}`,
        `gojulex_store_products_store_${cleanSubdomain}`,
        `gojulex_store_products_${matchedStore?.id}`
      ];
      for (const k of directKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
      const merchantProdsRaw = localStorage.getItem('gojulex_merchant_products');
      if (merchantProdsRaw) {
        const allByStore = JSON.parse(merchantProdsRaw);
        const directList = allByStore[cleanSubdomain] || allByStore[`store_${cleanSubdomain}`] || (matchedStore?.id && allByStore[matchedStore.id]);
        if (Array.isArray(directList) && directList.length > 0) return directList;
      }
      const initialFromData = INITIAL_PRODUCTS_BY_STORE[cleanSubdomain] || INITIAL_PRODUCTS_BY_STORE[`store_${cleanSubdomain}`] || (matchedStore?.id && INITIAL_PRODUCTS_BY_STORE[matchedStore.id]);
      if (Array.isArray(initialFromData) && initialFromData.length > 0) return initialFromData;
    } catch (e) {}
    return [];
  }, [cleanSubdomain, globalProducts, matchedStore]);

  // Live database catalog — stock reflects real orders (backend deducts on
  // checkout), so it takes priority over localStorage copies and mock data
  const [liveProducts, setLiveProducts] = useState([]);
  useEffect(() => {
    if (!cleanSubdomain) return undefined;
    let cancelled = false;
    const tenantId = matchedStore?.id || `store_${cleanSubdomain}`;
    api.products.getAll({ tenantId })
      .then(res => {
        if (!cancelled && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setLiveProducts(res.data);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [cleanSubdomain, matchedStore && matchedStore.id]);

  const products = cleanSubdomain && liveProducts.length > 0 ? liveProducts : localProducts;

  // Filter States initialized from URL params if available
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [onlyDiscounted, setOnlyDiscounted] = useState(searchParams.get('discount') === 'true');
  const [priceRange, setPriceRange] = useState(200000); // ₹2,00,000 max
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync URL search params
  useEffect(() => {
    const search = searchParams.get('search') || searchParams.get('q');
    if (search !== null) setSearchQuery(search);

    const cat = searchParams.get('cat') || searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);

    const br = searchParams.get('brand');
    if (br !== null) setSelectedBrand(br);

    const disc = searchParams.get('discount');
    if (disc === 'true') setOnlyDiscounted(true);
  }, [searchParams]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setOnlyDiscounted(false);
    setPriceRange(200000);
    setSortBy('featured');
    setSearchParams({});
  };

  // Filter and Sort Engine
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = (product.name || '').toLowerCase().includes(q);
          const matchesBrand = (product.brand || '').toLowerCase().includes(q);
          const matchesCategory = (product.category || '').toLowerCase().includes(q);
          const matchesSku = (product.sku || '').toLowerCase().includes(q);
          if (!matchesName && !matchesBrand && !matchesCategory && !matchesSku) return false;
        }

        // Category filter
        if (selectedCategory && product.category !== selectedCategory) {
          return false;
        }

        // Brand filter
        if (selectedBrand && product.brand !== selectedBrand) {
          return false;
        }

        // Discount only filter
        if (onlyDiscounted && (!product.discountPercent || product.discountPercent <= 0)) {
          return false;
        }

        // Price range filter
        const { finalPrice } = calculateDiscount(product.price, product.discountPercent);
        if (finalPrice > priceRange) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aPrice = calculateDiscount(a.price, a.discountPercent).finalPrice;
        const bPrice = calculateDiscount(b.price, b.discountPercent).finalPrice;

        if (sortBy === 'price-low') return aPrice - bPrice;
        if (sortBy === 'price-high') return bPrice - aPrice;
        if (sortBy === 'discount-high') return (b.discountPercent || 0) - (a.discountPercent || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, onlyDiscounted, priceRange, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory || selectedBrand || onlyDiscounted || priceRange < 200000;

  const storeCategories = useMemo(() => {
    if (cleanSubdomain) {
      const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
      return cats.length > 0 ? cats : [matchedStore?.categoryLabel || 'Fashion & Apparel'];
    }
    return categories;
  }, [cleanSubdomain, products, categories, matchedStore]);

  const storeBrands = useMemo(() => {
    if (cleanSubdomain) {
      const brs = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
      return brs.length > 0 ? brs : [matchedStore?.name || 'Store Brand'];
    }
    return brands;
  }, [cleanSubdomain, products, brands, matchedStore]);

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen"
      style={{ ...themeVars, backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* Header Banner */}
      <div className="pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          {cleanSubdomain && (
            <Link
              to={`/store/${cleanSubdomain}`}
              className="text-xs font-bold hover:underline flex items-center gap-1 mb-2"
              style={{ color: 'var(--accent)' }}
            >
              ← Back to {matchedStore?.name || 'Storefront'}
            </Link>
          )}

          {layoutStyle === 'editorial_zine' && (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-md mb-2"
                style={{ backgroundColor: themeStyles.headingColor || '#141414', color: '#F5F2EC' }}>
                <span style={{ color: themeStyles.accentColor }}>✦</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {matchedStore?.name || 'Store'} — Shop All
                </span>
                <span style={{ color: themeStyles.accentColor }}>✦</span>
              </div>
              <h1
                className="text-4xl sm:text-5xl leading-[1.05] mt-2 uppercase"
                style={{ color: 'var(--text-primary)', fontFamily: themeStyles.headingFont || 'Fraunces', fontWeight: 450 }}
              >
                {cleanSubdomain ? `${matchedStore?.name} Catalog` : 'Artisan & Creator Catalog'}
              </h1>
            </>
          )}

          {layoutStyle === 'playful_pop' && (
            <>
              <span className="inline-block px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-black shadow-md rotate-[-2deg] mb-2"
                style={{ backgroundColor: themeStyles.accentColor || '#FFC700', borderRadius: '9999px' }}>
                ★ {matchedStore?.name || 'Store'} • Shop All
              </span>
              <h1
                className="text-3xl sm:text-5xl uppercase leading-[1.05] mt-1"
                style={{ color: 'var(--text-primary)', fontFamily: themeStyles.headingFont || 'Archivo Black' }}
              >
                {cleanSubdomain ? `${matchedStore?.name} Catalog` : 'Artisan & Creator Catalog'}
              </h1>
            </>
          )}

          {(layoutStyle === 'quiet_luxe' || layoutStyle === 'editorial_boutique') && (
            <>
              <div className="flex items-center gap-3 mb-1">
                <span className="w-10 h-px" style={{ backgroundColor: 'var(--accent)' }} />
                <span className="text-[11px] uppercase tracking-[0.3em] font-semibold" style={{ color: 'var(--accent)' }}>
                  {cleanSubdomain ? `${matchedStore?.name} • Shop All` : '0% Platform Fee D2C Showcase'}
                </span>
                <span className="w-10 h-px" style={{ backgroundColor: 'var(--accent)' }} />
              </div>
              <h1
                className={`text-3xl sm:text-5xl mt-1 ${layoutStyle === 'quiet_luxe' ? 'italic' : ''}`}
                style={{ color: 'var(--text-primary)', fontFamily: themeStyles?.headingFont || 'Playfair Display' }}
              >
                {cleanSubdomain ? `${matchedStore?.name} Catalog` : 'Artisan & Creator Catalog'}
              </h1>
            </>
          )}

          {(layoutStyle === 'haute_atelier' || layoutStyle === 'organic_artisan' || layoutStyle === 'modern_editorial' || layoutStyle === 'neo_tech') && (
            <>
              <span className="text-xs uppercase tracking-widest font-bold font-mono block" style={{ color: 'var(--accent)' }}>
                {cleanSubdomain ? `${matchedStore?.name || 'Store'} • 0% Platform Fee` : '0% Platform Fee D2C Showcase'}
              </span>
              <h1
                className="font-serif text-3xl sm:text-4xl font-bold mt-1"
                style={{ color: 'var(--text-primary)', fontFamily: themeStyles?.headingFont || 'Playfair Display' }}
              >
                {cleanSubdomain ? `${matchedStore?.name} Catalog` : 'Artisan & Creator Catalog'}
              </h1>
            </>
          )}

          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {cleanSubdomain
              ? `Showing ${filteredProducts.length} authentic creation(s) directly from ${matchedStore?.name}`
              : `Showing ${filteredProducts.length} authentic handcrafted creations direct from verified independent makers`}
          </p>
        </div>

        {/* Sort Controls & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border cursor-pointer"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
          >
            <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Filters {hasActiveFilters && '•'}
          </button>

          <div
            className="flex items-center gap-2 border rounded-2xl px-3.5 py-2 text-xs shadow-2xs"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--text-primary)' }}
          >
            <ArrowUpDown className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
            <span style={{ color: 'var(--text-muted)' }} className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <option value="featured" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Featured & Curated</option>
              <option value="price-low" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Price: Low to High (₹)</option>
              <option value="price-high" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Price: High to Low (₹)</option>
              <option value="discount-high" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Biggest Discount %</option>
              <option value="rating" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Highest Maker Rating</option>
              <option value="name" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            onlyDiscounted={onlyDiscounted}
            setOnlyDiscounted={setOnlyDiscounted}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            categories={storeCategories}
            brands={storeBrands}
            onReset={resetFilters}
          />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div
              className="relative ml-auto w-full max-w-xs h-full p-6 overflow-y-auto border-l space-y-6 shadow-2xl"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
            >
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Filter Catalog</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterSidebar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                onlyDiscounted={onlyDiscounted}
                setOnlyDiscounted={setOnlyDiscounted}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                categories={storeCategories}
                brands={storeBrands}
                onReset={resetFilters}
              />

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-2xl font-bold text-xs shadow-md cursor-pointer"
                style={accentButtonStyle}
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          {filteredProducts.length === 0 ? (
            <div
              className="p-16 rounded-3xl text-center border space-y-4 shadow-xs"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}
            >
              <Store className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
              <h3 className="font-serif text-xl font-bold" style={{ color: 'var(--text-primary)' }}>No Creations Found</h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                No items match your active filters. Try expanding your search criteria or reset filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-2xl font-bold text-xs shadow-xs cursor-pointer"
                style={accentButtonStyle}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className={`transition duration-300 overflow-hidden ${
                    layoutStyle === 'playful_pop'
                      ? 'rounded-[1.75rem] border-2 border-black hover:-rotate-1 hover:-translate-y-1 shadow-sm'
                      : layoutStyle === 'editorial_zine'
                      ? 'rounded-xl p-2'
                      : layoutStyle === 'quiet_luxe'
                      ? 'rounded-sm border hover:shadow-lg'
                      : layoutStyle === 'editorial_boutique'
                      ? 'rounded-none border hover:shadow-lg'
                      : ''
                  }`}
                  style={layoutStyle === 'editorial_zine'
                    ? { backgroundColor: ['#F0EBE2', '#DCE5D2', '#EFE3D9', '#E8E4DB'][idx % 4] }
                    : layoutStyle === 'quiet_luxe' || layoutStyle === 'editorial_boutique'
                    ? { borderColor: themeStyles?.cardBorder?.match(/#[0-9a-f]{3,8}/i)?.[0] || '#E3D9CA' }
                    : {}}
                >
                  <WatchCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
