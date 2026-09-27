import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatINR } from '../../utils/formatters';
import { StorefrontModeToggle } from '../../components/customer/StorefrontModeToggle';
import { api } from '../../services/api';
import { BOTAN, BOTAN_SERIF, BOTAN_SANS } from '../../data/botanicalTheme';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  X,
  Percent,
  Check,
  Sparkles,
  Gift,
  CheckCircle2,
  Store,
  ChevronRight,
  Zap
} from 'lucide-react';

export const CartPage = () => {
  const {
    cartItems: allCartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedPromo,
    availableCoupons,
    applyPromoCode,
    removePromoCode,
    getCartTotals
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const navigate = useNavigate();
  const { subdomain: routeSubdomain } = useParams();
  const cleanSub = String(routeSubdomain || allCartItems[0]?.storeSubdomain || '').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');
  // STRICT MULTI-TENANT CART ISOLATION: on a store's own cart page only THAT
  // store's items exist — no other store's products, no platform content.
  const belongsToStore = (it) => {
    const itSub = String(it.storeSubdomain || it.tenantId || '').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');
    return !cleanSub || itSub === cleanSub;
  };
  const cartItems = allCartItems.filter(belongsToStore);


  // The store's PUBLISHED template owns this page too.
  const [botanTheme, setBotanTheme] = useState(null);
  useEffect(() => {
    if (!cleanSub) return undefined;
    let cancelled = false;
    api.themes.getPublicConfig(cleanSub)
      .then((res) => { if (!cancelled && res?.success && res?.data?.styles) setBotanTheme(res.data.styles); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [cleanSub]);

  const {
    originalSubtotal,
    discountedSubtotal,
    productSavings,
    promoSavings,
    totalSavings,
    finalAmount,
    itemCount
  } = getCartTotals(cartItems);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const result = applyPromoCode(promoInput);
    if (!result.success) {
      setPromoError(result.message);
    } else {
      setPromoInput('');
    }
  };

  const handleQuickApply = (code) => {
    setPromoError('');
    applyPromoCode(code);
  };


  // Theme tokens from the store's PUBLISHED template — the selected theme
  // drives every page's colors/typography (single source of truth).
  const themeVars = (() => {
    const s = botanTheme;
    if (!s) return {};
    const borderHex = String(s.cardBorder || '').match(/#([0-9a-f]{3,8})/i)?.[0];
    const vars = {
      '--bg-page': s.backgroundColor,
      '--bg-soft': s.surfaceColor || s.backgroundColor,
      '--accent': s.accentColor,
      '--accent-dark': s.accentColor,
      '--heading': s.headingColor,
      '--text': s.textColor
    };
    if (borderHex) vars['--border'] = borderHex;
    if (s.bodyFont) vars.fontFamily = `'${s.bodyFont}', sans-serif`;
    return vars;
  })();

  // Mark <html> as a merchant storefront while mounted: the global light/dark
  // overrides are scoped away from .jx-storefront so the published theme's
  // colors render exactly as designed (same as every other store page).
  useEffect(() => {
    if (!cleanSub) return undefined;
    const rootEl = document.documentElement;
    rootEl.classList.add('jx-storefront');
    return () => rootEl.classList.remove('jx-storefront');
  }, [cleanSub]);

  // A store visitor who lands on the PLATFORM cart route is sent straight
  // into their store's own themed cart — no unthemed platform pages.
  if (!routeSubdomain && cleanSub) {
    return <Navigate to={`/store/${cleanSub}/cart`} replace />;
  }

  // ============================================================
  // BOTANICAL ATELIER BAG — the store's chosen template owns
  // this page: glass nav, greige canvas, olive ink, pill
  // quantity steppers and an olive checkout action.
  // ============================================================
  if (botanTheme?.layoutStyle === 'botanical_atelier' && cleanSub) {
    const botanGlassNav = (
      <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'rgba(226,219,210,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: 'rgba(215,207,190,0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link to={`/store/${cleanSub}`} className="text-2xl font-light tracking-[0.2em]" style={{ fontFamily: BOTAN_SERIF, color: BOTAN.olive }}>
            {cartItems[0]?.storeName || 'Atelier'}
          </Link>
          <Link to={`/store/${cleanSub}/catalog`} className="border px-5 py-2 rounded-full text-xs uppercase tracking-widest transition-all" style={{ borderColor: BOTAN.olive, color: BOTAN.olive }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BOTAN.olive; e.currentTarget.style.color = BOTAN.bg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = BOTAN.olive; }}>
            Continue Curations
          </Link>
        </div>
      </header>
    );

    if (cartItems.length === 0) {
      return (
        <div className="min-h-screen" style={{ backgroundColor: BOTAN.bg, color: BOTAN.olive, fontFamily: BOTAN_SANS }}>
          <StorefrontModeToggle accent={BOTAN.olive} />
          {botanGlassNav}
          <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-6" strokeWidth={1.2} style={{ color: BOTAN.olive }} />
            <h1 className="text-4xl font-light mb-3" style={{ fontFamily: BOTAN_SERIF }}>Your bag is empty</h1>
            <p className="text-sm font-light mb-10" style={{ color: 'rgba(40,70,39,0.7)' }}>Nothing curated yet — return to the atelier and add a botanical work.</p>
            <Link to={`/store/${cleanSub}/catalog`} className="inline-block px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.2em] shadow-md" style={{ backgroundColor: BOTAN.olive, color: BOTAN.bg }}>
              Browse the Curations
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ backgroundColor: BOTAN.bg, color: BOTAN.olive, fontFamily: BOTAN_SANS }}>
        <StorefrontModeToggle accent={BOTAN.olive} />
        {botanGlassNav}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold block mb-3" style={{ color: 'rgba(40,70,39,0.7)' }}>Your Selection</span>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-10" style={{ fontFamily: BOTAN_SERIF }}>
            The Shopping Bag <span className="text-lg align-middle font-normal">({itemCount} {itemCount === 1 ? 'work' : 'works'})</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Items */}
            <div className="lg:col-span-7 space-y-5">
              {cartItems.map((item) => (
                <div key={item.cartItemId || item.id} className="flex gap-5 p-4 rounded-3xl border" style={{ borderColor: BOTAN.sand, backgroundColor: 'rgba(236,231,225,0.5)' }}>
                  <Link to={`/store/${cleanSub}/product/${item.id}`} className="w-24 sm:w-28 aspect-[4/5] rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: 'rgba(215,207,190,0.4)' }}>
                    <img src={(item.images && item.images[0]) || item.image || item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-baseline gap-3">
                      <Link to={`/store/${cleanSub}/product/${item.id}`} className="text-lg sm:text-xl leading-tight hover:underline" style={{ fontFamily: BOTAN_SERIF }}>{item.name}</Link>
                      <span className="text-sm font-semibold shrink-0">₹{Number(item.finalPrice || item.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {item.variant && <p className="text-[11px] font-light" style={{ color: 'rgba(40,70,39,0.7)' }}>{item.variant}</p>}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border" style={{ borderColor: 'rgba(40,70,39,0.4)' }}>
                        <button onClick={() => updateQuantity(item.cartItemId || item.id, Math.max(1, (item.quantity || 1) - 1))} className="px-3.5 py-2 cursor-pointer">−</button>
                        <span className="px-2 text-xs font-semibold">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) + 1)} className="px-3.5 py-2 cursor-pointer">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.cartItemId || item.id)} className="p-2 rounded-full hover:opacity-60 transition cursor-pointer" style={{ color: 'rgba(40,70,39,0.6)' }} aria-label="Remove item" title="Remove">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 p-6 sm:p-8 rounded-3xl border space-y-5" style={{ borderColor: BOTAN.sand, backgroundColor: BOTAN.bgLight }}>
              <h2 className="text-2xl font-light" style={{ fontFamily: BOTAN_SERIF }}>Order Summary</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span style={{ color: 'rgba(40,70,39,0.7)' }}>Subtotal</span><span>₹{Number(originalSubtotal || 0).toLocaleString('en-IN')}</span></div>
                {(productSavings || 0) > 0 && <div className="flex justify-between"><span style={{ color: 'rgba(40,70,39,0.7)' }}>Maker savings</span><span>− ₹{Number(productSavings).toLocaleString('en-IN')}</span></div>}
                {(promoSavings || 0) > 0 && <div className="flex justify-between"><span style={{ color: 'rgba(40,70,39,0.7)' }}>Promo {appliedPromo?.code ? `(${appliedPromo.code})` : ''}</span><span>− ₹{Number(promoSavings).toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between"><span style={{ color: 'rgba(40,70,39,0.7)' }}>Courier</span><span style={{ color: BOTAN.olive }}>FREE</span></div>
                <div className="flex justify-between items-baseline pt-3 border-t" style={{ borderColor: BOTAN.sand }}>
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold">Total</span>
                  <span className="text-xl font-semibold" style={{ fontFamily: BOTAN_SERIF }}>₹{Number(finalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Promo code" className="flex-1 rounded-full px-5 py-3 text-xs focus:outline-none focus:ring-1" style={{ backgroundColor: BOTAN.bg, border: `1px solid ${BOTAN.sand}`, color: BOTAN.olive }} />
                <button type="submit" className="px-5 py-3 rounded-full text-[10px] uppercase tracking-widest font-medium cursor-pointer" style={{ backgroundColor: BOTAN.olive, color: BOTAN.bg }}>Apply</button>
              </form>
              {promoError && <p className="text-[11px]" style={{ color: '#B3261E' }}>{promoError}</p>}

              <button onClick={() => navigate(`/store/${cleanSub}/checkout`)} className="w-full px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.2em] shadow-md transition hover:opacity-90 cursor-pointer" style={{ backgroundColor: BOTAN.olive, color: BOTAN.bg }}>
                Proceed to Checkout
              </button>
              <p className="text-[10px] text-center font-light" style={{ color: 'rgba(40,70,39,0.6)' }}>Cash on delivery · 0% platform fee · direct from the atelier</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[var(--bg-page,#FFFDF5)] flex items-center justify-center p-4" style={themeVars}>
        <div className="max-w-md w-full bg-white rounded-3xl border border-[var(--border,#E7D9B5)] p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-[var(--bg-page,#FFFDF5)] text-[color:var(--accent,#8A6200)] mx-auto flex items-center justify-center border border-[var(--border,#DCC78B)]">
            <ShoppingBag className="w-10 h-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[color:var(--heading,#0F172A)]">Your Shopping Bag is Empty</h2>
            <p className="text-xs text-[color:var(--text,#475569)] max-w-sm mx-auto leading-relaxed">
              You haven't added any products to your bag yet. Click below to return to the store and add a piece.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[var(--accent,#8A6200)] hover:bg-[var(--accent-dark,#6B4D00)] text-white font-bold text-xs shadow-md shadow-rose-900/20 transition transform active:scale-98 cursor-pointer"
            >
              <span>← Return to Storefront & Browse Products</span>
            </button>
            <Link
              to={cleanSub ? `/store/${cleanSub}/catalog` : '/catalog'}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-2xl bg-white border border-[var(--border,#E7D9B5)] hover:bg-[var(--bg-page,#FFFDF5)] text-[color:var(--heading,#6B4D00)] font-semibold text-xs transition"
            >
              <span>{cleanSub ? "Browse This Store's Curations" : 'Explore All Stores Catalog'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page,#FFFDF5)] text-[color:var(--heading,#0F172A)] py-8 sm:py-12" style={themeVars}>
      <StorefrontModeToggle accent="#D4A017" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--border,#E7D9B5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--accent,#8A6200)]">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-page,#FFFDF5)] border border-[var(--border,#DCC78B)]">
                0% COMMISSION · DIRECT FROM THE MAKER
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[color:var(--heading,#0F172A)] mt-1.5 tracking-tight">
              Review Your Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-xs text-[color:var(--text,#475569)] mt-0.5">
              100% direct-to-maker purchase • 0% marketplace commission cuts applied.
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Bag</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const itemPrice = Number(item.finalPrice ?? item.sellingPriceINR ?? item.price ?? 0);
              const originalPrice = Number(item.comparePriceINR ?? item.comparePrice ?? item.price ?? itemPrice);
              const hasItemDiscount = (item.discountPercent || 0) > 0 || originalPrice > itemPrice;
              const itemTotal = itemPrice * (item.quantity || 1);
              const originalItemTotal = originalPrice * (item.quantity || 1);
              const itemImg = item.image || item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-white border border-[var(--border,#E7D9B5)] shadow-xs hover:border-[var(--border,#DCC78B)] transition flex flex-col sm:flex-row items-center justify-between gap-5"
                >
                  {/* Image and Basic Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                    <img
                      src={itemImg}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[var(--border,#E7D9B5)] bg-stone-50 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-page,#FFFDF5)] text-[color:var(--heading,#6B4D00)] border border-[var(--border,#DCC78B)]">
                          {item.brand || 'Bespoke D2C'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-[color:var(--heading,#0F172A)] truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[color:var(--text,#475569)] font-mono">
                        Item ID: {String(item.id).slice(-8)}
                      </p>

                      {hasItemDiscount && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          <Percent className="w-2.5 h-2.5" /> Save {item.discountPercent || Math.round(((originalPrice - itemPrice)/originalPrice)*100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls and Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-[var(--border,#E7D9B5)] pt-3 sm:pt-0 shrink-0">
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-white border border-[var(--border,#E7D9B5)] rounded-xl overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="text-[color:var(--text,#475569)] hover:text-[color:var(--heading,#0F172A)] hover:bg-[var(--bg-page,#FFFDF5)] px-2.5 py-1 font-bold text-xs transition"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono text-[color:var(--heading,#0F172A)] px-3">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        disabled={item.stock !== undefined && (item.quantity || 1) >= item.stock}
                        className="text-[color:var(--text,#475569)] hover:text-[color:var(--heading,#0F172A)] hover:bg-[var(--bg-page,#FFFDF5)] px-2.5 py-1 font-bold text-xs disabled:opacity-30 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold text-base text-[color:var(--heading,#0F172A)] font-mono">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                      {hasItemDiscount && (
                        <div className="text-xs text-[#94A3B8] line-through font-mono">
                          ₹{originalItemTotal.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex items-center justify-between">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 text-xs font-bold text-[color:var(--accent,#8A6200)] hover:text-[color:var(--heading,#6B4D00)] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping & Browse Catalog</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Price Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            {/* 0% Commission Guarantee Card */}
            <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>0% Commission Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Your entire payment goes 100% directly to the artisan merchant studio without third-party marketplace commissions.
              </p>
            </div>

            {/* Promo Code Box */}
            <div className="p-5 rounded-3xl bg-white border border-[var(--border,#E7D9B5)] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[color:var(--heading,#0F172A)] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[color:var(--accent,#8A6200)]" /> Store Promo Code
                </h4>
              </div>

              {appliedPromo ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold font-mono text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{appliedPromo.code}</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-slate-400 hover:text-rose-600 p-1 text-xs transition"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800">{appliedPromo.label}</p>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Coupon code (e.g. WELCOME10)"
                      className="flex-grow px-3 py-2 text-xs bg-white border border-[var(--border,#E7D9B5)] rounded-xl text-[color:var(--heading,#0F172A)] uppercase tracking-wider font-mono font-bold focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[var(--accent,#8A6200)] hover:bg-[var(--accent-dark,#6B4D00)] text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>}
                </form>
              )}

              {/* Available Coupons */}
              {availableCoupons.length > 0 && (
                <div className="pt-3 border-t border-[var(--border,#E7D9B5)] space-y-2">
                  <p className="text-[10px] font-bold text-[color:var(--text,#475569)] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[color:var(--accent,#8A6200)]" /> Available Coupons:
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {availableCoupons.map((c) => {
                      const isCurrentApplied = appliedPromo?.code === c.code;

                      return (
                        <div
                          key={c.id || c.code}
                          onClick={() => handleQuickApply(c.code)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                            isCurrentApplied
                              ? 'bg-[var(--bg-page,#FFFDF5)] border-[#8A6200] text-[color:var(--heading,#6B4D00)]'
                              : 'bg-[var(--bg-page,#FFFDF5)] border-[var(--border,#E7D9B5)] hover:border-[#A87A00] text-[color:var(--heading,#0F172A)]'
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-[color:var(--accent,#8A6200)] text-[11px] block">{c.code}</span>
                            <p className="text-[10px] text-[color:var(--text,#475569)]">{c.description || `${c.discountValue}% off`}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FFE4E6] text-[color:var(--heading,#6B4D00)] font-bold">
                            {isCurrentApplied ? 'Applied' : 'Tap to Apply'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary & Checkout */}
            <div className="p-6 rounded-3xl bg-white border border-[var(--border,#E7D9B5)] space-y-4 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[color:var(--heading,#0F172A)]">Order Summary</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[color:var(--text,#475569)]">
                  <span>Original Subtotal</span>
                  <span className="font-mono font-bold text-[color:var(--heading,#0F172A)]">₹{originalSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {productSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Direct Studio Savings</span>
                    <span className="font-mono font-bold">-₹{productSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {promoSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Voucher Discount ({appliedPromo?.code})</span>
                    <span className="font-mono font-bold">-₹{promoSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[color:var(--text,#475569)]">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-700 font-bold">FREE Express Delivery</span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-[color:var(--heading,#0F172A)] pt-3 border-t border-[var(--border,#E7D9B5)]">
                  <span>Total Amount</span>
                  <span className="font-mono text-xl text-[color:var(--accent,#8A6200)] font-black">₹{finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 px-6 rounded-2xl bg-[var(--accent,#8A6200)] hover:bg-[var(--accent-dark,#6B4D00)] text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-98"
                >
                  <span>Proceed to 1-Click Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-[color:var(--text,#475569)]">
                <span>🔒 256-Bit SSL Encrypted</span>
                <span>•</span>
                <span>⚡ Instant Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
