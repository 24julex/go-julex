import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PlansGateModal } from '@/components/common/PlansGateModal';

// ============================================================================
// NEW STORE ONBOARDING WIZARD — identity → subdomain → plans → dashboard.
// Everything is saved to the backend as it is entered; the store stays DRAFT
// until a plan is paid for and publishing is authorised.
// ============================================================================
const CATEGORIES = [
  'Fashion & Apparel', 'Food & Sweets', 'Jewelry & Accessories', 'Beauty & Cosmetics',
  'Home & Living', 'Electronics & Audio', 'Books & Stationery', 'Toys & Gifts',
  'Handicrafts & Artisan', 'Other'
];

export const StoreOnboardingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  const makeSlug = (name) => String(name || '').toLowerCase().replace(/[\u2018\u2019']/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '').slice(0, 40);
  const [slug, setSlug] = useState('');
  const [slugInfo, setSlugInfo] = useState(null);
  const [plansOpen, setPlansOpen] = useState(false);

  useEffect(() => {
    setSlug(makeSlug(storeName));
  }, [storeName]);

  useEffect(() => {
    if (!slug || step !== 2) return;
    let cancelled = false;
    const t = setTimeout(() => {
      api.domains.checkSlug(slug)
        .then((res) => { if (!cancelled) setSlugInfo(res); })
        .catch(() => { if (!cancelled) setSlugInfo(null); });
    }, 450);
    return () => { cancelled = true; clearTimeout(t); };
  }, [slug, step]);

  const readFile = (file, cb) => {
    const rd = new FileReader();
    rd.onload = () => cb(rd.result);
    rd.readAsDataURL(file);
  };

  const saveIdentity = async () => {
    if (!storeName.trim()) { setError('Please enter your store name.'); return false; }
    setSaving(true); setError('');
    try {
      const res = await api.storeStatus.saveProfile({
        name: storeName.trim(),
        category,
        whatsappNumber: whatsapp,
        instagramHandle: instagram,
        ownerPhone,
        logoUrl,
        profileImageUrl: profileUrl
      });
      if (!res?.success) { setError(res?.message || 'Could not save.'); return false; }
      return true;
    } catch (e) {
      setError('Could not reach the server.'); return false;
    } finally { setSaving(false); }
  };

  const finish = () => navigate('/admin');

  return (
    <div className="min-h-screen bg-[#FFF9F6] text-[#0F172A] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl font-black">Set up your store</h1>
          <p className="text-xs text-[#475569]">Everything saves as you go. Your store stays private (DRAFT) until you choose a plan and publish.</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
          {['Store Identity', 'Domain', 'Plan'].map((label, i) => (
            <div key={label} className={'px-3 py-1.5 rounded-full border ' + (step === i + 1 ? 'bg-[#9F1239] text-white border-[#9F1239]' : 'bg-white text-[#881337] border-[#FBCBCB]')}>{i + 1}. {label}</div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-[#FBCBCB] p-6 space-y-4 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Store Name *</label>
                <input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. Bee's Sweets & Snacks" className="w-full px-3.5 py-2.5 border border-[#FBCBCB] rounded-2xl font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 border border-[#FBCBCB] rounded-2xl bg-white">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">WhatsApp Number <span className="text-[9px] font-normal text-stone-400">(saved, not "connected")</span></label>
                  <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2 border border-[#FBCBCB] rounded-2xl" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Instagram Handle <span className="text-[9px] font-normal text-stone-400">(saved, not "connected")</span></label>
                  <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourstore" className="w-full px-3 py-2 border border-[#FBCBCB] rounded-2xl" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Owner Phone</label>
                <input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="+91 ..." className="w-full px-3 py-2 border border-[#FBCBCB] rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold block">Store Logo</label>
                  {logoUrl ? <img src={logoUrl} alt="logo" className="h-16 w-16 rounded-2xl object-cover border border-[#FBCBCB]" /> : null}
                  <div className="flex gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-[#fedddd] border border-[#F8B4B4] text-[#881337] text-[11px] font-bold cursor-pointer">
                      {logoUrl ? 'Replace' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, setLogoUrl); }} />
                    </label>
                    {logoUrl && <button onClick={() => setLogoUrl('')} className="text-[11px] font-bold text-stone-500 hover:text-[#881337] cursor-pointer">Remove</button>}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold block">Store Profile Picture</label>
                  {profileUrl ? <img src={profileUrl} alt="profile" className="h-16 w-16 rounded-full object-cover border border-[#FBCBCB]" /> : null}
                  <div className="flex gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-[#fedddd] border border-[#F8B4B4] text-[#881337] text-[11px] font-bold cursor-pointer">
                      {profileUrl ? 'Replace' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, setProfileUrl); }} />
                    </label>
                    {profileUrl && <button onClick={() => setProfileUrl('')} className="text-[11px] font-bold text-stone-500 hover:text-[#881337] cursor-pointer">Remove</button>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Your Go Julex subdomain</label>
                <div className="flex items-center border border-[#FBCBCB] rounded-2xl px-3 py-2 bg-white">
                  <span className="text-stone-400 font-mono text-[11px]">https://</span>
                  <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} className="flex-1 bg-transparent px-1 font-mono font-bold text-[#9F1239]" />
                  <span className="text-stone-400 font-mono text-[11px]">.go.julex.shop</span>
                </div>
                {slugInfo && (
                  <p className={'text-[10.5px] mt-1 font-semibold ' + (slugInfo.available ? 'text-emerald-600' : 'text-[#9F1239]')}>{slugInfo.message}</p>
                )}
              </div>
              <p className="text-[11px] text-stone-500">Auto-generated from your store name — edit it if you like. Availability is checked live against the platform. Your domain is reserved now and goes public when your store is published.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-bold">Choose a plan for your store</p>
              <p className="text-xs text-[#475569]">You can explore and build your entire store first — payment is only needed to publish. Plans load live from Go Julex.</p>
              <button onClick={() => setPlansOpen(true)} className="px-5 py-3 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs transition cursor-pointer">View Go Julex Plans</button>
              <p className="text-[10.5px] text-stone-500">The payment gateway is currently being configured — selecting a plan now records your choice and keeps your store saved as a draft.</p>
            </div>
          )}

          {error && <p className="text-xs font-bold text-[#9F1239]">{error}</p>}

          <div className="flex justify-between pt-2 border-t border-[#FBCBCB]">
            <button onClick={() => (step > 1 ? setStep(step - 1) : navigate('/admin'))} className="px-4 py-2 rounded-2xl bg-white border border-[#FBCBCB] text-[#881337] text-xs font-bold cursor-pointer">Back</button>
            {step < 3 ? (
              <button
                onClick={async () => { const ok = step === 1 ? await saveIdentity() : true; if (ok) setStep(step + 1); }}
                disabled={saving}
                className="px-5 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold disabled:opacity-60 cursor-pointer"
              >{saving ? 'Saving…' : 'Continue'}</button>
            ) : (
              <button onClick={finish} className="px-5 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold cursor-pointer">Go to Dashboard</button>
            )}
          </div>
        </div>
      </div>

      <PlansGateModal open={plansOpen} onClose={() => setPlansOpen(false)} />
    </div>
  );
};
