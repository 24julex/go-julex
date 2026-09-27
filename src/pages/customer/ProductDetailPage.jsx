import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { INITIAL_PRODUCTS_BY_STORE, DEMO_STORES } from '../../data/multiVerticalMockData';
import { api } from '../../services/api';
import { BOTAN, BOTAN_SERIF, BOTAN_SANS } from '../../data/botanicalTheme';
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Award,
  Store,
  Percent,
  Check,
  SlidersHorizontal
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id, subdomain } = useParams();
  const { products: globalProducts, addReview } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist, showToast, coupons, applyCoupon, activeCoupon } = useCart();

  const cleanSubdomain = (subdomain || '').toLowerCase().replace(/\.gojulex\.com$/, '');
  const matchedStore = cleanSubdomain ? DEMO_STORES.find(s => s.subdomain?.includes(cleanSubdomain) || s.id?.includes(cleanSubdomain)) || { name: cleanSubdomain.toUpperCase() + ' STORE' } : null;

  // Search store-specific products first if in a subdomain, or look across all stores in localStorage
  const localProduct = useMemo(() => {
    // 1. If subdomain specified, look in store products
    if (cleanSubdomain) {
      try {
        const directKeys = [
          `gojulex_store_products_${cleanSubdomain}`,
          `gojulex_store_products_store_${cleanSubdomain}`,
          `gojulex_store_products_${matchedStore?.id}`
        ];
        for (const k of directKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const found = list.find(p => String(p.id) === String(id));
              if (found) return found;
            }
          }
        }
        const merchantProdsRaw = localStorage.getItem('gojulex_merchant_products');
        if (merchantProdsRaw) {
          const allByStore = JSON.parse(merchantProdsRaw);
          const list = allByStore[cleanSubdomain] || allByStore[`store_${cleanSubdomain}`] || (matchedStore?.id && allByStore[matchedStore.id]);
          if (Array.isArray(list)) {
            const found = list.find(p => String(p.id) === String(id));
            if (found) return found;
          }
        }
        const initialFromData = INITIAL_PRODUCTS_BY_STORE[cleanSubdomain] || INITIAL_PRODUCTS_BY_STORE[`store_${cleanSubdomain}`] || (matchedStore?.id && INITIAL_PRODUCTS_BY_STORE[matchedStore.id]);
        if (Array.isArray(initialFromData)) {
          const found = initialFromData.find(p => String(p.id) === String(id));
          if (found) return found;
        }
      } catch (e) {}
    }

    // 2. Look in global products or localStorage across all stores
    try {
      const merchantProdsRaw = localStorage.getItem('gojulex_merchant_products');
      if (merchantProdsRaw) {
        const allByStore = JSON.parse(merchantProdsRaw);
        for (const storeKey in allByStore) {
          const list = allByStore[storeKey];
          if (Array.isArray(list)) {
            const found = list.find(p => String(p.id) === String(id));
            if (found) return found;
          }
        }
      }
    } catch (e) {}

    return globalProducts.find((p) => String(p.id) === String(id)) || globalProducts[0];
  }, [id, cleanSubdomain, globalProducts, matchedStore]);

  // Live database product — stock here reflects real orders (backend deducts
  // on checkout), so it takes priority over localStorage copies and mock data
  const [liveProduct, setLiveProduct] = useState(null);
  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    api.products.getById(id)
      .then(res => {
        if (!cancelled && res?.success && res.data) setLiveProduct(res.data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  const product = liveProduct || localProduct;

  // The store's PUBLISHED template owns this page for every visitor, exactly
  // like the storefront home and catalog — never a platform-default palette.
  const [storeTheme, setStoreTheme] = useState(null);
  useEffect(() => {
    if (!cleanSubdomain) return undefined;
    let cancelled = false;
    api.themes.getPublicConfig(cleanSubdomain)
      .then((res) => {
        if (!cancelled && res?.success && res?.data?.styles) setStoreTheme(res.data.styles);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [cleanSubdomain]);

  // Storefront marker: keeps the global light/dark overrides from fighting the
  // store's published theme on this page (same as the storefront home).
  useEffect(() => {
    if (!cleanSubdomain) return undefined;
    const rootEl = document.documentElement;
    rootEl.classList.add('jx-storefront');
    return () => rootEl.classList.remove('jx-storefront');
  }, [cleanSubdomain]);

  const themeStyleVars = storeTheme
    ? {
        '--store-accent': storeTheme.accentColor || '#8A6200',
        '--store-ink': storeTheme.headingColor || '#0F172A',
        '--store-muted': storeTheme.textColor || '#475569',
        '--store-bg': storeTheme.backgroundColor || '#FFFDF5',
        '--store-border': (storeTheme.cardBorder || '').match(/#([0-9a-f]{3,8})/i)?.[0] || '#E7D9B5'
      }
    : {};

  // Inside a store the tab belongs to the merchant: "Product — Store Name".
  // Outside one, keep the platform default untouched.
  useEffect(() => {
    if (!product?.name) return undefined;
    const previousTitle = document.title;
    document.title = matchedStore?.name
      ? `${product.name} — ${matchedStore.name}`
      : `${product.name} — Go Julex`;
    return () => { document.title = previousTitle; };
  }, [product?.name, matchedStore?.name]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedDetailOptions, setSelectedDetailOptions] = useState({});

  // Helper to extract exact option sets for a product
  const getProductOptionSets = (prod) => {
    if (!prod) return [];
    if (prod.hasVariants === false) return [];
    if (Array.isArray(prod.optionSets) && prod.optionSets.length > 0) {
      return prod.optionSets.filter(os => Array.isArray(os.values) && os.values.length > 0);
    }
    if (prod.hasVariants) {
      const sets = [];
      if (Array.isArray(prod.availableSizes) && prod.availableSizes.length > 0) {
        sets.push({ id: 'opt_size', name: 'Size', values: prod.availableSizes });
      }
      if (Array.isArray(prod.availableColors) && prod.availableColors.length > 0) {
        sets.push({ id: 'opt_color', name: 'Color', values: prod.availableColors });
      }
      if (Array.isArray(prod.availableFormats) && prod.availableFormats.length > 0) {
        sets.push({ id: 'opt_format', name: 'Edition / Format', values: prod.availableFormats });
      }
      return sets;
    }
    return [];
  };

  const productOptionSets = useMemo(() => getProductOptionSets(product), [product]);

  useEffect(() => {
    if (productOptionSets.length > 0) {
      const initial = {};
      productOptionSets.forEach(os => {
        initial[os.name] = os.values[0];
      });
      setSelectedDetailOptions(initial);
    } else {
      setSelectedDetailOptions({});
    }
  }, [productOptionSets]);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[color:var(--store-ink,#0F172A)]">Product Not Found</h2>
        <Link to={cleanSubdomain ? `/store/${cleanSubdomain}` : '/catalog'} className="text-[color:var(--store-accent,#8A6200)] hover:underline text-sm font-semibold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const { finalPrice, discountAmount } = calculateDiscount(product?.price || 0, product?.discountPercent || 0);
  const isFavorited = product ? isInWishlist(product.id) : false;
  const isOutOfStock = (Number(product?.stockQuantity ?? product?.stock ?? 0) <= 0) || product?.status === 'No' || product?.status === false || product?.available === false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantEntries = Object.entries(selectedDetailOptions);
    const variantLabel = variantEntries.length > 0
      ? variantEntries.map(([k, v]) => `${k}: ${v}`).join(' • ')
      : '';
    const itemWithVariant = {
      ...product,
      variant: variantLabel,
      selectedOptions: selectedDetailOptions,
      storeSubdomain: cleanSubdomain,
      tenantId: matchedStore?.id,
      storeName: matchedStore?.name
    };
    addToCart(itemWithVariant, quantity);
    showToast(`Added ${quantity} unit(s) of "${product.name}"${variantLabel ? ` (${variantLabel})` : ''} to cart!`);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    addReview(product.id, {
      authorName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim()
    });
    setReviewSubmitted(true);
    showToast('Thank you! Your artisan feedback has been posted.');
  };

  // ============================================================
  // BOTANICAL ATELIER PRODUCT PAGE — the store's chosen
  // template owns every page: greige canvas, glass nav,
  // Cormorant serif, olive ink, 4:5 gallery and pill actions.
  // ============================================================
  if (storeTheme?.layoutStyle === 'botanical_atelier' && cleanSubdomain) {
    const gallery = (Array.isArray(product.images) && product.images.length > 0)
      ? product.images
      : [product.imageUrl].filter(Boolean);
    const safeGallery = gallery.length > 0 ? gallery : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'];
    const specs = [];
    try {
      const raw = typeof product.specsJson === 'string' ? JSON.parse(product.specsJson) : product.specs;
      if (raw && typeof raw === 'object') {
        Object.entries(raw).forEach(([k, v]) => {
          if (v !== null && v !== undefined && typeof v !== 'object') specs.push([k, String(v)]);
        });
      }
    } catch (e) {}
    return (
      <div className="min-h-screen" style={{ backgroundColor: BOTAN.bg, color: BOTAN.olive, fontFamily: BOTAN_SANS }}>
        <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'rgba(226,219,210,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: 'rgba(215,207,190,0.5)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
            <Link to={`/store/${cleanSubdomain}`} className="text-2xl font-light tracking-[0.2em]" style={{ fontFamily: BOTAN_SERIF, color: BOTAN.olive }}>
              {matchedStore?.name || 'Atelier'}
            </Link>
            <Link to={`/store/${cleanSubdomain}/catalog`} className="border px-5 py-2 rounded-full text-xs uppercase tracking-widest transition-all" style={{ borderColor: BOTAN.olive, color: BOTAN.olive }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BOTAN.olive; e.currentTarget.style.color = BOTAN.bg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = BOTAN.olive; }}>
              All Curations
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-8" style={{ color: 'rgba(40,70,39,0.7)' }}>
            <Link to={`/store/${cleanSubdomain}`} className="hover:underline">Atelier</Link> · <Link to={`/store/${cleanSubdomain}/catalog`} className="hover:underline">Curations</Link> · {product.category || 'Botanical Work'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Gallery */}
            <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-28">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border-4 shadow-xl" style={{ borderColor: BOTAN.bg, backgroundColor: 'rgba(215,207,190,0.4)' }}>
                <img src={safeGallery[Math.min(selectedImage, safeGallery.length - 1)]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {safeGallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {safeGallery.map((img, idx) => (
                    <button key={idx} type="button" onClick={() => setSelectedImage(idx)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${idx === selectedImage ? 'scale-105' : 'opacity-70 hover:opacity-100'}`} style={{ borderColor: idx === selectedImage ? BOTAN.olive : BOTAN.sand }}>
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                {product.brand && (
                  <span className="text-xs uppercase tracking-[0.3em] font-semibold block" style={{ color: 'rgba(40,70,39,0.7)' }}>{product.brand}</span>
                )}
                <h1 className="text-4xl sm:text-5xl font-light leading-tight" style={{ fontFamily: BOTAN_SERIF, color: BOTAN.olive }}>{product.name}</h1>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-semibold" style={{ color: BOTAN.olive }}>₹{Number(finalPrice || 0).toLocaleString('en-IN')}</span>
                  {product.discountPercent > 0 && (
                    <>
                      <span className="text-sm line-through" style={{ color: 'rgba(40,70,39,0.5)' }}>₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase" style={{ backgroundColor: BOTAN.olive, color: BOTAN.bg }}>{product.discountPercent}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              {product.description && (
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(40,70,39,0.8)' }}>{product.description}</p>
              )}

              {productOptionSets.length > 0 && (
                <div className="space-y-5">
                  {productOptionSets.map((os) => (
                    <div key={os.id || os.name} className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.25em] font-semibold block" style={{ color: 'rgba(40,70,39,0.7)' }}>Select {os.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {os.values.map((val) => (
                          <button key={val} type="button" onClick={() => setSelectedDetailOptions((prev) => ({ ...prev, [os.name]: val }))}
                            className="px-4 py-2 rounded-full border text-xs transition-all cursor-pointer"
                            style={selectedDetailOptions[os.name] === val ? { backgroundColor: BOTAN.olive, color: BOTAN.bg, borderColor: BOTAN.olive } : { borderColor: 'rgba(40,70,39,0.4)', color: BOTAN.olive }}>
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {specs.length > 0 && (
                <div className="p-5 rounded-2xl border" style={{ borderColor: BOTAN.sand, backgroundColor: BOTAN.bgLight }}>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-semibold block mb-2" style={{ color: 'rgba(40,70,39,0.7)' }}>Product Specifications</span>
                  <div className="space-y-1 text-xs font-light" style={{ color: 'rgba(40,70,39,0.8)' }}>
                    {specs.map(([k, v]) => (
                      <p key={k}><strong style={{ fontFamily: BOTAN_SERIF, color: BOTAN.olive, fontWeight: 500 }}>{k}:</strong> {v}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <div className="flex items-center rounded-full border" style={{ borderColor: 'rgba(40,70,39,0.4)' }}>
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-lg cursor-pointer" style={{ color: BOTAN.olive }}>−</button>
                  <span className="px-2 text-sm font-semibold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(20, quantity + 1))} className="px-4 py-3 text-lg cursor-pointer" style={{ color: BOTAN.olive }}>+</button>
                </div>
                <button type="button" onClick={handleAddToCart} disabled={isOutOfStock}
                  className="flex-1 px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-md cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: BOTAN.olive, color: BOTAN.bg }}>
                  {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                </button>
              </div>
              <p className="text-[11px] font-light" style={{ color: 'rgba(40,70,39,0.6)' }}>Cash on delivery · 0% platform fee · shipped straight from the atelier</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in min-h-screen text-[color:var(--store-ink,#0F172A)]"
      style={{ ...themeStyleVars, backgroundColor: storeTheme ? 'var(--store-bg)' : undefined, fontFamily: storeTheme?.bodyFont || undefined }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[color:var(--store-muted,#475569)]">
        <Link to={cleanSubdomain ? `/store/${cleanSubdomain}` : '/'} className="hover:text-[color:var(--store-accent,#8A6200)] transition">
          {matchedStore ? matchedStore.name : 'Home'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={cleanSubdomain ? `/store/${cleanSubdomain}/catalog` : '/catalog'} className="hover:text-[color:var(--store-accent,#8A6200)] transition">
          Catalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[color:var(--store-ink,#0F172A)] font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Display (Gallery + Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-[color:var(--store-border,#E7D9B5)] shadow-lg relative">
            <img
              src={product.images?.[selectedImage] || product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-[var(--store-accent,#8A6200)] text-white shadow-md">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-white cursor-pointer ${
                    selectedImage === idx ? 'border-[color:var(--store-accent,#8A6200)] scale-105 shadow-md' : 'border-[color:var(--store-border,#E7D9B5)] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[color:var(--store-accent,#8A6200)] uppercase tracking-widest text-xs">
                {product.brand || matchedStore?.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                0% Platform Markup
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[color:var(--store-ink,#0F172A)] leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[color:var(--store-muted,#475569)] font-mono">
              SKU: {product.sku || product.id} • Category: {product.category || 'Direct Collection'}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-3xl bg-white border border-[color:var(--store-border,#E7D9B5)] space-y-2 shadow-xs">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-black text-[color:var(--store-accent,#8A6200)]">
                {formatCurrency(finalPrice)}
              </span>
              {product.discountPercent > 0 && (
                <span className="font-mono text-base text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            {product.discountPercent > 0 && (
              <p className="text-xs text-emerald-700 font-bold">
                You save {formatCurrency(discountAmount)} ({product.discountPercent}% direct maker discount)
              </p>
            )}
            <p className="text-[11px] text-[color:var(--store-muted,#475569)]">
              Inclusive of all taxes & direct-from-maker insured transit.
            </p>
          </div>

          {/* Dynamic Option Sets (Exact Merchant Choices Only) */}
          {productOptionSets.map((optionSet) => {
            const currentVal = selectedDetailOptions[optionSet.name] || optionSet.values[0];
            return (
              <div key={optionSet.id || optionSet.name} className="p-5 rounded-3xl bg-white border border-[color:var(--store-border,#E7D9B5)] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--store-ink,#0F172A)] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[color:var(--store-accent,#8A6200)]" /> Select {optionSet.name}
                  </label>
                  <span className="text-xs text-[color:var(--store-accent,#8A6200)] font-bold">Selected: {currentVal}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {optionSet.values.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedDetailOptions(prev => ({ ...prev, [optionSet.name]: val }))}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                        currentVal === val
                          ? 'bg-[var(--store-accent,#8A6200)] text-white border-[color:var(--store-accent,#8A6200)] shadow-sm transform scale-105'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-[color:var(--store-accent,#8A6200)] hover:bg-rose-50'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[color:var(--store-border,#E7D9B5)] rounded-2xl bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl text-slate-700 hover:bg-[#FFFDF5] flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono font-bold text-sm text-[color:var(--store-ink,#0F172A)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="w-8 h-8 rounded-xl text-slate-700 hover:bg-[#FFFDF5] flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[var(--store-accent,#8A6200)] hover:bg-[#6B4D00] text-white shadow-md shadow-rose-900/20 transform hover:-translate-y-0.5 active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Sold Out' : `Add to Shopping Bag${Object.values(selectedDetailOptions).length > 0 ? ` (${Object.values(selectedDetailOptions).join(' • ')})` : ''}`}
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product);
                  showToast(isFavorited ? 'Removed from wishlist' : 'Saved to wishlist!');
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer shadow-xs ${
                  isFavorited
                    ? 'bg-[var(--store-accent,#8A6200)] text-white border-[color:var(--store-accent,#8A6200)]'
                    : 'bg-white border-[color:var(--store-border,#E7D9B5)] text-[color:var(--store-accent,#8A6200)] hover:bg-[#FFFDF5]'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3 Value Guarantees */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-white border border-[color:var(--store-border,#E7D9B5)] text-center text-[11px] shadow-xs">
            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 text-[color:var(--store-accent,#8A6200)] mx-auto" />
              <span className="font-bold text-[color:var(--store-ink,#0F172A)] block">100% Authentic</span>
              <p className="text-[color:var(--store-muted,#475569)] text-[10px]">Direct Studio Origin</p>
            </div>
            <div className="space-y-1">
              <Truck className="w-4 h-4 text-[color:var(--store-accent,#8A6200)] mx-auto" />
              <span className="font-bold text-[color:var(--store-ink,#0F172A)] block">Express Delivery</span>
              <p className="text-[color:var(--store-muted,#475569)] text-[10px]">Insured Pan-India</p>
            </div>
            <div className="space-y-1">
              <Percent className="w-4 h-4 text-[color:var(--store-accent,#8A6200)] mx-auto" />
              <span className="font-bold text-[color:var(--store-ink,#0F172A)] block">0% Platform Cut</span>
              <p className="text-[color:var(--store-muted,#475569)] text-[10px]">Maker Retains 100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[color:var(--store-border,#E7D9B5)] pt-10">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-xl font-bold text-[color:var(--store-ink,#0F172A)]">
            Craftsmanship & Backstory
          </h3>
          <p className="text-sm text-[#374151] leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Specifications */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif text-xl font-bold text-[color:var(--store-ink,#0F172A)]">
            Artisan Specifications
          </h3>
          <div className="rounded-3xl bg-white border border-[color:var(--store-border,#E7D9B5)] divide-y divide-[#E7D9B5] text-xs shadow-xs overflow-hidden">
            {product.specs && (() => {
              // Render plain spec values only — structured data like optionSets
              // (variant definitions) is not displayable text
              const rows = Object.entries(product.specs).filter(
                ([key, val]) =>
                  (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') &&
                  String(val).trim() !== '' &&
                  key !== 'optionSets'
              );
              if (rows.length === 0) {
                return (
                  <div className="p-3.5 text-[color:var(--store-muted,#475569)]">No additional specifications listed for this piece.</div>
                );
              }
              return rows.map(([key, val]) => (
                <div key={key} className="p-3.5 flex justify-between gap-4">
                  <span className="text-[color:var(--store-muted,#475569)] font-medium">{key}</span>
                  <span className="text-[color:var(--store-ink,#0F172A)] font-bold text-right">{val}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
