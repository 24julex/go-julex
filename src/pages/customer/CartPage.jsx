import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatINR } from '../../utils/formatters';
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
    cartItems,
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

  const {
    originalSubtotal,
    discountedSubtotal,
    productSavings,
    promoSavings,
    totalSavings,
    finalAmount,
    itemCount
  } = getCartTotals();

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#fedddd] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#FBCBCB] p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-[#fedddd] text-[#9F1239] mx-auto flex items-center justify-center border border-[#F8B4B4]">
            <ShoppingBag className="w-10 h-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#0F172A]">Your Shopping Bag is Empty</h2>
            <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
              You haven't added any products to your bag yet. Click below to return to the store and add a piece.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-md shadow-rose-900/20 transition transform active:scale-98 cursor-pointer"
            >
              <span>← Return to Storefront & Browse Products</span>
            </button>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-2xl bg-white border border-[#FBCBCB] hover:bg-[#fedddd] text-[#881337] font-semibold text-xs transition"
            >
              <span>Explore All Stores Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fedddd] text-[#0F172A] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#9F1239]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#fedddd] border border-[#F8B4B4]">
                0% PLATFORM FEE COMMERCE
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1.5 tracking-tight">
              Review Your Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
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
                  className="p-5 rounded-3xl bg-white border border-[#FBCBCB] shadow-xs hover:border-[#F8B4B4] transition flex flex-col sm:flex-row items-center justify-between gap-5"
                >
                  {/* Image and Basic Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                    <img
                      src={itemImg}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#FBCBCB] bg-stone-50 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
                          {item.brand || 'Bespoke D2C'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-[#0F172A] truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#475569] font-mono">
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
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-[#FBCBCB] pt-3 sm:pt-0 shrink-0">
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-white border border-[#FBCBCB] rounded-xl overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="text-[#475569] hover:text-[#0F172A] hover:bg-[#fedddd] px-2.5 py-1 font-bold text-xs transition"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono text-[#0F172A] px-3">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        disabled={item.stock !== undefined && (item.quantity || 1) >= item.stock}
                        className="text-[#475569] hover:text-[#0F172A] hover:bg-[#fedddd] px-2.5 py-1 font-bold text-xs disabled:opacity-30 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold text-base text-[#0F172A] font-mono">
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
                className="inline-flex items-center gap-2 text-xs font-bold text-[#9F1239] hover:text-[#881337] transition"
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
                <span>Go Julex 0% Platform Fee Model</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Your entire payment goes 100% directly to the artisan merchant studio without third-party marketplace commissions.
              </p>
            </div>

            {/* Promo Code Box */}
            <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#9F1239]" /> Store Promo Code
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
                      className="flex-grow px-3 py-2 text-xs bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] uppercase tracking-wider font-mono font-bold focus:outline-none focus:border-[#BE123C] focus:ring-2 focus:ring-rose-100"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-rose-600 font-medium">{promoError}</p>}
                </form>
              )}

              {/* Available Coupons */}
              {availableCoupons.length > 0 && (
                <div className="pt-3 border-t border-[#FBCBCB] space-y-2">
                  <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#9F1239]" /> Available Coupons:
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
                              ? 'bg-[#fedddd] border-[#9F1239] text-[#881337]'
                              : 'bg-[#fedddd] border-[#FBCBCB] hover:border-[#BE123C] text-[#0F172A]'
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold text-[#9F1239] text-[11px] block">{c.code}</span>
                            <p className="text-[10px] text-[#475569]">{c.description || `${c.discountValue}% off`}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FFE4E6] text-[#881337] font-bold">
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
            <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Order Summary</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#475569]">
                  <span>Original Subtotal</span>
                  <span className="font-mono font-bold text-[#0F172A]">₹{originalSubtotal.toLocaleString('en-IN')}</span>
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

                <div className="flex items-center justify-between text-[#475569]">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-700 font-bold">FREE Express Delivery</span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-[#0F172A] pt-3 border-t border-[#FBCBCB]">
                  <span>Total Amount</span>
                  <span className="font-mono text-xl text-[#9F1239] font-black">₹{finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 px-6 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-98"
                >
                  <span>Proceed to 1-Click Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-[#475569]">
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
