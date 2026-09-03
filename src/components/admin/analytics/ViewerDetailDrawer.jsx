import React from 'react';
import {
  X,
  Eye,
  Users,
  Clock,
  Globe,
  MessageSquare,
  Instagram,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

export const ViewerDetailDrawer = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const total = product.totalViews || 0;
  const guestPercent = total > 0 ? Math.round((product.guestViews / total) * 100) : 0;
  const registeredPercent = total > 0 ? 100 - guestPercent : 0;

  const getChannelIcon = (ch = 'web') => {
    switch (ch.toLowerCase()) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-[#D4A017]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end text-[#0F172A]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Over Drawer */}
      <div className="relative w-full max-w-xl bg-white border-l border-[#FBCBCB] h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-6 border-b border-[#FBCBCB] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 rounded-2xl object-cover border border-[#FBCBCB] bg-white shrink-0"
            />
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] font-serif">{product.name}</h2>
              <p className="text-[11px] text-[#374151]">
                SKU: <span className="font-mono text-[#D4A017] font-bold">{product.sku}</span> • {product.category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white hover:bg-[#FEE2E2] text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* 1. Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#374151]">Total Views</span>
              <p className="text-lg font-black font-mono text-[#D4A017]">
                {product.totalViews.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#374151]">Unique Visitors</span>
              <p className="text-lg font-black font-mono text-[#0F172A]">
                {product.uniqueVisitors.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#374151]">Cart Additions</span>
              <p className="text-lg font-black font-mono text-amber-700">
                {product.addToCartCount}
              </p>
            </div>
          </div>

          {/* 2. Logged-in vs Anonymous IP Split */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
              <Users className="w-4 h-4 text-[#D4A017]" /> Logged-In Customers vs Anonymous IP Viewers
            </span>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#0F172A]">
                  👤 Registered Customer Views: <strong>{product.registeredViews}</strong> ({registeredPercent}%)
                </span>
                <span className="text-[#374151]">
                  🌐 Guest/Anonymous Views: <strong>{product.guestViews}</strong> ({guestPercent}%)
                </span>
              </div>

              <div className="w-full bg-white h-2 rounded-full overflow-hidden flex border border-[#FBCBCB]">
                <div className="bg-[#D4A017] h-full" style={{ width: `${registeredPercent}%` }} />
                <div className="bg-stone-300 h-full" style={{ width: `${guestPercent}%` }} />
              </div>
            </div>
          </div>

          {/* 3. Cohort Segmentation Breakdown */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
              <Layers className="w-4 h-4 text-[#D4A017]" /> Viewer Cohort Segmentation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-purple-200 space-y-1">
                <span className="text-[10px] text-purple-700 font-bold block">🟣 Repeat Buyers</span>
                <p className="text-base font-black font-mono text-[#0F172A]">
                  {product.cohortBreakdown.repeatBuyers}
                </p>
                <p className="text-[10px] text-[#374151]">Placed &gt;1 orders</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold block">🟢 First-Time Buyers</span>
                <p className="text-base font-black font-mono text-[#0F172A]">
                  {product.cohortBreakdown.firstTimeBuyers}
                </p>
                <p className="text-[10px] text-[#374151]">Placed 1 order</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#FBCBCB] space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">⚪ Non-Purchaser Viewers</span>
                <p className="text-base font-black font-mono text-[#0F172A]">
                  {product.cohortBreakdown.nonPurchaserViewers}
                </p>
                <p className="text-[10px] text-[#374151]">Zero past orders</p>
              </div>
            </div>
          </div>

          {/* 4. Real-time Timestamp Activity Log */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
              <Activity className="w-4 h-4 text-emerald-600" /> Recent Viewer Session Telemetry
            </span>

            <div className="divide-y divide-[#FBCBCB]/60">
              {product.recentViewLogs.map((log, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white border border-[#FBCBCB]">
                      {getChannelIcon(log.channel)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] flex items-center gap-2">
                        {log.user}
                        <span
                          className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                            log.type === 'Repeat Buyer'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : log.type === 'First-Time Buyer'
                              ? 'bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200'
                              : 'bg-slate-100 text-[#374151]'
                          }`}
                        >
                          {log.type}
                        </span>
                      </p>
                      <p className="text-[10px] text-[#374151]">
                        {log.time} • Spent {log.duration} on page
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {log.cartAdded ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-[#EAF5EC] px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <ShoppingCart className="w-3 h-3 text-emerald-600" /> Added to Cart
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#374151]">Viewed SKU</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
