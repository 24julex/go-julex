import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Globe,
  MessageSquare,
  Instagram,
  CheckCircle2,
  Send,
  ExternalLink,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { useAuth } from '../../context/AuthContext';
import { OrderDetailModal } from '../../components/admin/orders/OrderDetailModal';
import { InvoiceTemplate } from '../../components/admin/orders/InvoiceTemplate';
import { EditSalesChannelModal } from '../../components/admin/channels/EditSalesChannelModal';

export const AdminDashboard = () => {
  const { currentStore, kpis, orders, products, sendInvoiceEmail } = useMerchantAdmin();
  const { currentUser } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isChannelModalOpen, setChannelModalOpen] = useState(false);

  const cleanSubdomain = (currentStore?.subdomain || 'luxestudio').toLowerCase().replace(/\.gojulex\.com$/, '');
  const liveStoreUrl = `/store/${cleanSubdomain}`;
  const ownerName = (() => {
    let raw = currentUser?.role === 'SUPER_ADMIN' ? (currentUser?.name || 'Super Admin') : (currentStore?.ownerName || 'Store Owner');
    if (raw.includes('Eleanor') || raw.includes('Aditya') || raw.includes('Rajesh')) return 'Super Admin';
    return raw;
  })();

  const savedChannels = (() => {
    try {
      const raw = localStorage.getItem(`gojulex_store_channels_${currentStore?.id}`) ||
                  localStorage.getItem(`gojulex_store_channels_${currentStore?.subdomain}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  })();

  const displayWhatsApp = savedChannels?.whatsappNumber || currentStore?.ownerPhone || '+91 98765 43210';
  const cleanHandleBase = (currentStore?.subdomain || currentStore?.id || 'store').replace(/^store_/, '');
  const displayInstagram = savedChannels?.instagramHandle || currentStore?.instagramHandle || `@${cleanHandleBase}_official`;

  const recentOrders = orders.slice(0, 5);

  const checklistSteps = [
    { title: 'Store instance provisioned', completed: true },
    { title: 'Connect custom domain SSL', completed: Boolean(currentStore?.customDomain) },
    { title: 'Add catalog products & variants', completed: products.length > 0 },
    { title: 'Connect 0% fee payment gateway', completed: true },
    { title: 'Enable 1-Click WhatsApp Checkout', completed: true }
  ];

  const completedCount = checklistSteps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / checklistSteps.length) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner & Store Quick Overview */}
      <div
        className="p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              0% PLATFORM FEE SAAS
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>• {currentStore?.categoryLabel || 'Retail Store'}</span>
          </div>
          <h1 className="text-2xl font-black font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {ownerName} 👋
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Managing <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentStore?.name || 'My Store'}</span> on Go Julex Merchant Cloud.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
          >
            <ShoppingBag className="w-4 h-4" style={{ color: 'var(--accent)' }} /> View All Orders
          </Link>
          <Link
            to={liveStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold shadow-xs transition text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="p-5 rounded-3xl border space-y-2 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Today's Sales</span>
            <span className="text-emerald-500 font-bold">+{(kpis?.todaySalesChangePercent ?? 0)}%</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-500">
            ₹{(kpis?.todaySalesINR ?? 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>100% retained with 0% platform fee</p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl border space-y-2 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Total Orders</span>
            {kpis.unfulfilledOrdersCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                {kpis.unfulfilledOrdersCount} unfulfilled
              </span>
            ) : (
              <span className="text-emerald-500 font-bold">All clear</span>
            )}
          </div>
          <div className="text-2xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
            {(kpis?.totalOrdersCount ?? 0)}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Omnichannel checkout pipeline</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-3xl border space-y-2 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Low Stock Items</span>
            {(kpis?.lowStockItemsCount ?? 0) > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                Action needed
              </span>
            ) : (
              <span className="text-emerald-500 font-bold">Stocked</span>
            )}
          </div>
          <div className="text-2xl font-black font-mono text-rose-500">
            {(kpis?.lowStockItemsCount ?? 0)}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Products with stock ≤ 2 units</p>
        </div>

        {/* Active Customers */}
        <div className="p-5 rounded-3xl border space-y-2 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Active Customers</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>Directory</span>
          </div>
          <div className="text-2xl font-black font-mono" style={{ color: 'var(--accent)' }}>
            {kpis.activeCustomersCount}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Purchasers & repeat buyers</p>
        </div>
      </div>

      {/* 3. Sales Channel Health Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[11px] flex items-center gap-2 font-serif" style={{ color: 'var(--text-primary)' }}>
            <Globe className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Sales Channel Status & Sync Health
          </h2>
          <button
            onClick={() => setChannelModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
          >
            <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Configure Channels & IDs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Online Storefront */}
          <div
            onClick={() => setChannelModalOpen(true)}
            className="p-5 rounded-3xl border space-y-3 shadow-sm transition cursor-pointer group"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Online Storefront</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Connected
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Domain: <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{savedChannels?.customDomain || currentStore.customDomain || `${cleanHandleBase}.in`}</span>
            </p>
            <div className="pt-2 border-t text-[11px] flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <span>SSL: Active • Edge CDN</span>
              <span className="font-bold group-hover:underline flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                Edit Domain ✏️
              </span>
            </div>
          </div>

          {/* WhatsApp Business */}
          <div
            onClick={() => setChannelModalOpen(true)}
            className="p-5 rounded-3xl border space-y-3 shadow-sm transition cursor-pointer group"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>WhatsApp Business</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                1-Click Active
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Catalog Sync: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{displayWhatsApp}</span>
            </p>
            <div className="pt-2 border-t text-[11px] flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <span>Automated UPI checkout link</span>
              <span className="text-emerald-500 font-bold group-hover:underline flex items-center gap-1">
                Edit Number ✏️
              </span>
            </div>
          </div>

          {/* Instagram & FB Shop */}
          <div
            onClick={() => setChannelModalOpen(true)}
            className="p-5 rounded-3xl border space-y-3 shadow-sm transition cursor-pointer group"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-500" />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Instagram / FB Shop</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Catalog Synced
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Handle: <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{displayInstagram}</span>
            </p>
            <div className="pt-2 border-t text-[11px] flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <span>Reel product tagging active</span>
              <span className="text-pink-500 font-bold group-hover:underline flex items-center gap-1">
                Edit Handle ✏️
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Sales Channel Modal */}
      <EditSalesChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setChannelModalOpen(false)}
      />

      {/* 4. Main Two Column Row: Recent Orders & Onboarding Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 p-6 rounded-3xl border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Recent Store Transactions</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Latest orders across web, WhatsApp, and Instagram channels</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold flex items-center gap-1"
              style={{ color: 'var(--accent)' }}
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto opacity-40" style={{ color: 'var(--accent)' }} />
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>No customer transactions yet</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Live orders placed through your storefront, WhatsApp, or Instagram will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b uppercase tracking-wider text-[10px] font-bold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th className="py-2.5">Order</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Channel</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-500/5 transition">
                      <td className="py-3 font-mono font-bold" style={{ color: 'var(--accent)' }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="hover:underline"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="py-3" style={{ color: 'var(--text-primary)' }}>{order.customerName}</td>
                      <td className="py-3 uppercase text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {order.channel}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                        ₹{(order.totalAmountINR ?? order.totalAmount ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => sendInvoiceEmail(order)}
                          title="Send Tax Invoice Email"
                          className="p-1.5 rounded-xl transition cursor-pointer"
                          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Setup Checklist Widget */}
        <div className="p-6 rounded-3xl border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Setup Checklist</h3>
            <span className="text-xs font-bold text-emerald-500 font-mono">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #D4A017 0%, #F5C842 100%)' }}
            />
          </div>

          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Complete your onboarding checklist to maximize store conversion.
          </p>

          <div className="space-y-2.5 text-xs">
            {checklistSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border flex items-center justify-between transition"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
              >
                <div className="flex items-center gap-2.5">
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: 'var(--accent)' }} />
                  )}
                  <span>{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-Over Order Detail Drawer */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOpenInvoice={(order) => {
          setSelectedOrder(null);
          setInvoiceOrder(order);
        }}
      />

      {/* Printable Invoice Template */}
      <InvoiceTemplate
        order={invoiceOrder}
        isOpen={Boolean(invoiceOrder)}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
};
