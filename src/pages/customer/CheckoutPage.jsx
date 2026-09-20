import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { DEMO_STORES } from '../../data/multiVerticalMockData';
import { formatCurrency, formatINR, formatDateTime } from '../../utils/formatters';
import { StorefrontModeToggle } from '../../components/customer/StorefrontModeToggle';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  Truck,
  ArrowRight,
  Printer,
  ShoppingBag,
  Clock,
  Sparkles,
  Smartphone,
  User,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  Tag,
  X,
  Percent,
  Copy,
  Check,
  Store,
  MapPin,
  Banknote,
  QrCode
} from 'lucide-react';

export const CheckoutPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const {
    cartItems,
    getCartTotals,
    clearCart,
    appliedPromo,
    availableCoupons,
    applyPromoCode,
    removePromoCode,
    addToCart,
    showToast
  } = useCart();
  const { createOrder } = useProducts();
  const navigate = useNavigate();

  const [checkoutPromoInput, setCheckoutPromoInput] = useState('');
  const [checkoutPromoError, setCheckoutPromoError] = useState('');
  const [showCouponsDrawer, setShowCouponsDrawer] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const handleApplyCoupon = async () => {
    const code = checkoutPromoInput.trim().toUpperCase();
    if (!code) { setCheckoutPromoError('Please enter a coupon code.'); return; }
    setCouponBusy(true); setCheckoutPromoError('');
    try {
      const res = await api.coupons.validate(code, cartTotals.discountedSubtotal, resolvedSubdomain || subdomain);
      if (res?.success && res.data) {
        removePromoCode();
        setAppliedCoupon({ code: res.data.code, discountINR: Math.round(res.data.calculatedDiscount || 0), description: res.data.label || res.data.description });
        setCheckoutPromoInput('');
      } else {
        setAppliedCoupon(null);
        setCheckoutPromoError(res?.message || 'Invalid coupon code.');
      }
    } catch (e) {
      setCheckoutPromoError('Could not verify the coupon. Please try again.');
    }
    setCouponBusy(false);
  };

  const cartTotals = (typeof getCartTotals === 'function' ? getCartTotals() : {}) || {};
  const {
    originalSubtotal = 0,
    productSavings = 0,
    promoSavings = 0,
    totalSavings = 0,
    finalAmount = 0,
    itemCount = 0
  } = cartTotals;

  // Payable after coupon discount (must come after cartTotals destructure)
  const payableAmount = Math.max(0, finalAmount - (appliedCoupon?.discountINR || 0));

  // Form State — no prefilled demo values; customers enter their own details
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'cod',
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  useEffect(() => {
    try {
      const activeCustRaw = localStorage.getItem('gojulex_store_customer_active');
      if (activeCustRaw) {
        const cust = JSON.parse(activeCustRaw);
        if (cust) {
          setFormData((prev) => ({
            ...prev,
            fullName: cust.name || prev.fullName,
            email: cust.email || prev.email,
            phone: cust.phone || prev.phone
          }));
          return;
        }
      }
    } catch {}

    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const checkoutKey = useRef(sessionStorage.getItem('gojulex_checkout_key') || window.crypto.randomUUID());
  sessionStorage.setItem('gojulex_checkout_key', checkoutKey.current);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Please enter your phone number', 'error');
      return;
    }
    if (!formData.email.trim() || !formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !/^\d{6}$/.test(formData.zipCode.trim())) {
      showToast('Enter a valid email and complete delivery address, including a six-digit PIN code.', 'error');
      return;
    }
    if (cartItems.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    if (formData.paymentMethod !== 'cod') {
      showToast('Online payment is being configured. Choose cash on delivery.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const rawShipping = {
        fullName: formData.fullName.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: 'India'
      };

      const orderItems = cartItems.map((item) => ({
            id: item.id,
            productId: item.id,
            productName: item.name,
            name: item.name,
            brand: item.brand || 'Bespoke D2C',
            image: item.image || item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
            quantity: item.quantity || 1,
            price: Number(item.finalPrice || item.sellingPriceINR || item.price || 0),
            finalPrice: Number(item.finalPrice || item.sellingPriceINR || item.price || 0),
            storeSubdomain: item.storeSubdomain
          }));

      const baseFinal = finalAmount > 0 ? finalAmount : orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
      const calculatedFinal = Math.max(0, baseFinal - (appliedCoupon?.discountINR || 0));
      const firstItem = cartItems[0] || {};
      const activeStoreSubdomain = firstItem.storeSubdomain || (subdomain ? subdomain.replace(/^store_/, '') : '');
      const activeTenantId = firstItem.tenantId || (activeStoreSubdomain ? `store_${activeStoreSubdomain}` : '');
      if (!activeTenantId) throw new Error('The store for this cart could not be identified. Please return to the storefront.');

      const orderPayload = {
        checkoutKey: checkoutKey.current,
        id: `ORD-${Date.now().toString().slice(-6)}`,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        totalAmount: calculatedFinal,
        totalAmountINR: calculatedFinal,
        discountAppliedINR: appliedCoupon?.discountINR || 0,
        couponCode: appliedCoupon?.code || appliedPromo?.code || null,
        totalINR: calculatedFinal,
        storeSubdomain: activeStoreSubdomain,
        tenantId: activeTenantId,
        storeName: matchedStore.name,
        items: orderItems,
        shippingAddress: rawShipping,
        deliveryMethod: 'Complimentary Express Delivery (0% Commission)',
        paymentMethod: 'Cash on Delivery',
        status: 'Processing',
        fulfillmentStatus: 'PROCESSING',
        paymentStatus: 'PENDING',
        channel: 'web',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      // 1. Sync to Global ProductContext — the backend owns the official
      // order number; adopt it so the confirmation matches the invoice email
      const backendOrder = await createOrder(orderPayload);
      orderPayload.orderNumber = backendOrder.orderNumber;
      orderPayload.id = backendOrder.orderNumber;
      orderPayload.totalAmount = backendOrder.totalAmount;
      orderPayload.totalAmountINR = backendOrder.totalAmount;
      orderPayload.paymentStatus = backendOrder.paymentStatus;
      orderPayload.trackingNumber = backendOrder.trackingNumber;

      // 2. Sync to Merchant Orders Storage for every involved store
      try {
        const rawExisting = localStorage.getItem('gojulex_merchant_orders');
        const parsed = rawExisting ? JSON.parse(rawExisting) : {};
        
        const storeSubdomains = new Set(cartItems.map(it => it.storeSubdomain || it.tenantId).filter(Boolean));
        if (storeSubdomains.size === 0) storeSubdomains.add(activeStoreSubdomain);

        storeSubdomains.forEach(sub => {
          const cleanSub = String(sub).replace(/^store_/, '');
          const key1 = `store_${cleanSub}`;
          const key2 = cleanSub;
          parsed[key1] = [orderPayload, ...(Array.isArray(parsed[key1]) ? parsed[key1] : [])];
          parsed[key2] = [orderPayload, ...(Array.isArray(parsed[key2]) ? parsed[key2] : [])];
        });

        localStorage.setItem('gojulex_merchant_orders', JSON.stringify(parsed));
      } catch (e) {}

      const formattedConfirmedOrder = { ...orderPayload };

      setConfirmedOrder(formattedConfirmedOrder);
      clearCart();
      sessionStorage.removeItem('gojulex_checkout_key');
      showToast('Order placed. Payment is due on delivery.', 'success');

      // Trigger Celebration Fireworks
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#8A6200', '#A87A00', '#FB7185', '#D4A017', '#10B981']
        });
      } catch (err) {}
    } catch (err) {
      console.error('Order placement error:', err);
      showToast(err.message || 'Could not place your order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const { subdomain } = useParams();

  // Identify Current Store Context (Strict multi-tenant store awareness across cart & confirmed order)
  const resolvedSubdomain = (
    subdomain ||
    confirmedOrder?.storeSubdomain ||
    confirmedOrder?.tenantId ||
    confirmedOrder?.items?.[0]?.storeSubdomain ||
    cartItems[0]?.storeSubdomain ||
    cartItems[0]?.tenantId ||
    ''
  ).toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');

  const resolvedItemBrand = (
    confirmedOrder?.items?.[0]?.brand ||
    cartItems[0]?.brand ||
    ''
  ).toLowerCase();

  const matchedStore = (() => {
    // 1. Check custom saved profile for this store in localStorage
    if (resolvedSubdomain) {
      try {
        const raw = localStorage.getItem(`gojulex_store_profile_${resolvedSubdomain}`) ||
                    localStorage.getItem(`gojulex_store_profile_store_${resolvedSubdomain}`);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
    }

    // 2. Check DEMO_STORES by subdomain or id
    if (resolvedSubdomain) {
      const found = DEMO_STORES.find(
        (s) =>
          s.id?.toLowerCase().replace(/^store_/, '') === resolvedSubdomain ||
          s.subdomain?.toLowerCase().replace(/\.gojulex\.com$/, '') === resolvedSubdomain ||
          s.name?.toLowerCase().replace(/[^a-z0-9]/g, '').includes(resolvedSubdomain.replace(/[^a-z0-9]/g, ''))
      );
      if (found) return found;
    }

    // 3. Check DEMO_STORES by Brand name
    if (resolvedItemBrand) {
      const foundByBrand = DEMO_STORES.find(
        (s) =>
          s.name?.toLowerCase() === resolvedItemBrand ||
          resolvedItemBrand.includes(s.name?.toLowerCase()) ||
          s.name?.toLowerCase().replace(/[^a-z0-9]/g, '').includes(resolvedItemBrand.replace(/[^a-z0-9]/g, ''))
      );
      if (foundByBrand) return foundByBrand;
    }

    // 4. Default fallback if subdomain exists
    if (resolvedSubdomain) {
      return {
        id: `store_${resolvedSubdomain}`,
        name: resolvedSubdomain.toUpperCase() + ' STORE',
        subdomain: `${resolvedSubdomain}.go.julex.shop`,
        gstin: '',
        ownerEmail: '',
        ownerPhone: '',
        address: ''
      };
    }

    // 5. If no items or store context, check active store in localStorage
    try {
      const rawActive = localStorage.getItem('gojulex_active_store_profile');
      if (rawActive) return JSON.parse(rawActive);
    } catch (e) {}

    return DEMO_STORES.find(s => s.id === 'store_ramstshirt') || DEMO_STORES[0];
  })();

  const currentSubdomain = resolvedSubdomain || matchedStore.subdomain?.replace(/\.gojulex\.com$/, '').replace(/^store_/, '') || 'ramstshirt';

  // ----------------------------------------------------
  // ORDER CONFIRMED VIEW
  // ----------------------------------------------------
  if (confirmedOrder) {
    const shipping = confirmedOrder.shippingAddress || {};
    return (
      <div className="min-h-screen bg-[#FFFDF5] py-10 px-4 text-[#0F172A] animate-fade-in">
      <StorefrontModeToggle accent="#D4A017" />
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between px-2">
            <Link to={currentSubdomain ? `/store/${currentSubdomain}` : '/'} className="flex items-center gap-2 text-xs font-bold text-[#6B4D00] hover:underline">
              ← Return to {matchedStore.name}
            </Link>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Order recorded
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-[#E7D9B5] p-6 sm:p-10 text-center space-y-6 shadow-sm relative overflow-hidden">
            {/* Top Success Badge */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Order confirmed · pay on delivery
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F172A]">
                Thank You for Your Order!
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
                Your order has been received. Payment is due when your order arrives.
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FFFDF5] border border-[#E7D9B5] text-left text-xs">
              <div>
                <span className="text-[10px] text-[#475569] font-bold block uppercase">Order ID</span>
                <span className="font-mono font-bold text-[#8A6200] mt-0.5 block">{confirmedOrder.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#475569] font-bold block uppercase">Status</span>
                <span className="text-emerald-700 font-bold mt-0.5 block">Processing · payment pending</span>
              </div>
              <div>
                <span className="text-[10px] text-[#475569] font-bold block uppercase">Due on delivery</span>
                <span className="font-mono font-bold text-[#0F172A] mt-0.5 block">₹{Number(confirmedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#475569] font-bold block uppercase">Tracking No.</span>
                <span className="font-mono text-[#0F172A] text-[11px] font-bold mt-0.5 block">{confirmedOrder.trackingNumber || 'Provided when shipped'}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#8A6200]" /> Purchased Items ({confirmedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-[#E7D9B5] border border-[#E7D9B5] rounded-2xl bg-white overflow-hidden">
                {confirmedOrder.items?.map((item, idx) => (
                  <div key={item.id || idx} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || item.productImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E7D9B5] bg-stone-50 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-xs text-[#0F172A] line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-[#475569] font-mono">Qty: {item.quantity || 1} • {item.brand || matchedStore.name}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#8A6200] shrink-0">
                      ₹{((item.finalPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs p-4 rounded-2xl border border-[#E7D9B5] bg-[#FFFDF5]">
              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8A6200]" /> Delivery Destination
                </span>
                <p className="font-bold text-[#0F172A]">{shipping.fullName || confirmedOrder.customerName}</p>
                <p className="text-[#475569] mt-0.5">{shipping.street}, {shipping.city}, {shipping.state} - {shipping.zipCode}</p>
                <p className="text-[#475569]">Phone: {confirmedOrder.customerPhone}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Payment & Commission
                </span>
                <p className="font-bold text-[#0F172A]">{confirmedOrder.paymentMethod}</p>
                <p className="text-emerald-700 font-medium mt-0.5">0% Platform Fee Applied (₹0 fee)</p>
                <p className="text-[#475569]">Contact email: {confirmedOrder.customerEmail}</p>
              </div>
            </div>

            {/* 3. Live Order Transit Timeline Tracker */}
            <div className="p-5 rounded-2xl border border-[#E7D9B5] bg-white text-left space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8A6200]" /> Live Shipment Tracker
                </span>
                <span className="text-[11px] font-mono font-bold text-[#8A6200]">
                  {confirmedOrder.trackingNumber || 'Pending dispatch'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="text-center space-y-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-bold shadow-xs">
                    ✓
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 block leading-tight">Order Placed</span>
                  <span className="text-[9px] text-[#475569]">Just now</span>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-bold shadow-xs">
                    ✓
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 block leading-tight">Payment due</span>
                  <span className="text-[9px] text-[#475569]">On delivery</span>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-7 h-7 rounded-full bg-[#8A6200] text-white flex items-center justify-center mx-auto text-xs font-bold shadow-xs animate-pulse">
                    3
                  </div>
                  <span className="text-[10px] font-bold text-[#8A6200] block leading-tight">Packing & Transit</span>
                  <span className="text-[9px] text-[#475569]">In Progress</span>
                </div>
                <div className="text-center space-y-1 opacity-50">
                  <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto text-xs font-bold">
                    4
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 block leading-tight">Doorstep Delivery</span>
                  <span className="text-[9px] text-stone-400">Date to be confirmed</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={currentSubdomain ? `/store/${currentSubdomain}` : '/'}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFFDF5] border border-[#E7D9B5] text-[#6B4D00] text-xs font-bold transition shadow-xs flex items-center gap-2"
              >
                <span>← Continue Shopping at {matchedStore.name}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMPTY CART FALLBACK
  // ----------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#FFFDF5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7D9B5] p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-[#FFFDF5] text-[#8A6200] mx-auto flex items-center justify-center border border-[#DCC78B]">
            <ShoppingBag className="w-10 h-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#0F172A]">Your Shopping Bag is Empty</h2>
            <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
              Add a piece from the store to proceed, or click below to immediately test the complete 1-click checkout experience.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => {
                addToCart({
                  id: `prod_test_${Date.now()}`,
                  name: 'Signature Artisan Craft Piece',
                  price: 1499,
                  sellingPriceINR: 1499,
                  comparePriceINR: 2499,
                  imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
                  quantity: 1,
                  brand: 'Bespoke D2C',
                  storeSubdomain: 'bookstore'
                });
                showToast('Sample piece loaded! Ready for checkout testing 🚀', 'success');
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#8A6200] hover:bg-[#6B4D00] text-white font-bold text-xs shadow-md shadow-rose-900/20 transition transform active:scale-98 cursor-pointer"
            >
              <span>⚡ Load Sample Product (₹1,499) & Test Checkout</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-2xl bg-white border border-[#E7D9B5] hover:bg-[#FFFDF5] text-[#6B4D00] font-semibold text-xs transition cursor-pointer"
            >
              <span>← Return to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CHECKOUT FORM VIEW
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#0F172A] py-6 sm:py-10">
      <StorefrontModeToggle accent="#D4A017" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Minimalist Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E7D9B5]">
          <Link
            to={currentSubdomain ? `/store/${currentSubdomain}` : '/'}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#8A6200] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {matchedStore.name?.charAt(0) || 'S'}
            </div>
            <div>
              <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#8A6200] transition">
                {matchedStore.name}
              </span>
              <span className="text-[10px] text-[#6B4D00] block">← Return to Store</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-bold bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Order details are saved with your store</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7D9B5] flex items-center justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8A6200]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF5] border border-[#DCC78B]">
                STORE CHECKOUT
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 tracking-tight">
              Finalize Your Order
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Review your order and delivery details before placing it.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Official Storefront Checkout</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact, Shipping & Payment */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Customer Details */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7D9B5] space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#8A6200]" /> 1. Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7D9B5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">Phone Number (For Delivery Contact) *</label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7D9B5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100 font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7D9B5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7D9B5] space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8A6200]" /> 2. Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">Street Address / House No. *</label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Flat 402, Sunshine Residency, Studio Main Road"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7D9B5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Chennai"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7D9B5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">State *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Tamil Nadu"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7D9B5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">PIN Code *</label>
                  <input
                    type="text"
                    required
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="600001"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E7D9B5] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#A87A00] focus:ring-2 focus:ring-rose-100 font-mono font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#475569]">Country</label>
                  <input
                    type="text"
                    disabled
                    value="India"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDF5] border border-[#E7D9B5] rounded-xl text-[#475569] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7D9B5] space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#8A6200]" /> 3. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* UPI */}
                <label
                  aria-disabled="true"
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    formData.paymentMethod === 'upi'
                      ? 'bg-[#FFFDF5] border-[#8A6200] ring-2 ring-rose-100'
                      : 'bg-white border-[#E7D9B5] hover:border-[#D4A017]'
                  } opacity-50 cursor-not-allowed`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">UPI / QR (Google Pay / PhonePe)</p>
                      <p className="text-[10px] text-[#475569] font-semibold">Coming soon</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={false}
                    disabled
                    onChange={() => {}}
                    className="text-[#8A6200]"
                  />
                </label>

                {/* Cards */}
                <label
                  aria-disabled="true"
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    formData.paymentMethod === 'card'
                      ? 'bg-[#FFFDF5] border-[#8A6200] ring-2 ring-rose-100'
                      : 'bg-white border-[#E7D9B5] hover:border-[#D4A017]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FFFDF5] text-[#8A6200] flex items-center justify-center border border-[#DCC78B]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">Credit & Debit Cards</p>
                      <p className="text-[10px] text-[#475569]">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={false}
                    disabled
                    onChange={() => {}}
                    className="text-[#8A6200]"
                  />
                </label>

                {/* COD */}
                <label
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    formData.paymentMethod === 'cod'
                      ? 'bg-[#FFFDF5] border-[#8A6200] ring-2 ring-rose-100'
                      : 'bg-white border-[#E7D9B5] hover:border-[#D4A017]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">Cash on Delivery (COD)</p>
                      <p className="text-[10px] text-[#475569]">Pay on arrival at doorstep</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => {}}
                    className="text-[#8A6200]"
                  />
                </label>

                {/* Net Banking */}
                <label
                  aria-disabled="true"
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    formData.paymentMethod === 'netbanking'
                      ? 'bg-[#FFFDF5] border-[#8A6200] ring-2 ring-rose-100'
                      : 'bg-white border-[#E7D9B5] hover:border-[#D4A017]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">Net Banking & IMPS</p>
                      <p className="text-[10px] text-[#475569]">All Major Indian Banks</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={false}
                    disabled
                    onChange={() => {}}
                    className="text-[#8A6200]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-4 space-y-6">
            {/* 0% Commission Badge */}
            <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-emerald-950 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Go Julex 0% Platform Commission</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                You are purchasing direct from the maker. No intermediary cuts applied.
              </p>
            </div>

            {/* Items in Checkout */}
            <div className="p-5 rounded-3xl bg-white border border-[#E7D9B5] space-y-3.5 shadow-xs">
              <h3 className="font-serif text-base font-bold text-[#0F172A] flex items-center justify-between">
                <span>Items ({itemCount})</span>
                <Link to="/cart" className="text-xs text-[#8A6200] font-bold hover:underline">
                  Edit Bag
                </Link>
              </h3>

              <div className="divide-y divide-[#E7D9B5] max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const itemPrice = Number(item.finalPrice ?? item.sellingPriceINR ?? item.price ?? 0);
                  const itemImg = item.image || item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80';

                  return (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E7D9B5] bg-stone-50 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] truncate text-[11px]">{item.name}</p>
                          <p className="text-[10px] text-[#475569]">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#8A6200] shrink-0 text-xs">
                        ₹{(itemPrice * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Calculations & Submit Button */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7D9B5] space-y-4 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Payment Valuation</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#475569]">
                  <span>Item Subtotal</span>
                  <span className="font-mono font-bold text-[#0F172A]">₹{originalSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {productSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Direct Maker Discount</span>
                    <span className="font-mono font-bold">-₹{productSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {promoSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Voucher Privilege ({appliedPromo?.code})</span>
                    <span className="font-mono font-bold">-₹{promoSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#475569]">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-bold">FREE (Complimentary)</span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-[#0F172A] pt-3 border-t border-[#E7D9B5]">
                  <span>Total Amount Payable</span>
                  <span className="font-mono text-xl text-[#8A6200] font-black">₹{finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2">
                {/* Coupon / Promo Code — customer entry point */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E7D9B5] space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                      🎟️ Have a coupon?
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="text-xs">
                          <span className="font-black text-emerald-700">{appliedCoupon.code}</span>
                          <span className="text-emerald-600"> applied — you save ₹{appliedCoupon.discountINR.toLocaleString('en-IN')}</span>
                        </div>
                        <button type="button" onClick={() => setAppliedCoupon(null)} className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={checkoutPromoInput}
                          onChange={(e) => { setCheckoutPromoInput(e.target.value); setCheckoutPromoError(''); }}
                          placeholder="Enter coupon code (e.g. WELCOME10)"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E7D9B5] text-xs font-semibold uppercase placeholder:normal-case placeholder:font-normal"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponBusy}
                          className="px-5 py-2.5 rounded-xl bg-[#8A6200] hover:bg-[#6B4D00] text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          {couponBusy ? 'Checking…' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {checkoutPromoError && (
                      <p className="text-[11px] font-semibold text-rose-600">{checkoutPromoError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-xs pt-1 border-t border-dashed border-[#E7D9B5]">
                        <span className="text-[#475569]">Order total:</span>
                        <span className="line-through text-[#6B4D00]">₹{finalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-[#0F172A]">Payable after discount:</span>
                        <span className="font-black text-emerald-700">₹{payableAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-2xl bg-[#8A6200] hover:bg-[#6B4D00] text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Direct Order (₹)...</span>
                    </>
                  ) : (
                    <>
                      <span>Place COD Order (₹{payableAmount.toLocaleString('en-IN')} due on delivery)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-[#475569]">
                <span>Payment will be collected on delivery.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
