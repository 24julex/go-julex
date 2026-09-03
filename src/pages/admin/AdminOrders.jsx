import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { OrdersTable } from '../../components/admin/orders/OrdersTable';
import { OrderDetailModal } from '../../components/admin/orders/OrderDetailModal';
import { InvoiceTemplate } from '../../components/admin/orders/InvoiceTemplate';

export const AdminOrders = () => {
  const { orders, showToast } = useMerchantAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const filteredOrders = orders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId =
        (order.orderNumber || '').toLowerCase().includes(q) || (order.id || '').toLowerCase().includes(q);
      const matchCust =
        (order.customerName || '').toLowerCase().includes(q) ||
        (order.customerEmail || '').toLowerCase().includes(q);
      const matchPhone = (order.customerPhone || '').toLowerCase().includes(q);
      const matchProduct = (order.items || []).some(
        (item) =>
          (item.name || '').toLowerCase().includes(q) || (item.sku || '').toLowerCase().includes(q)
      );
      if (!matchId && !matchCust && !matchPhone && !matchProduct) return false;
    }

    if (statusFilter !== 'All') {
      const s = statusFilter.toLowerCase();
      const pStatus = (order.paymentStatus || '').toLowerCase();
      const fStatus = (order.fulfillmentStatus || order.status || '').toLowerCase();

      if (s === 'unfulfilled' && fStatus !== 'unfulfilled' && fStatus !== 'processing' && fStatus !== 'pending') return false;
      if (s === 'paid' && pStatus !== 'paid') return false;
      if (s === 'pending' && pStatus !== 'pending' && pStatus !== 'unpaid') return false;
      if (s === 'refunded' && pStatus !== 'refunded') return false;
      if (s === 'cancelled' && fStatus !== 'cancelled' && pStatus !== 'cancelled') return false;
    }

    if (channelFilter !== 'All') {
      const c = channelFilter.toLowerCase();
      const orderChan = (order.channel || '').toLowerCase();
      if (orderChan !== c) return false;
    }

    if (startDate) {
      const orderDate = new Date(order.createdAt || order.date || Date.now()).toISOString().split('T')[0];
      if (orderDate < startDate) return false;
    }
    if (endDate) {
      const orderDate = new Date(order.createdAt || order.date || Date.now()).toISOString().split('T')[0];
      if (orderDate > endDate) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers =
      'Order ID,Invoice No,Channel,Date,Customer Name,Email,Phone,Items,Subtotal INR,Discount INR,GST INR,Total Amount INR,Payment Status,Fulfillment Status\n';
    const rows = filteredOrders
      .map((o) => {
        const itemNames = o.items.map((i) => `${i.name} (${i.quantity})`).join('; ');
        return `"${o.orderNumber}","${o.invoiceNumber}","${o.channel}","${o.createdAt}","${
          o.customerName
        }","${o.customerEmail}","${o.customerPhone}","${itemNames}",${o.actualCostINR},${
          o.discountAppliedINR
        },${o.taxGSTINR},${o.totalAmountINR},"${o.paymentStatus}","${o.fulfillmentStatus}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `GoJulex_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredOrders.length} orders to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <ShoppingBag className="w-6 h-6" style={{ color: 'var(--accent)' }} /> Orders & Invoicing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Real-time multi-channel transactions, automated GST tax calculation, and 1-click tax invoice generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Filters & Controls Bar */}
      <div className="p-4 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Unfulfilled', 'Paid', 'Pending', 'Refunded', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-2xl font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab ? 'text-black' : ''
              }`}
              style={statusFilter === tab ? {
                background: 'linear-gradient(135deg, #D4A017, #F5C842)',
              } : {
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, Customer, Phone, SKU..."
              className="w-full pl-10 pr-3 py-2 rounded-2xl focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl focus:outline-none cursor-pointer"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            >
              <option value="All">All Sales Channels</option>
              <option value="Web">🌐 Online Storefront</option>
              <option value="WhatsApp">💬 WhatsApp Business</option>
              <option value="Instagram">📸 Instagram & FB Shop</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border rounded-2xl px-3 py-2" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}>
            <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs focus:outline-none w-full"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex items-center gap-2 border rounded-2xl px-3 py-2" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-input)' }}>
            <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs focus:outline-none w-full"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Orders Table Component */}
      <OrdersTable
        orders={filteredOrders}
        onSelectOrder={(order) => setSelectedOrder(order)}
        onOpenInvoice={(order) => setInvoiceOrder(order)}
        selectedOrders={selectedOrders}
        setSelectedOrders={setSelectedOrders}
      />

      {/* 4. Slide-Over Order Detail Drawer */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOpenInvoice={(order) => {
          setSelectedOrder(null);
          setInvoiceOrder(order);
        }}
      />

      {/* 5. Printable Standard A4 Tax Invoice Component */}
      <InvoiceTemplate
        order={invoiceOrder}
        isOpen={Boolean(invoiceOrder)}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
};
