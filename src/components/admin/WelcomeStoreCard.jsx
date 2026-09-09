import React, { useState } from 'react';
import { api } from '../../services/api';

// ============================================================================
// WELCOME STORE CARD — invitation-sized card shown ONCE on the merchant's
// first dashboard visit. Collects: store name, business type, business phone,
// owner phone, logo, profile picture. Saves to the backend on "Get Started".
// Phone fields use a fixed +91 prefix — owner fills only the 10-digit number.
// ============================================================================
const BUSINESS_TYPES = [
  'Fashion & Apparel', 'Food & Sweets', 'Jewelry & Accessories',
  'Beauty & Cosmetics', 'Home & Living', 'Electronics',
  'Books & Stationery', 'Toys & Gifts', 'Handicrafts', 'Other'
];

const PhoneField = ({ label, value, onChange }) => {
  const digits = (value || '').replace(/^\+91\s?/, '').replace(/[^0-9]/g, '').slice(0, 10);
  const handleChange = (raw) => {
    const d = raw.replace(/[^0-9]/g, '').slice(0, 10);
    onChange(d ? `+91 ${d}` : '');
  };
  return (
    <div>
      <label className="text-[10px] font-bold text-amber-300 block mb-1">{label}</label>
      <div className="flex">
        <span className="px-3 py-2 border border-[#FBCBCB] border-r-0 rounded-l-xl text-sm font-mono font-bold text-slate-300 bg-white/5">+91</span>
        <input
          type="tel"
          value={digits}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="98765 43210"
          maxLength={10}
          className="w-full px-3 py-2 border border-[#FBCBCB] border-l-0 rounded-r-xl text-sm bg-white focus:outline-none focus:border-[#9F1239] font-mono"
        />
      </div>
    </div>
  );
};

export const WelcomeStoreCard = ({ storeData, onDone }) => {
  const [storeName, setStoreName] = useState(storeData?.name || '');
  const [businessType, setBusinessType] = useState(storeData?.category || BUSINESS_TYPES[0]);
  const [businessPhone, setBusinessPhone] = useState(storeData?.whatsappNumber || '');
  const [ownerPhone, setOwnerPhone] = useState(storeData?.ownerPhone || '');
  const [logoUrl, setLogoUrl] = useState(storeData?.logoUrl || '');
  const [profileUrl, setProfileUrl] = useState(storeData?.profileImageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const readFile = (file, cb) => {
    const rd = new FileReader();
    rd.onload = () => cb(rd.result);
    rd.readAsDataURL(file);
  };

  const handleGetStarted = async () => {
    if (!storeName.trim()) { setError('Please enter your store name.'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.storeStatus.saveProfile({
        name: storeName.trim(),
        category: businessType,
        whatsappNumber: businessPhone.trim(),
        ownerPhone: ownerPhone.trim(),
        logoUrl,
        profileImageUrl: profileUrl
      });
      if (res?.success) {
        localStorage.setItem('gojulex_welcome_card_done', '1');
        onDone && onDone();
      } else {
        setError(res?.message || 'Could not save. Please try again.');
      }
    } catch (e) {
      setError('Could not reach the server. Please check your connection.');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2 border border-[#FBCBCB] rounded-xl text-sm bg-white focus:outline-none focus:border-[#9F1239]';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      {/* Invitation-sized card */}
      <div
        className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh', backgroundColor: '#0F172A', border: '1px solid rgba(212,160,23,0.3)' }}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#1a1a2e,#0F172A)' }}>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: '#D4A017' }}>Welcome to Go Julex</p>
            <h2 className="font-serif text-lg font-black text-white leading-tight">Let's Create Your Own Store</h2>
          </div>
        </div>

        {/* Form body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="text-[10px] font-bold text-amber-300 block mb-1">1. What's your store name?</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Enter your store name" className={inputCls} />
          </div>

          <div>
            <label className="text-[10px] font-bold text-amber-300 block mb-1">2. What kind of e-commerce business?</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={inputCls + ' bg-white cursor-pointer'}>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <PhoneField label="3. Business official phone number?" value={businessPhone} onChange={setBusinessPhone} />
          <PhoneField label="4. Owner's phone number?" value={ownerPhone} onChange={setOwnerPhone} />

          <div className="flex gap-3 pt-1">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-amber-300 block mb-1">5. Store logo</label>
              {logoUrl && <img src={logoUrl} alt="logo" className="h-12 w-12 rounded-xl object-cover mb-1 border border-amber-500/30" />}
              <div className="flex gap-1.5">
                <label className="px-2.5 py-1 rounded-lg bg-white/10 border border-amber-500/30 text-amber-200 text-[10px] font-bold cursor-pointer hover:bg-white/20 transition">
                  {logoUrl ? 'Replace' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, setLogoUrl); }} />
                </label>
                {logoUrl && <button onClick={() => setLogoUrl('')} className="text-[10px] text-slate-400 hover:text-rose-300 cursor-pointer">Remove</button>}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-amber-300 block mb-1">6. Profile picture</label>
              {profileUrl && <img src={profileUrl} alt="profile" className="h-12 w-12 rounded-full object-cover mb-1 border border-amber-500/30" />}
              <div className="flex gap-1.5">
                <label className="px-2.5 py-1 rounded-lg bg-white/10 border border-amber-500/30 text-amber-200 text-[10px] font-bold cursor-pointer hover:bg-white/20 transition">
                  {profileUrl ? 'Replace' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, setProfileUrl); }} />
                </label>
                {profileUrl && <button onClick={() => setProfileUrl('')} className="text-[10px] text-slate-400 hover:text-rose-300 cursor-pointer">Remove</button>}
              </div>
            </div>
          </div>

          {error && <p className="text-[11px] font-bold text-rose-400 pt-1">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-3 shrink-0 border-t border-white/10">
          <button
            onClick={handleGetStarted}
            disabled={saving}
            className="w-full py-2.5 rounded-xl font-black text-sm transition transform active:scale-98 cursor-pointer disabled:opacity-60 text-black"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            {saving ? 'Saving…' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
};
