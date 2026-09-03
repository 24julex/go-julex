import React, { useState } from 'react';
import {
  Settings,
  Store,
  CreditCard,
  Users,
  ShieldCheck,
  KeyRound,
  QrCode,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  Save,
  Check,
  Globe,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Percent,
  Upload
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings = () => {
  const { currentStore, teamMembers, paymentGateways, setPaymentGateways, showToast } =
    useMerchantAdmin();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'plan' | 'users' | 'payments' | 'security'

  // General Store Profile State
  const [storeProfile, setStoreProfile] = useState({
    name: currentStore?.name || (currentUser?.name ? `${currentUser.name}'s Store` : 'My Boutique'),
    tagline: currentStore?.categoryLabel || 'Handcrafted Luxury & Direct D2C',
    category: currentStore?.vertical || 'jewelry',
    categoryLabel: currentStore?.categoryLabel || 'Fine Jewelry & Luxury',
    subdomain: (currentStore?.subdomain || 'mystore.gojulex.com').replace('.gojulex.com', ''),
    customDomain: currentStore?.customDomain || '',
    supportEmail: currentStore?.ownerEmail || currentUser?.email || 'support@mystore.in',
    supportPhone: currentStore?.phone || '+91 98201 54321',
    gstin: currentStore?.gstin || '27AAACA1234A1Z5',
    city: currentStore?.city || 'Mumbai',
    state: currentStore?.state || 'Maharashtra',
    country: 'India',
    pincode: '400001',
    currency: 'INR (₹)',
    logoUrl: ''
  });

  // Payment Keys State
  const [keysState, setKeysState] = useState({
    razorpayKey: paymentGateways?.razorpay?.keyId || 'rzp_live_99214AXYZ',
    phonepeMerchant: paymentGateways?.phonepe?.merchantId || 'M230623091104',
    cashfreeAppId: paymentGateways?.cashfree?.appId || '',
    codEnabled: paymentGateways?.cod?.enabled ?? true
  });

  // 2FA TOTP Simulation
  const [is2FAEnabled, setIs2FAEnabled] = useState(Boolean(currentStore?.is2FAEnabled));
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: 'sess_01',
      device: 'Chrome on Windows 11 (Current Session)',
      location: `${currentStore?.city || 'Mumbai, India'}`,
      ip: '103.211.54.18',
      lastActive: 'Active Now',
      isCurrent: true
    },
    {
      id: 'sess_02',
      device: 'Safari on iPhone 15 Pro',
      location: `${currentStore?.city || 'Mumbai, India'}`,
      ip: '49.36.128.92',
      lastActive: '3 hours ago',
      isCurrent: false
    }
  ]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(`gojulex_store_profile_${currentStore?.id || 'default'}`, JSON.stringify(storeProfile));
      localStorage.setItem(`gojulex_store_profile_${storeProfile.subdomain}`, JSON.stringify(storeProfile));
      showToast('Store profile & business identity saved successfully!', 'success');
    } catch (err) {
      showToast('Profile updated!', 'success');
    }
  };

  const handleSavePayments = (e) => {
    e.preventDefault();
    setPaymentGateways((prev) => ({
      ...prev,
      razorpay: { ...prev.razorpay, keyId: keysState.razorpayKey },
      phonepe: { ...prev.phonepe, merchantId: keysState.phonepeMerchant },
      cashfree: { ...prev.cashfree, appId: keysState.cashfreeAppId },
      cod: { ...prev.cod, enabled: keysState.codEnabled }
    }));
    showToast('Payment gateway credentials updated', 'success');
  };

  const handleConfirm2FA = (e) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setTotpCode('');
      showToast('Two-Factor Authentication (TOTP) successfully activated!', 'success');
    } else {
      showToast('Please enter a 6-digit confirmation code.', 'error');
    }
  };

  const handleRevokeAllSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast('Revoked all other active sessions across devices.', 'info');
  };

  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-serif flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#9F1239]" /> Store Settings & Business Profile
          </h1>
        </div>
        <p className="text-xs text-[#374151] mt-1">
          Manage your store identity, custom domain, flat 0% fee subscription plan, payment API keys, team access, and 2FA security.
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#FBCBCB] rounded-2xl text-xs overflow-x-auto">
        {[
          { id: 'general', label: '🏪 Store Profile', icon: Store },
          { id: 'plan', label: '💳 Plan & Billing', icon: CreditCard },
          { id: 'users', label: '👥 Team & Access', icon: Users },
          { id: 'payments', label: '⚡ Payment Gateways', icon: ShieldCheck },
          { id: 'security', label: '🛡️ Security & 2FA', icon: KeyRound }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#9F1239] text-white shadow-xs'
                : 'text-[#881337] hover:bg-[#FEE2E2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: General Store Profile */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-in text-xs">
          <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A] font-serif flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#9F1239]" /> Store Identity & Branding
                </h3>
                <p className="text-[11px] text-[#374151]">Public business details displayed on your live customer storefront</p>
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold transition shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Store Name *</label>
                <input
                  type="text"
                  required
                  value={storeProfile.name}
                  onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                  placeholder="e.g. Abi's Jewelry Store"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Store Category / Vertical *</label>
                <select
                  value={storeProfile.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    const labels = {
                      jewelry: 'Fine Jewelry & Luxury',
                      clothes: 'Fashion & Apparel',
                      shoes: 'Footwear & Sneakers',
                      millets_food: 'Millets & Organic Foods',
                      gift_shop: 'Custom Gifts & Crafts',
                      toy_shop: 'Toys & Kids Learning',
                      electronics: 'Electronics & Audio',
                      home_decor: 'Home & Living'
                    };
                    setStoreProfile({
                      ...storeProfile,
                      category: val,
                      categoryLabel: labels[val] || 'Retail Store'
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                >
                  <option value="jewelry">💎 Fine Jewelry & Luxury</option>
                  <option value="clothes">👗 Fashion & Apparel</option>
                  <option value="shoes">👟 Footwear & Sneakers</option>
                  <option value="millets_food">🌾 Millets & Organic Foods</option>
                  <option value="gift_shop">🎁 Custom Gifts & Keepsakes</option>
                  <option value="toy_shop">🧸 Toys & Kids Games</option>
                  <option value="electronics">🎧 Electronics & Audio</option>
                  <option value="home_decor">🏡 Home & Living</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Storefront Subdomain *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={storeProfile.subdomain}
                    onChange={(e) => setStoreProfile({ ...storeProfile, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-r-0 border-[#FBCBCB] rounded-l-2xl text-[#0F172A] font-mono focus:outline-none focus:border-[#BE123C]"
                  />
                  <span className="px-3.5 py-2.5 bg-[#fedddd] border border-[#FBCBCB] rounded-r-2xl text-[#881337] font-mono font-semibold">
                    .gojulex.com
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Custom Domain (Optional)</label>
                <input
                  type="text"
                  value={storeProfile.customDomain}
                  onChange={(e) => setStoreProfile({ ...storeProfile, customDomain: e.target.value })}
                  placeholder="e.g. www.abijewels.in"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Support Email Address *</label>
                <input
                  type="email"
                  required
                  value={storeProfile.supportEmail}
                  onChange={(e) => setStoreProfile({ ...storeProfile, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Business Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={storeProfile.supportPhone}
                  onChange={(e) => setStoreProfile({ ...storeProfile, supportPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">GSTIN Number (Tax Invoices)</label>
                <input
                  type="text"
                  value={storeProfile.gstin}
                  onChange={(e) => setStoreProfile({ ...storeProfile, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-mono uppercase focus:outline-none focus:border-[#BE123C]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">Store Currency</label>
                <input
                  type="text"
                  readOnly
                  value="INR (₹) - Indian Rupee"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#FBCBCB] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">City</label>
                <input
                  type="text"
                  value={storeProfile.city}
                  onChange={(e) => setStoreProfile({ ...storeProfile, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">State</label>
                <input
                  type="text"
                  value={storeProfile.state}
                  onChange={(e) => setStoreProfile({ ...storeProfile, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#0F172A]">PIN Code</label>
                <input
                  type="text"
                  value={storeProfile.pincode}
                  onChange={(e) => setStoreProfile({ ...storeProfile, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Plan Details */}
      {activeTab === 'plan' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#FBCBCB] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9F1239] tracking-wider font-serif">
                  Active Subscription Tier
                </span>
                <h3 className="text-xl font-black text-[#0F172A] font-serif line-clamp-2 leading-snug">
                  {currentStore?.planName || currentStore?.tier || '6-Month Merchant Plan'}
                </h3>
                <p className="text-xs text-[#374151]">
                  Fixed predictable SaaS subscription with 0% platform commission on store transactions.
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-800">
                  ₹{(currentStore?.planPrice || 11994).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#374151] font-semibold block">
                  / {currentStore?.planInterval || '6 Months'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-[#FBCBCB]">
                <span className="text-[#374151] font-semibold">Billing Status</span>
                <p className="font-bold text-emerald-800 text-sm mt-1">🟢 {currentStore?.planStatus || 'Active (Auto-Renew)'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#FBCBCB]">
                <span className="text-[#374151] font-semibold">Next Renewal Date</span>
                <p className="font-bold text-[#0F172A] text-sm mt-1">{currentStore?.renewalDate || '15 Mar 2027'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#FBCBCB]">
                <span className="text-[#374151] font-semibold">Platform Commission</span>
                <p className="font-bold text-[#9F1239] text-sm mt-1">0% (Keep 100% Sales)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Users & Role Management */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A] font-serif">Store Team & Access Roles</h3>
                <p className="text-xs text-[#374151]">Manage permissions for store staff and managers</p>
              </div>
              <button
                onClick={() => showToast('Team invitation link generated!', 'info')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] text-[#881337] font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Invite Member
              </button>
            </div>

            <div className="divide-y divide-[#FBCBCB]/60 text-xs">
              {(teamMembers || []).map((member) => (
                <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#FBCBCB]"
                    />
                    <div>
                      <p className="font-bold text-[#0F172A]">{member.name}</p>
                      <p className="text-[11px] text-[#374151]">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#881337] border border-[#FBCBCB]">
                      {member.role}
                    </span>
                    {member.is2FA && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200">
                        2FA Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Payment Providers */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSavePayments} className="space-y-6 animate-fade-in text-xs">
          <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif">Payment Gateway API Keys (0% Platform Fee)</h3>
              <p className="text-xs text-[#374151]">Direct payouts into your bank account with zero middleman take</p>
            </div>

            {/* Razorpay */}
            <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-2">
              <span className="font-bold text-[#9F1239] block font-serif">Razorpay Live API Integration</span>
              <div className="space-y-1">
                <label className="text-[#374151] font-semibold">Razorpay Key ID</label>
                <input
                  type="text"
                  value={keysState.razorpayKey}
                  onChange={(e) => setKeysState({ ...keysState, razorpayKey: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-mono focus:outline-none focus:border-[#BE123C]"
                />
              </div>
            </div>

            {/* PhonePe */}
            <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-2">
              <span className="font-bold text-purple-700 block font-serif">PhonePe UPI Direct Merchant</span>
              <div className="space-y-1">
                <label className="text-[#374151] font-semibold">PhonePe Merchant ID</label>
                <input
                  type="text"
                  value={keysState.phonepeMerchant}
                  onChange={(e) => setKeysState({ ...keysState, phonepeMerchant: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-mono focus:outline-none focus:border-[#BE123C]"
                />
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0F172A] block font-serif">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-[#374151]">Allow customers to pay cash upon home delivery</span>
              </div>
              <input
                type="checkbox"
                checked={keysState.codEnabled}
                onChange={(e) => setKeysState({ ...keysState, codEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#9F1239]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold transition shadow-xs"
              >
                Save Payment Keys
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: Security & 2FA */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in text-xs">
          {/* 2FA Configuration */}
          <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#0F172A] font-serif flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#9F1239]" /> Two-Factor Authentication (2FA TOTP)
                </h3>
                <p className="text-xs text-[#374151]">
                  Require an authenticator code (Google Authenticator, Authy) on every admin login.
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  is2FAEnabled
                    ? 'bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}
              >
                {is2FAEnabled ? '✓ Enabled' : '○ Disabled'}
              </span>
            </div>

            {!is2FAEnabled && !show2FASetup && (
              <button
                onClick={() => setShow2FASetup(true)}
                className="px-4 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold transition shadow-xs"
              >
                Enable 2FA Protection
              </button>
            )}

            {show2FASetup && (
              <form onSubmit={handleConfirm2FA} className="p-4 rounded-3xl bg-[#fedddd] border border-[#F8B4B4] space-y-3">
                <p className="font-bold text-[#0F172A]">Scan with Google Authenticator or 1Password:</p>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white p-2 rounded-2xl border border-[#F8B4B4] flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-[#0F172A]" />
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <span className="text-[#374151] block">Or enter manual setup secret:</span>
                    <code className="font-mono font-bold text-[#9F1239] bg-white px-2 py-1 rounded-lg border border-[#F8B4B4]">
                      JULEX-2FA-AUTH-SEC-8921
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-36 px-3 py-2 bg-white border border-[#F8B4B4] rounded-2xl font-mono text-center font-bold tracking-widest text-[#0F172A]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-2xl bg-[#9F1239] text-white font-bold hover:bg-[#881337] transition"
                  >
                    Confirm & Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => setShow2FASetup(false)}
                    className="px-3 py-2 rounded-2xl bg-white border border-[#FBCBCB] text-[#374151]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Active Sessions */}
          <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A] font-serif flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#9F1239]" /> Active Device Sessions
                </h3>
                <p className="text-xs text-[#374151]">Manage devices currently signed into this merchant console</p>
              </div>
              <button
                onClick={handleRevokeAllSessions}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold transition text-xs"
              >
                Revoke Other Sessions
              </button>
            </div>

            <div className="divide-y divide-[#FBCBCB]/60 text-xs">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {sess.device.includes('iPhone') ? (
                      <Smartphone className="w-4 h-4 text-[#9F1239]" />
                    ) : (
                      <Laptop className="w-4 h-4 text-[#9F1239]" />
                    )}
                    <div>
                      <p className="font-bold text-[#0F172A]">{sess.device}</p>
                      <p className="text-[11px] text-[#374151]">{sess.location} • IP: {sess.ip}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sess.isCurrent ? 'bg-[#EAF5EC] text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {sess.lastActive}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
