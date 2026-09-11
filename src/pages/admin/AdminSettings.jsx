import React, { useState, useEffect } from 'react';
import {
  Settings, Store, Users, ShieldCheck, KeyRound,
  CheckCircle2, AlertCircle, Lock, Save, Check,
  Building, Mail, Phone, MapPin, Upload
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const AdminSettings = () => {
  const { showToast } = useMerchantAdmin();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Store profile from the DATABASE (same source as Dashboard/Welcome Card/Domains)
  const [storeData, setStoreData] = useState(null);
  const [storeProfile, setStoreProfile] = useState({
    name: '', category: '', whatsappNumber: '', ownerPhone: '',
    logoUrl: '', profileImageUrl: '', instagramHandle: ''
  });

  useEffect(() => {
    api.storeStatus.get()
      .then((res) => {
        if (res?.success && res.data) {
          setStoreData(res.data);
          setStoreProfile({
            name: res.data.name || '',
            category: res.data.category || '',
            whatsappNumber: res.data.whatsappNumber || '',
            ownerPhone: res.data.ownerPhone || '',
            logoUrl: res.data.logoUrl || '',
            profileImageUrl: res.data.profileImageUrl || '',
            instagramHandle: res.data.instagramHandle || ''
          });
        }
      })
      .catch(() => {});
  }, []);

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
        subdomain: storeData?.subdomain || undefined
      });
      if (res?.success) {
        showToast('Store profile saved — updated everywhere.', 'success');
        // Re-fetch so all connected pages reflect the change
        const fresh = await api.storeStatus.get().catch(() => null);
        if (fresh?.success) setStoreData(fresh.data);
      } else {
        showToast(res?.message || 'Could not save profile.', 'error');
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

  return (
    <div className="space-y-6 pb-16 text-[#0F172A]">
      {/* Header */}
      <div className="border-b border-[#FBCBCB] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#9F1239]" /> Settings
        </h1>
        <p className="text-xs text-[#374151] mt-1">
          Store profile changes save to the database and appear on all pages (Dashboard, Domains, Storefront).
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2">
        {[
          { id: 'general', label: 'Store Profile', icon: Store },
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
          {/* Store Identity */}
          <div className="space-y-4">
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
          </div>

          {/* Branding */}
          <div className="space-y-4 pt-2 border-t border-[#FBCBCB]">
            <h3 className="font-bold text-sm flex items-center gap-2">
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
          {storeData && (
            <div className="pt-2 border-t border-[#FBCBCB] space-y-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#9F1239]" /> Domain
              </h3>
              <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#FBCBCB] text-xs font-mono">
                https://{String(storeData.subdomain || '').replace(/\.gojulex\.com$/, '').replace(/\.go\.julex\.shop$/, '')}.go.julex.shop
              </div>
              <p className="text-[10px] text-stone-500">Change your domain from the Online Store → Domains page.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs transition disabled:opacity-60 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save to Database'}
          </button>
        </form>
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-sm">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#9F1239]" /> Account Security
          </h3>
          <div className="p-3 rounded-xl bg-[#FFF9F6] border border-[#FBCBCB] text-xs">
            <p><strong>Account:</strong> {currentUser?.email || 'Unknown'}</p>
            <p><strong>Role:</strong> {currentUser?.role || 'Unknown'}</p>
            <p><strong>2FA:</strong> {currentUser?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          <p className="text-[10px] text-stone-500">
            Password changes and 2FA setup will be available in a future update.
          </p>
        </div>
      )}
    </div>
  );
};
