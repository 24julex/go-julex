import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  MessageSquare,
  Instagram,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';

export const AdminChannels = () => {
  const { currentStore, showToast } = useMerchantAdmin();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    showToast('Storefront URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('All sales channels synced successfully with Meta Graph and WhatsApp API', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-serif flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <Globe className="w-6 h-6" style={{ color: 'var(--accent)' }} /> Omnichannel Sales & Commerce Sync
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              4 Channels Live
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Accept orders seamlessly across Online Web, WhatsApp 1-Click Checkout, Instagram Feed, and In-Store POS.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition disabled:opacity-50 shadow-xs cursor-pointer"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} style={{ color: 'var(--accent)' }} />
          {isSyncing ? 'Syncing Catalogs...' : 'Sync All Catalogs'}
        </button>
      </div>

      {/* 2. Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Online Storefront */}
        <div className="p-6 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Online Storefront</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Custom Domain & Edge CDN</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              Connected
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
            <span className="font-mono font-semibold truncate" style={{ color: 'var(--accent)' }}>
              https://{currentStore.customDomain || currentStore.subdomain}
            </span>
            <button
              onClick={() => handleCopy(`https://${currentStore.customDomain || currentStore.subdomain}`)}
              className="p-1 rounded-xl transition shrink-0 ml-2 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Free Automated Cloudflare SSL Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>0% Platform Commission Payment Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant UPI, Cards & NetBanking Integration</span>
            </div>
          </div>

          <div className="pt-2 border-t flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link
              to="/admin/channels/online-store/themes"
              className="flex-1 py-2 px-3 rounded-2xl font-bold text-center text-xs transition text-black"
              style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
            >
              🎨 Themes & Builder
            </Link>
            <Link
              to="/admin/channels/online-store/domains"
              className="flex-1 py-2 px-3 rounded-2xl font-semibold text-center text-xs transition"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              🔗 Domains & SSL
            </Link>
          </div>
        </div>

        {/* 2. WhatsApp Business */}
        <div className="p-6 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>WhatsApp Business</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>1-Click Checkout & Catalog Sync</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Registered Number:</span>
            <span className="font-mono text-emerald-500 font-bold">{currentStore.ownerPhone}</span>
          </div>

          <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Interactive AI Product Catalog in Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct WhatsApp UPI Instant Payment Link</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Automated Dispatch & Live Tracking Notifications</span>
            </div>
          </div>
        </div>

        {/* 3. Instagram / Facebook Shop */}
        <div className="p-6 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Instagram / FB Shop</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Meta Commerce Graph API</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              Synced
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Synced Handle:</span>
            <span className="font-mono text-pink-500 font-bold">@{currentStore.id}_official</span>
          </div>

          <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Product tagging in Instagram Reels & Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-time bi-directional inventory synchronization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
