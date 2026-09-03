import React, { useState } from 'react';
import {
  Send,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Globe,
  MessageSquare,
  Instagram
} from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';

export const OrdersTable = ({
  orders,
  onSelectOrder,
  onOpenInvoice,
  selectedOrders,
  setSelectedOrders
}) => {
  const { updateFulfillmentStatus, sendInvoiceEmail, showToast } = useMerchantAdmin();

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleBulkMarkShipped = () => {
    selectedOrders.forEach((id) => updateFulfillmentStatus(id, 'shipped'));
    showToast(`Marked ${selectedOrders.length} orders as Shipped!`, 'success');
    setSelectedOrders([]);
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <MessageSquare className="w-3 h-3 text-emerald-500" /> WhatsApp
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/30">
            <Instagram className="w-3 h-3 text-pink-500" /> Instagram
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
            <Globe className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Online Web
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Paid
        </span>
      );
    }
    if (s === 'pending' || s === 'unpaid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30 uppercase">
        <AlertCircle className="w-3 h-3" /> {status}
      </span>
    );
  };

  const getFulfillmentBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Delivered
        </span>
      );
    }
    if (s === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)' }}>
          <Truck className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Shipped
        </span>
      );
    }
    if (s === 'processing' || s === 'unfulfilled' || s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
          <Clock className="w-3 h-3" /> Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
        {status}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No orders match the selected filters</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search terms, channels, or date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bulk Actions Floating Bar */}
      {selectedOrders.length > 0 && (
        <div className="p-3 px-4 rounded-2xl border flex items-center justify-between animate-fade-in text-xs" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedOrders.length} order(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkShipped}
              className="px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-black cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
            >
              <Truck className="w-3.5 h-3.5" /> Mark as Shipped
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="px-3 py-1.5 rounded-xl transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Table */}
      <div className="overflow-x-auto rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b uppercase tracking-wider text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th className="py-3.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Channel</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Customer Info</th>
              <th className="py-3.5 px-4">Items Summary</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4">Fulfillment</th>
              <th className="py-3.5 px-4 text-right">Total Price</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
            {orders.map((order) => {
              const isSelected = selectedOrders.includes(order.id);
              const firstItem = (order.items && order.items[0]) || {};
              const itemImgSrc = firstItem.image || firstItem.imageUrl || firstItem.image_url || firstItem.mainImage || firstItem.thumbnail || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80';

              return (
                <tr
                  key={order.id}
                  className="hover:bg-amber-500/5 transition"
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="rounded w-4 h-4 cursor-pointer"
                    />
                  </td>

                  <td className="py-4 px-4 font-mono font-bold whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="hover:underline font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {order.orderNumber || order.id}
                    </button>
                    <span className="text-[10px] block font-normal font-sans" style={{ color: 'var(--text-muted)' }}>
                      {order.invoiceNumber}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">{getChannelBadge(order.channel)}</td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt || order.date || Date.now()).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{order.customerName}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{order.customerEmail}</p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{order.customerPhone}</p>
                  </td>

                  <td className="py-4 px-4">
                    {firstItem.name ? (
                      <div className="flex items-center gap-2.5 min-w-[200px]">
                        <img
                          src={itemImgSrc}
                          alt={firstItem.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80';
                          }}
                          className="w-9 h-9 rounded-xl object-cover border shrink-0 bg-slate-800"
                          style={{ borderColor: 'var(--border-card)' }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold truncate text-xs" style={{ color: 'var(--text-primary)' }}>{firstItem.name}</p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                            {firstItem.variant || 'Standard'} {order.items?.length > 1 && `+${order.items.length - 1} more`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">{getPaymentBadge(order.paymentStatus)}</td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {getFulfillmentBadge(order.fulfillmentStatus)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    ₹{(order.totalAmountINR ?? order.totalAmount ?? 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectOrder(order)}
                        title="View Details"
                        className="p-1.5 rounded-xl transition cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => sendInvoiceEmail(order)}
                        title="Send Invoice via Email"
                        className="p-1.5 rounded-xl transition cursor-pointer text-black"
                        style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenInvoice(order)}
                        title="Download Tax Invoice PDF"
                        className="p-1.5 rounded-xl transition cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--accent)' }}
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
