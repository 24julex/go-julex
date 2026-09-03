import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Globe,
  MessageSquare,
  Instagram,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

export const CustomerDetailDrawer = ({ customer, isOpen, onClose }) => {
  if (!isOpen || !customer) return null;

  const ordersCount = Number(customer.ordersCount) || 0;
  const totalSpent = Number(customer.totalSpentINR) || 0;
  const averageOrderValue = ordersCount > 0 ? Math.round(totalSpent / ordersCount) : 0;
  const pastOrders = customer.pastOrders || [];

  const getChannelBadge = (channel = 'web') => {
    switch (channel.toLowerCase()) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200">
            <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
            <Instagram className="w-3 h-3 text-pink-600" /> Instagram
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
            <Globe className="w-3 h-3 text-[#9F1239]" /> Web
          </span>
        );
    }
  };

  const getFulfillmentBadge = (status = 'Delivered') => {
    const s = status.toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200">
          Delivered
        </span>
      );
    } else if (s === 'shipped') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
          Shipped
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {status}
        </span>
      );
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
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#FBCBCB] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={customer.avatarUrl}
              alt={customer.name}
              className="w-12 h-12 rounded-2xl object-cover border border-[#FBCBCB] bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] font-serif">{customer.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    ordersCount > 1
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : ordersCount === 1
                      ? 'bg-[#EAF5EC] text-[#2D6A4F] border-emerald-200'
                      : 'bg-slate-100 text-[#374151] border-stone-200'
                  }`}
                >
                  {ordersCount > 1
                    ? 'Repeat Buyer'
                    : ordersCount === 1
                    ? 'First-Time Buyer'
                    : 'Viewer / Lead'}
                </span>
              </div>
              <p className="text-xs text-[#374151] mt-0.5">
                Account registered on {customer.memberSince || '2025'} • ID: {customer.id}
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

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* 1. Lifetime Value Summary Cards */}
          <div className="space-y-2">
            <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px] flex items-center gap-2 font-serif">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Lifetime Value & Order Metrics
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#374151]">Total Spent</span>
                <p className="text-lg font-black font-mono text-emerald-800">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#374151]">Total Orders</span>
                <p className="text-lg font-black font-mono text-[#0F172A]">
                  {ordersCount}
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#374151]">Average AOV</span>
                <p className="text-lg font-black font-mono text-[#9F1239]">
                  ₹{averageOrderValue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Contact & Address Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
              <User className="w-4 h-4 text-[#9F1239]" /> Contact & Delivery Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <p className="text-[#374151] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-[#0F172A] hover:text-[#9F1239] hover:underline truncate"
                  >
                    {customer.email}
                  </a>
                </p>
                <p className="text-[#374151] flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[#0F172A]">{customer.phone}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#881337] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9F1239]" /> Primary Address
                </p>
                <p className="text-[#0F172A] leading-relaxed">
                  {customer.address || customer.city}
                </p>
                <p className="text-[11px] text-[#374151]">
                  {customer.city}, {customer.state} {customer.postalCode && `• PIN: ${customer.postalCode}`}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Order History Timeline */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
                <ShoppingBag className="w-4 h-4 text-[#9F1239]" /> Order History Timeline ({pastOrders.length})
              </span>
            </div>

            {pastOrders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-[#FBCBCB] space-y-2">
                <PackageCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-[#0F172A]">No purchases made yet</p>
                <p className="text-[11px] text-[#374151]">
                  Customer registered account on {customer.memberSince || 'recently'} via storefront newsletter/cart.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#FBCBCB]/60">
                {pastOrders.map((order, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#9F1239]">{order.id}</span>
                        {getChannelBadge(order.channel)}
                      </div>
                      <p className="text-[11px] text-[#374151]">
                        {order.date} • {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-mono font-bold text-emerald-800">
                        ₹{Number(order.totalINR).toLocaleString('en-IN')}
                      </p>
                      <div>{getFulfillmentBadge(order.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
