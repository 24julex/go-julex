import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
  Server,
  Lock,
  Store,
  Save,
  Tag
} from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';

export const AdminDomains = () => {
  const { currentStore, updateStoreProfile, showToast } = useMerchantAdmin();

  // Store profile fields
  const [storeName, setStoreName] = useState(currentStore.name || 'My Store');
  const [subdomainSlug, setSubdomainSlug] = useState(
    (currentStore.subdomain || 'mystore').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/[^a-z0-9]/g, '')
  );
  const [categoryLabel, setCategoryLabel] = useState(currentStore.categoryLabel || 'Fine Jewelry & Luxury');

  const [copiedSubdomain, setCopiedSubdomain] = useState(false);
  const [copiedCustomDomain, setCopiedCustomDomain] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [customDomain, setCustomDomain] = useState(
    currentStore.customDomain || `${subdomainSlug}.in`
  );

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'sub') {
      setCopiedSubdomain(true);
      setTimeout(() => setCopiedSubdomain(false), 2000);
    } else {
      setCopiedCustomDomain(true);
      setTimeout(() => setCopiedCustomDomain(false), 2000);
    }
    showToast('Domain URL copied to clipboard!', 'info');
  };

  const handleSaveBrandProfile = (e) => {
    e.preventDefault();
    const cleanSub = subdomainSlug.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'mystore';
    updateStoreProfile({
      name: storeName.trim(),
      subdomain: cleanSub,
      categoryLabel: categoryLabel.trim()
    });
  };

  const handleVerifyDns = () => {
    if (!customDomainInput.trim()) return;
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const cleanDom = customDomainInput.trim().toLowerCase();
      setCustomDomain(cleanDom);
      updateStoreProfile({ customDomain: cleanDom });
      setIsConnectModalOpen(false);
      setCustomDomainInput('');
      showToast('DNS verified and Free Cloudflare SSL provisioned successfully!', 'success');
    }, 1200);
  };

  const handleRemoveCustomDomain = () => {
    setCustomDomain('');
    updateStoreProfile({ customDomain: '' });
    showToast('Custom domain disconnected', 'info');
  };

  const cleanSubdomainUrl = (subdomainSlug || 'mystore').toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div className="space-y-8 text-[#0F172A] pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#FBCBCB] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif tracking-tight flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-[#9F1239]" /> Store Identity & Domain Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
              🟢 Edge CDN Active
            </span>
          </div>
          <p className="text-xs text-[#374151] mt-1">
            Customize your unique store brand name, personalize your Go Julex subdomain, and connect custom apex domains with free Cloudflare SSL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/store/${cleanSubdomainUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#fedddd] hover:bg-[#FECDD3] text-[#881337] border border-[#F8B4B4] text-xs font-bold transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live Storefront
          </Link>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Connect Custom Domain
          </button>
        </div>
      </div>

      {/* 2. Brand Identity & Subdomain Customizer */}
      <form onSubmit={handleSaveBrandProfile} className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif">Store Identity & Slug Settings</h3>
              <p className="text-xs text-[#374151]">Update your brand name and custom Go Julex subdomain slug</p>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs transition shadow-xs"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#0F172A] block mb-1.5">
              E-Commerce Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Abinaya Luxe Studio"
              className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-bold focus:outline-none focus:border-[#BE123C]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#0F172A] block mb-1.5">
              Go Julex Subdomain Slug
            </label>
            <div className="flex items-center bg-white border border-[#FBCBCB] rounded-2xl overflow-hidden px-3 py-2">
              <span className="text-slate-400 font-mono">https://</span>
              <input
                type="text"
                required
                value={subdomainSlug}
                onChange={(e) => setSubdomainSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="mystore"
                className="w-28 bg-transparent text-[#9F1239] font-mono font-bold focus:outline-none px-1"
              />
              <span className="text-slate-400 font-mono text-[11px]">.gojulex.com</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#0F172A] block mb-1.5">
              Store Category / Niche
            </label>
            <input
              type="text"
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              placeholder="e.g. Fine Jewelry & Luxury"
              className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
            />
          </div>
        </div>
      </form>

      {/* 3. Default Go Julex Subdomain Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif">Active Store Subdomain</h3>
              <p className="text-xs text-[#374151]">Fast, high-availability hostname managed by Go Julex</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200">
            🟢 Active & SSL Secured
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#FBCBCB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="font-mono text-[#9F1239] font-bold text-sm">
              https://{cleanSubdomainUrl}.gojulex.com
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleCopy(`https://${cleanSubdomainUrl}.gojulex.com`, 'sub')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-xs font-semibold text-[#881337] transition"
            >
              {copiedSubdomain ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy URL</span>
                </>
              )}
            </button>

            <Link
              to={`/store/${cleanSubdomainUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fedddd] hover:bg-[#FECDD3] text-[#881337] border border-[#F8B4B4] text-xs font-bold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Visit Store
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Branded Custom Domain Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif">Primary Custom Domain</h3>
              <p className="text-xs text-[#374151]">Branded domain served over Global Cloudflare CDN</p>
            </div>
          </div>

          {customDomain ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200">
              🟢 Connected & Verified
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#374151]">
              Not Connected
            </span>
          )}
        </div>

        {customDomain ? (
          <div className="p-4 rounded-2xl bg-white border border-[#FBCBCB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="font-mono text-[#0F172A] font-bold text-sm">
                  https://{customDomain}
                </span>
              </div>
              <p className="text-[10px] text-[#374151]">
                DNS: <code className="text-[#9F1239] font-semibold">CNAME → domains.gojulex.com</code> • SSL: Cloudflare Universal
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleCopy(`https://${customDomain}`, 'custom')}
                className="p-2 rounded-xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-[#881337] transition"
                title="Copy Domain"
              >
                {copiedCustomDomain ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                onClick={handleRemoveCustomDomain}
                className="p-2 rounded-xl bg-red-50 hover:bg-rose-100 text-[#9B1C1C] border border-rose-200 transition"
                title="Disconnect Domain"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-white border border-dashed border-[#FBCBCB] space-y-3">
            <Globe className="w-8 h-8 text-[#9F1239] mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="font-bold text-[#0F172A] text-xs">No Custom Domain Connected Yet</p>
              <p className="text-[11px] text-[#374151] max-w-sm mx-auto">
                Connect your existing GoDaddy, Namecheap, or Google Domains domain to build trust and brand identity.
              </p>
            </div>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition"
            >
              + Connect Existing Domain
            </button>
          </div>
        )}
      </div>

      {/* 5. Connect Existing Domain Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#FBCBCB] rounded-3xl p-6 space-y-5 shadow-2xl text-xs text-[#0F172A] animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A] font-serif">Connect Custom Domain</h3>
                <p className="text-[11px] text-[#374151]">Point your DNS records to Go Julex CDN</p>
              </div>
              <button onClick={() => setIsConnectModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Step 1: Input Domain */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0F172A]">
                Step 1: Enter your domain or subdomain name
              </label>
              <input
                type="text"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                placeholder="e.g. mystudio.in or shop.mybrand.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] font-mono text-xs focus:outline-none focus:border-[#BE123C]"
              />
            </div>

            {/* Step 2: DNS Instruction Box */}
            <div className="p-4 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] space-y-2.5">
              <span className="font-bold text-[#881337] block">Step 2: Add these DNS Records to your Registrar</span>
              <div className="overflow-x-auto font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-[#F8B4B4]">
                      <th className="pb-1">Type</th>
                      <th className="pb-1">Name</th>
                      <th className="pb-1">Target / Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FBCBCB] text-[#0F172A]">
                    <tr>
                      <td className="py-1.5 font-bold text-[#9F1239]">CNAME</td>
                      <td className="py-1.5">@ / www</td>
                      <td className="py-1.5 text-emerald-700 font-bold">domains.gojulex.com</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-[#9F1239]">A</td>
                      <td className="py-1.5">@</td>
                      <td className="py-1.5 text-emerald-700 font-bold">76.76.21.21</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 rounded-2xl bg-white border border-[#FBCBCB] text-[#881337] hover:bg-[#FEE2E2] transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifying || !customDomainInput.trim()}
                onClick={handleVerifyDns}
                className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold transition shadow-xs disabled:opacity-40"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying DNS...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Verify DNS & Provision SSL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDomains;
