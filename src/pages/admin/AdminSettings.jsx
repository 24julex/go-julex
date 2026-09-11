import React, { useState, useEffect } from 'react';
import {
  Settings, Store, Users, ShieldCheck, CreditCard, KeyRound,
  CheckCircle2, AlertCircle, Lock, Save,
  Building, Mail, Phone, MapPin, Upload, RefreshCw
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const AdminSettings = () => {
  const { currentStore, showToast } = useMerchantAdmin();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Store profile — populated from the DATABASE
  const [storeProfile, setStoreProfile] = useState({
    name: '', category: '', whatsappNumber: '', ownerPhone: '',
    logoUrl: '', profileImageUrl: '', instagramHandle: ''
  });

  const loadFromDB = async () => {
    setLoading(true); setLoadError(null);
    try {
      const res = await api.storeStatus.get();
      if (res?.success && res.data) {
        setStoreProfile({
          name: res.data.name || currentStore?.name || '',
          category: res.data.category || currentStore?.categoryLabel || '',
          whatsappNumber: res.data.whatsappNumber || '',
          ownerPhone: res.data.ownerPhone || '',
          logoUrl: res.data.logoUrl || '',
          profileImageUrl: res.data.profileImageUrl || '',
          instagramHandle: res.data.instagramHandle || ''
        });
      } else {
        setLoadError(res?.message || 'Could not load store data.');
      }
    } catch (err) {
      // Fallback to context data if API fails
      setStoreProfile({
        name: currentStore?.name || '',
        category: currentStore?.categoryLabel || '',
        whatsappNumber: currentStore?.whatsappNumber || currentStore?.ownerPhone || '',
        ownerPhone: currentStore?.ownerPhone || '',
        logoUrl: currentStore?.logoUrl || '',
        profileImageUrl: currentStore?.profileImageUrl || '',
        instagramHandle: currentStore?.instagramHandle || ''
      });
      setLoadError('Could not reach the server — showing cached data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadFromDB(); }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.storeStatus.saveProfile({
        name: storeProfile.name.trim(),
        category: storeProfile.category.trim(),
        whatsappNumber: storeProfile.whatsappNumber.trim(),
        ownerPhone: storeProfile.ownerPhone.trim(),
        logoUrl: storeProfile.logoUrl,
        profileImageUrl: storeProfile.profileImageUrl,
        instagramHandle: storeProfile.instagramHandle.trim(),
        subdomain: currentStore?.subdomain || undefined
      });
      if (res?.success) {
        showToast('Saved — changes appear on all pages.', 'success');
      } else if (res?.message?.includes('not linked') || res?.message?.includes('No store')) {
        showToast('Your session is stale. Please log out and log back in.', 'error');
      } else {
        showToast(res?.message || 'Could not save.', 'error');
      }
    } catch (err) {
      showToast('Could not reach the server.', 'error');
    } finally { setSaving(false); }
  };

  const readFile = (file, cb) => {
    const rd = new FileReader();
    rd.onload = () => cb(rd.result);
    rd.readAsDataURL(file);
  };

  const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#9F1239]';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
        <span className="ml-2 text-sm">Loading store data from database…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 text-[#0F172A]">
      {/* Header */}
      <div className="border-b border-[#FBCBCB] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#9F1239]" /> Settings
        </h1>
        <p className="text-xs text-[#374151] mt-1">
          Changes save to the database and sync across Dashboard, Domains, and your live store.
        </p>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 flex items-center justify-between">
          <p className="text-xs text-amber-800">{loadError}</p>
          <button onClick={loadFromDB} className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-bold cursor-pointer">Retry</button>
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'general', label: 'Store Profile', icon: Store },
          { id: 'plan', label: 'Plan & Billing', icon: CreditCard },
          { id: 'security', label: 'Security', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={'px-4 py-2 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ' +
              (activeTab === tab.id ? 'bg-[#9F1239] text-white' : 'bg-white border border-[#FBCBCB] text-[#881337]')}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-5 shadow-sm">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-[#9F1239]" /> Store Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">Store Name</label>
              <input value={storeProfile.name} onChange={(e) => setStoreProfile({...storeProfile, name: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">Category / Business Type</label>
              <input value={storeProfile.category} onChange={(e) => setStoreProfile({...storeProfile, category: e.target.value})} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Business Phone (WhatsApp)</label>
              <input value={storeProfile.whatsappNumber} onChange={(e) => setStoreProfile({...storeProfile, whatsappNumber: e.target.value})} placeholder="+91 ..." className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Owner Phone</label>
              <input value={storeProfile.ownerPhone} onChange={(e) => setStoreProfile({...storeProfile, ownerPhone: e.target.value})} placeholder="+91 ..." className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Instagram Handle</label>
            <input value={storeProfile.instagramHandle} onChange={(e) => setStoreProfile({...storeProfile, instagramHandle: e.target.value})} placeholder="@yourstore" className={inputCls} />
          </div>

          {/* Branding */}
          <div className="pt-4 border-t border-[#FBCBCB]">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-[#9F1239]" /> Store Branding
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Store Logo</label>
                {storeProfile.logoUrl && <img src={storeProfile.logoUrl} alt="logo" className="h-16 w-16 rounded-2xl object-cover mb-2 border border-[#FBCBCB]" />}
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-[#fedddd] border border-[#F8B4B4] text-[#881337] text-xs font-bold cursor-pointer">
                    {storeProfile.logoUrl ? 'Replace' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, (url) => setStoreProfile({...storeProfile, logoUrl: url})); }} />
                  </label>
                  {storeProfile.logoUrl && <button type="button" onClick={() => setStoreProfile({...storeProfile, logoUrl: ''})} className="text-xs text-stone-500 hover:text-[#881337]">Remove</button>}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Profile Picture</label>
                {storeProfile.profileImageUrl && <img src={storeProfile.profileImageUrl} alt="profile" className="h-16 w-16 rounded-full object-cover mb-2 border border-[#FBCBCB]" />}
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-[#fedddd] border border-[#F8B4B4] text-[#881337] text-xs font-bold cursor-pointer">
                    {storeProfile.profileImageUrl ? 'Replace' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f, (url) => setStoreProfile({...storeProfile, profileImageUrl: url})); }} />
                  </label>
                  {storeProfile.profileImageUrl && <button type="button" onClick={() => setStoreProfile({...storeProfile, profileImageUrl: ''})} className="text-xs text-stone-500 hover:text-[#881337]">Remove</button>}
                </div>
              </div>
            </div>
          </div>

          {/* Domain info (read-only) */}
          <div className="pt-4 border-t border-[#FBCBCB]">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-[#9F1239]" /> Store Domain
            </h3>
            <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#FBCBCB] text-xs font-mono">
              https://{String(currentStore?.subdomain || '').replace(/\.gojulex\.com$/, '').replace(/\.go\.julex\.shop$/, '')}.go.julex.shop
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Manage your domain from Online Store → Domains.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs transition disabled:opacity-60 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'plan' && (
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-sm">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#9F1239]" /> Plan & Billing
          </h3>
          <PlanInfoCard />
        </div>
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-sm">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#9F1239]" /> Account Security
          </h3>
          <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#FBCBCB] text-xs space-y-1">
            <p><strong>Account:</strong> {currentUser?.email || 'Unknown'}</p>
            <p><strong>Role:</strong> {currentUser?.role || 'Unknown'}</p>
            <p><strong>2FA:</strong> {currentUser?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="px-4 py-2 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold cursor-pointer"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

// Inline plan status card
const PlanInfoCard = () => {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    api.storeStatus.get()
      .then((res) => { if (res?.success) setInfo(res.data); })
      .catch(() => {});
  }, []);

  if (!info) return <p className="text-xs text-stone-500">Loading plan info…</p>;

  const sub = info.subscription;
  return (
    <div className="p-4 rounded-2xl border space-y-2" style={{ borderColor: info.canPublish ? '#10B981' : '#F59E0B', backgroundColor: info.canPublish ? '#F0FDF4' : '#FFFBEB' }}>
      <div className="flex items-center gap-2">
        {info.canPublish ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
        <p className="text-sm font-black">{info.canPublish ? 'Your store is live' : 'Your store is not live yet'}</p>
      </div>
      <p className="text-xs opacity-80">
        {sub?.status === 'ACTIVE'
          ? `Active plan: ${sub.plan?.name || 'Active'}`
          : sub?.plan?.name
            ? `Plan selected: ${sub.plan.name} — payment pending`
            : 'No plan purchased. Visit the Billing page to choose a plan.'}
      </p>
    </div>
  );
};
