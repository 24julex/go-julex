import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';
import { INITIAL_PRODUCTS_BY_STORE, DEMO_STORES } from '../../data/multiVerticalMockData';
import { api } from '../../services/api';
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
        <h2 className="font-serif text-2xl font-bold text-[#0F172A]">Product Not Found</h2>
        <Link to={cleanSubdomain ? `/store/${cleanSubdomain}` : '/catalog'} className="text-[#9F1239] hover:underline text-sm font-semibold">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in text-[#0F172A]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#475569]">
        <Link to={cleanSubdomain ? `/store/${cleanSubdomain}` : '/'} className="hover:text-[#9F1239] transition">
          {matchedStore ? matchedStore.name : 'Home'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={cleanSubdomain ? `/store/${cleanSubdomain}/catalog` : '/catalog'} className="hover:text-[#9F1239] transition">
          Catalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0F172A] font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Display (Gallery + Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-[#FBCBCB] shadow-lg relative">
            <img
              src={product.images?.[selectedImage] || product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-[#9F1239] text-white shadow-md">
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
                    selectedImage === idx ? 'border-[#9F1239] scale-105 shadow-md' : 'border-[#FBCBCB] opacity-70 hover:opacity-100'
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
              <span className="font-bold text-[#9F1239] uppercase tracking-widest text-xs">
                {product.brand || matchedStore?.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                0% Platform Markup
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[#475569] font-mono">
              SKU: {product.sku || product.id} • Category: {product.category || 'Direct Collection'}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-2 shadow-xs">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-black text-[#9F1239]">
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
            <p className="text-[11px] text-[#475569]">
              Inclusive of all taxes & direct-from-maker insured transit.
            </p>
          </div>

          {/* Dynamic Option Sets (Exact Merchant Choices Only) */}
          {productOptionSets.map((optionSet) => {
            const currentVal = selectedDetailOptions[optionSet.name] || optionSet.values[0];
            return (
              <div key={optionSet.id || optionSet.name} className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#9F1239]" /> Select {optionSet.name}
                  </label>
                  <span className="text-xs text-[#9F1239] font-bold">Selected: {currentVal}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {optionSet.values.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedDetailOptions(prev => ({ ...prev, [optionSet.name]: val }))}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                        currentVal === val
                          ? 'bg-[#9F1239] text-white border-[#9F1239] shadow-sm transform scale-105'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-[#9F1239] hover:bg-rose-50'
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
              <div className="flex items-center border border-[#FBCBCB] rounded-2xl bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl text-slate-700 hover:bg-[#fedddd] flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono font-bold text-sm text-[#0F172A]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="w-8 h-8 rounded-xl text-slate-700 hover:bg-[#fedddd] flex items-center justify-center font-bold text-sm cursor-pointer"
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
                    : 'bg-[#9F1239] hover:bg-[#881337] text-white shadow-md shadow-rose-900/20 transform hover:-translate-y-0.5 active:scale-98'
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
                    ? 'bg-[#9F1239] text-white border-[#9F1239]'
                    : 'bg-white border-[#FBCBCB] text-[#9F1239] hover:bg-[#fedddd]'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3 Value Guarantees */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-white border border-[#FBCBCB] text-center text-[11px] shadow-xs">
            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 text-[#9F1239] mx-auto" />
              <span className="font-bold text-[#0F172A] block">100% Authentic</span>
              <p className="text-[#475569] text-[10px]">Direct Studio Origin</p>
            </div>
            <div className="space-y-1">
              <Truck className="w-4 h-4 text-[#9F1239] mx-auto" />
              <span className="font-bold text-[#0F172A] block">Express Delivery</span>
              <p className="text-[#475569] text-[10px]">Insured Pan-India</p>
            </div>
            <div className="space-y-1">
              <Percent className="w-4 h-4 text-[#9F1239] mx-auto" />
              <span className="font-bold text-[#0F172A] block">0% Platform Cut</span>
              <p className="text-[#475569] text-[10px]">Maker Retains 100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[#FBCBCB] pt-10">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#0F172A]">
            Craftsmanship & Backstory
          </h3>
          <p className="text-sm text-[#374151] leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Specifications */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#0F172A]">
            Artisan Specifications
          </h3>
          <div className="rounded-3xl bg-white border border-[#FBCBCB] divide-y divide-[#FBCBCB] text-xs shadow-xs overflow-hidden">
            {product.specs && Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="p-3.5 flex justify-between gap-4">
                <span className="text-[#475569] font-medium">{key}</span>
                <span className="text-[#0F172A] font-bold text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
