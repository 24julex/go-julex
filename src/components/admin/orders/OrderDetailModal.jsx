import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Send,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';

export const OrderDetailModal = ({ order, isOpen, onClose, onOpenInvoice }) => {
  const { updateFulfillmentStatus, sendInvoiceEmail } = useMerchantAdmin();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [carrier, setCarrier] = useState(order?.carrierName || 'BlueDart Express');

  if (!isOpen || !order) return null;

  const handleSendInvoice = async () => {
    setIsSendingEmail(true);
    await sendInvoiceEmail(order);
    setIsSendingEmail(false);
  };

  const handleFulfillOrder = () => {
    updateFulfillmentStatus(
      order.id,
      'shipped',
      trackingNumber || `TRACK-${Date.now().toString().slice(-6)}`,
      carrier
    );
    setIsFulfilling(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-[#EAF5EC] text-[#2D6A4F] border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'refunded':
      case 'failed':
        return 'bg-red-50 text-[#9B1C1C] border-rose-200';
      default:
        return 'bg-slate-100 text-[#374151] border-stone-200';
    }
  };

  const getFulfillmentColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-[#EAF5EC] text-[#2D6A4F] border-emerald-200';
      case 'shipped':
        return 'bg-[#fedddd] text-[#881337] border-[#F8B4B4]';
      case 'unfulfilled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-[#9B1C1C] border-rose-200';
      default:
        return 'bg-slate-100 text-[#374151] border-stone-200';
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
      <div className="relative w-full max-w-2xl bg-white border-l border-[#FBCBCB] h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#FBCBCB] flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-mono text-[#0F172A]">{order.orderNumber}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getFulfillmentColor(
                  order.fulfillmentStatus
                )}`}
              >
                {order.fulfillmentStatus}
              </span>
            </div>
            <p className="text-xs text-[#374151] mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')} via{' '}
              <span className="font-semibold text-[#9F1239] uppercase">{order.channel}</span>
            </p>
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
          {/* Action Quick Trigger Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleSendInvoice}
              disabled={isSendingEmail}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] text-[#881337] font-bold transition disabled:opacity-50"
            >
              {isSendingEmail ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#BE123C] border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#9F1239]" /> Send Invoice
                </>
              )}
            </button>

            <button
              onClick={() => onOpenInvoice(order)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-[#881337] font-bold transition"
            >
              <Printer className="w-4 h-4 text-[#9F1239]" /> View Tax Invoice
            </button>

            {order.fulfillmentStatus === 'unfulfilled' ? (
              <button
                onClick={() => setIsFulfilling(!isFulfilling)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold transition shadow-xs"
              >
                <Truck className="w-4 h-4" /> Mark as Shipped
              </button>
            ) : (
              <button
                onClick={() => updateFulfillmentStatus(order.id, 'delivered')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivered
              </button>
            )}
          </div>

          {/* Fulfillment Action Box if toggled */}
          {isFulfilling && (
            <div className="p-4 rounded-3xl bg-white border border-[#FDA4AF] space-y-3 animate-fade-in shadow-xs">
              <span className="font-bold text-amber-700 block font-serif">Fulfill & Dispatch Order</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#374151] block mb-1 font-semibold">
                    Carrier / Logistics
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                    placeholder="e.g. BlueDart Express"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#374151] block mb-1 font-semibold">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                    placeholder="e.g. BD-EXP-9921402"
                  />
                </div>
              </div>
              <button
                onClick={handleFulfillOrder}
                className="w-full py-2 bg-[#9F1239] hover:bg-[#881337] text-white font-bold rounded-2xl shadow-xs transition"
              >
                Confirm Dispatch & Notify Customer
              </button>
            </div>
          )}

          {/* Customer Details Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
                <User className="w-4 h-4 text-[#9F1239]" /> Customer Information
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4] flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#9F1239]" /> {order.customerSegment || 'Registered Customer'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <p className="font-bold text-sm text-[#0F172A]">{order.customerName}</p>
                <p className="text-[#374151] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {order.customerEmail}
                </p>
                <p className="text-[#374151] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.customerPhone}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#881337] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9F1239]" /> Shipping Destination
                </p>
                <p className="text-[#374151] leading-relaxed">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                  {order.shippingAddress?.state} - {order.shippingAddress?.postalCode},{' '}
                  {order.shippingAddress?.country}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
              <Package className="w-4 h-4 text-[#9F1239]" /> Order Items ({order.items.length})
            </span>

            <div className="divide-y divide-[#FBCBCB]/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || item.imageUrl || item.image_url || item.mainImage || item.thumbnail || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80';
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#FBCBCB] bg-slate-800"
                    />
                    <div>
                      <p className="font-bold text-[#0F172A]">{item.name}</p>
                      <p className="text-[11px] text-[#374151]">
                        {item.variant} • <span className="font-mono text-slate-400">{item.sku}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-[#0F172A]">
                      ₹{item.subtotalINR.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-[#374151]">
                      Qty: {item.quantity} × ₹{item.unitPriceINR.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT & INVOICE CALCULATION BOX */}
          <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-3 shadow-xs">
            <span className="font-bold text-[#0F172A] flex items-center gap-2 font-serif">
              <CreditCard className="w-4 h-4 text-[#9F1239]" /> Payment & Invoice Breakdown
            </span>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[#374151]">
                <span>Actual Product Cost (Subtotal):</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  ₹{order.actualCostINR.toLocaleString('en-IN')}
                </span>
              </div>

              {order.discountAppliedINR > 0 && (
                <div className="flex justify-between text-[#2D6A4F]">
                  <span className="flex items-center gap-1.5">
                    (-) Discount Applied
                    {order.couponCode && (
                      <span className="px-1.5 py-0.2 rounded bg-[#EAF5EC] text-[10px] font-mono font-bold border border-emerald-200">
                        {order.couponCode}
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold">
                    -₹{order.discountAppliedINR.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#374151]">
                <span>(+) Delivery / Shipping Cost:</span>
                <span className="font-mono text-[#0F172A]">
                  {order.deliveryCostINR === 0 ? (
                    <span className="text-emerald-800 font-bold">FREE</span>
                  ) : (
                    `+₹${order.deliveryCostINR.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[#374151]">
                <span>(+) Estimated Tax (GST):</span>
                <span className="font-mono text-[#0F172A]">
                  +₹{order.taxGSTINR.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-[#FBCBCB] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                  (=) Total Order Amount:
                </span>
                <span className="text-lg font-black font-mono text-[#9F1239]">
                  ₹{(order.totalAmountINR ?? order.totalAmount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#374151] bg-white p-2.5 rounded-2xl border border-[#FBCBCB] mt-2">
                <span>Payment Method:</span>
                <span className="font-semibold text-[#0F172A] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {order.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
