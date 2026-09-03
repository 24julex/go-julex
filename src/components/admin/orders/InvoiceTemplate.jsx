import React, { useState, useEffect } from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { DEMO_STORES } from '../../../data/multiVerticalMockData';
import { api } from '../../../services/api';

export const InvoiceTemplate = ({ order, isOpen, onClose, storeContext, previewConfig }) => {
  // Resolve Store Info safely without assuming MerchantAdminProvider
  let savedActiveStore = null;
  try {
    const raw = localStorage.getItem('gojulex_active_store_profile') || localStorage.getItem('gojulex_store_profile_default');
    if (raw) savedActiveStore = JSON.parse(raw);
  } catch (e) {}

  const storeId = order?.tenantId || storeContext?.id || savedActiveStore?.id || 'store_bookstore';
  const cleanSubdomain = (storeContext?.subdomain || order?.storeSubdomain || storeId || '').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');

  const matchedStore = storeContext || DEMO_STORES.find(s => s.id === storeId || s.subdomain?.includes(cleanSubdomain)) || savedActiveStore || {
    name: "RAM'S T-SHIRT STORE",
    address: '128 Heritage Avenue, Studio Lane, Chennai, Tamil Nadu - 600001',
    gstin: '33AABCR1234T1Z8',
    ownerEmail: 'ramstshirt@merchant.com',
    ownerPhone: '+91 98765 43210'
  };

  // Baseline config: optional localStorage override, else built-in default.
  // The store's actual activated template is fetched from the backend below.
  const fallbackConfig = (() => {
    try {
      const saved = localStorage.getItem(`gojulex_store_invoice_config_${matchedStore.id}`) ||
                    localStorage.getItem(`gojulex_store_invoice_config_${cleanSubdomain}`) ||
                    localStorage.getItem(`gojulex_store_invoice_config_store_${cleanSubdomain}`) ||
                    localStorage.getItem('gojulex_store_invoice_config_default');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default template config
    return {
      templateId: 'tpl_classic_tax_a4',
      accentColor: '#D4A017',
      fontFamily: 'Inter',
      fontSize: 12,
      headerStyle: 'split_left_right',
      legalName: `${matchedStore.name} Private Limited`,
      tradeName: matchedStore.name,
      gstin: matchedStore.gstin || '33AABCR1234T1Z8',
      address: matchedStore.address || 'Chennai, Tamil Nadu',
      phone: matchedStore.ownerPhone || '+91 98765 43210',
      email: matchedStore.ownerEmail || 'support@merchant.com',
      terms: '1. Goods once sold can be exchanged within 7 business days with original invoice.\n2. In accordance with Indian GST Rule 46.\n3. Issued under Go Julex 0% platform fee.'
    };
  })();

  const [invoiceConfig, setInvoiceConfig] = useState(previewConfig || fallbackConfig);

  // Load the Activated Invoice Template Configuration for this Store from the backend
  useEffect(() => {
    if (!isOpen || previewConfig) return undefined;
    let cancelled = false;

    const applyConfig = (cfg) => {
      const layout = cfg.template?.defaultLayout || {};
      const styles = cfg.customStyles || {};
      setInvoiceConfig(prev => ({
        ...prev,
        templateId: cfg.templateId || prev.templateId,
        templateName: cfg.template?.name || prev.templateName,
        accentColor: styles.primaryColor || layout.accentColor || prev.accentColor,
        fontFamily: styles.fontFamily || layout.fontFamily || prev.fontFamily,
        fontSize: styles.fontSize || layout.fontSize || prev.fontSize,
        headerStyle: styles.headerStyle || layout.headerStyle || prev.headerStyle,
        legalName: cfg.storeLegalName || prev.legalName,
        tradeName: cfg.storeTradeName || prev.tradeName,
        gstin: cfg.storeGstin || prev.gstin,
        address: cfg.storeAddress || prev.address,
        phone: cfg.storePhone || prev.phone,
        email: cfg.storeEmail || prev.email,
        terms: styles.terms || layout.defaultTerms || prev.terms,
        signatureUrl: cfg.authorizedSignatoryUrl || prev.signatureUrl
      }));
    };

    api.invoices.getStoreConfig(storeId)
      .then(async res => {
        if (cancelled) return;
        if (res?.success && res.data?.config) {
          applyConfig(res.data.config);
          return;
        }
        // Retry by bare subdomain in case the tenantId on the order
        // (e.g. "store_ramstshirt") doesn't match a DB tenant directly
        if (cleanSubdomain) {
          const retry = await api.invoices.getStoreConfig(cleanSubdomain).catch(() => null);
          if (!cancelled && retry?.success && retry.data?.config) {
            applyConfig(retry.data.config);
          }
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [isOpen, storeId, cleanSubdomain]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const invoiceEl = document.getElementById('official-printable-invoice');
    if (!invoiceEl) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=960,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    // Collect all <style> and <link rel="stylesheet"> from the current page
    const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    // Collect all computed Google Fonts links (Playfair Display etc.)
    const fontLinks = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]'))
      .map(n => n.outerHTML)
      .join('\n');

    const invoiceHtml = invoiceEl.outerHTML;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${order.invoiceNumber || order.orderNumber || 'INV'} — ${matchedStore.name}</title>
  ${fontLinks}
  ${styleNodes}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { background: #ffffff !important; }
    body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: '${fontFamily}', Inter, system-ui, sans-serif !important;
      font-size: ${invoiceConfig.fontSize || 12}px !important;
      margin: 0 !important;
      padding: 32px !important;
      max-width: 900px !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    /* Hide any leftover modal overlay, backdrop, or no-print elements */
    .no-print { display: none !important; }
    [class*="fixed"], [class*="backdrop"] { display: none !important; }
    /* Restore table layout */
    table { width: 100%; border-collapse: collapse; }
    th { padding: 10px 12px; text-align: left; background: #f1f5f9; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    /* Restore rounded borders and shadows */
    .rounded-2xl { border-radius: 1rem !important; }
    .rounded-3xl { border-radius: 1.5rem !important; }
    .border { border-width: 1px !important; border-style: solid !important; }
    .border-slate-200 { border-color: #e2e8f0 !important; }
    .bg-slate-50, .bg-slate-50\\/70 { background-color: #f8fafc !important; }
    .bg-slate-100 { background-color: #f1f5f9 !important; }
    .shadow-xs, .shadow-2xl { box-shadow: none !important; }
    /* Color overrides for accentColor */
    [style*="${accentColor}"] { color: ${accentColor} !important; }
    @page { size: A4 portrait; margin: 1.2cm; }
    @media print {
      html, body { background: #fff !important; padding: 0 !important; }
      .no-print, [class*="no-print"] { display: none !important; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
${invoiceHtml}
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for all styles + fonts to load, then auto-trigger print
    const triggerPrint = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        try { printWindow.close(); } catch (e) {}
      };
      setTimeout(() => { try { printWindow.close(); } catch (e) {} }, 90000);
    };

    if (printWindow.document.readyState === 'complete') {
      setTimeout(triggerPrint, 600);
    } else {
      printWindow.onload = () => setTimeout(triggerPrint, 600);
    }
  };

  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const accentColor = invoiceConfig.accentColor || '#D4A017';
  const fontFamily = invoiceConfig.fontFamily || 'Inter';
  const headerStyle = invoiceConfig.headerStyle || 'split_left_right';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-4 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Print CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-printable-invoice, #official-printable-invoice * {
            visibility: visible !important;
          }
          #official-printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #0F172A !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Invoice Card */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none flex flex-col my-auto">
        {/* Top Controls Bar (Hidden during Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-white border-b border-[#FBCBCB]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-[#D4A017]">
              Official Tax Invoice ({invoiceConfig.templateName || invoiceConfig.templateId?.replace('tpl_', '').replace(/_/g, ' ').toUpperCase() || 'STANDARD'})
            </span>
            <span className="text-xs text-slate-500 font-mono">• #{order.invoiceNumber || order.orderNumber || 'INV-001'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#D4A017] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Standard A4 Invoice Content */}
        <div
          id="official-printable-invoice"
          className="p-8 sm:p-12 space-y-6 bg-white font-sans text-slate-800 print:p-6"
          style={{ fontFamily, fontSize: `${invoiceConfig.fontSize || 12}px` }}
        >
          {/* Header 1: Banner Strip Header */}
          {headerStyle === 'banner_strip' ? (
            <div
              className="p-5 rounded-2xl text-white flex justify-between items-center shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              <div>
                <h2 className="text-xl font-black tracking-tight">{invoiceConfig.tradeName || matchedStore.name}</h2>
                <p className="text-xs opacity-90">{invoiceConfig.address || matchedStore.address}</p>
                <p className="text-xs opacity-90 font-mono">GSTIN: {invoiceConfig.gstin || matchedStore.gstin}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  ORIGINAL TAX INVOICE
                </span>
                <p className="text-sm font-mono font-bold mt-1">#{order.invoiceNumber || order.orderNumber || 'INV-001'}</p>
                <p className="text-[11px] opacity-90">{invoiceDate}</p>
              </div>
            </div>
          ) : headerStyle === 'centered_minimal' ? (
            /* Header 2: Centered Minimalist Header */
            <div className="text-center border-b border-slate-200 pb-5 space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{invoiceConfig.tradeName || matchedStore.name}</h2>
              <p className="text-xs text-slate-500">{invoiceConfig.address || matchedStore.address}</p>
              <p className="text-xs text-slate-600 font-mono">
                GSTIN: {invoiceConfig.gstin || matchedStore.gstin} | Phone: {invoiceConfig.phone || matchedStore.ownerPhone}
              </p>
              <div className="pt-2">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider inline-block"
                  style={{ backgroundColor: accentColor }}
                >
                  TAX INVOICE #{order.invoiceNumber || order.orderNumber || 'INV-001'}
                </span>
              </div>
            </div>
          ) : (
            /* Header 3: Split Modern Header */
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight" style={{ color: accentColor }}>
                    {invoiceConfig.tradeName || matchedStore.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    0% Commission D2C
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{invoiceConfig.address || matchedStore.address}</p>
                <p className="text-xs text-slate-600 font-mono">
                  <span className="font-bold text-slate-800">GSTIN:</span> {invoiceConfig.gstin || matchedStore.gstin}
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Support:</span> {invoiceConfig.email || matchedStore.ownerEmail} • {invoiceConfig.phone || matchedStore.ownerPhone}
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 w-full sm:w-auto">
                <span
                  className="inline-block px-3 py-0.5 rounded-md text-white text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: accentColor }}
                >
                  ORIGINAL TAX INVOICE
                </span>
                <p className="text-sm font-mono font-bold text-slate-900">
                  Invoice No: #{order.invoiceNumber || order.orderNumber || 'INV-001'}
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Date:</span> {invoiceDate}
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Payment:</span> {order.paymentMethod || 'Razorpay Instant UPI'}
                </p>
              </div>
            </div>
          )}

          {/* Customer Bill To & Ship To Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-200 pb-6 text-xs bg-slate-50/70 p-4 rounded-2xl border">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Billed To:
              </span>
              <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.customerEmail}</p>
              <p className="text-slate-600">{order.customerPhone}</p>
              <p className="text-slate-600 mt-1">
                {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                {order.shippingAddress?.state} - {order.shippingAddress?.postalCode || order.shippingAddress?.zip}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Delivery Details:
              </span>
              <p className="font-bold text-sm text-emerald-800">
                100% Direct from Maker • 0% Markup
              </p>
              <p className="text-slate-600">
                Shipping Address: {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
              <p className="text-slate-600">
                Tracking: <span className="font-mono font-bold text-slate-800">{order.trackingNumber || 'TRK-IN-EXPRESS'}</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-800 uppercase font-black tracking-wider text-[10px]">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Item Description</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price (₹)</th>
                  <th className="py-3 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(order.items || []).map((item, idx) => {
                  const unitPrice = Number(item.unitPriceINR || item.price || item.finalPrice || 0);
                  const qty = Number(item.quantity || 1);
                  const sub = Number(item.subtotalINR || unitPrice * qty);

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        {item.variant && <p className="text-[11px] text-slate-500">{item.variant}</p>}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">{qty}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        ₹{unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold font-mono text-slate-900">
                        ₹{sub.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Payment & Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-2">
            {/* Payment Method & Security Info */}
            <div className="space-y-3 max-w-sm text-xs">
              <div className="p-3.5 rounded-2xl bg-[#fedddd]/40 border border-[#FBCBCB] space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Payment: <span className="text-emerald-700 uppercase font-black">{order.paymentStatus || 'PAID'}</span>
                </span>
                <p className="text-slate-600">
                  Gateway: <span className="font-semibold text-slate-800">{order.paymentMethod || 'Razorpay Instant UPI'}</span>
                </p>
                <p className="text-emerald-700 font-semibold text-[11px]">
                  ✓ 0% Platform Fee Applied (₹0 Intermediary Cut)
                </p>
              </div>
              <p className="text-[10px] text-slate-400 whitespace-pre-line leading-relaxed">
                {invoiceConfig.terms}
              </p>
            </div>

            {/* Total Calculation Box */}
            <div className="w-full sm:w-72 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{Number(order.actualCostINR || order.totalAmountINR || order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>

              {Number(order.discountAppliedINR || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>(-) Discount:</span>
                  <span className="font-mono">-₹{Number(order.discountAppliedINR).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>(+) Shipping:</span>
                <span className="font-mono text-emerald-700 font-bold">FREE</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-sm font-black uppercase tracking-wide text-slate-900">
                  Total Paid:
                </span>
                <span className="text-lg font-black font-mono text-slate-950" style={{ color: accentColor }}>
                  ₹{Number(order.totalAmountINR || order.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Thank you for supporting {matchedStore.name}!</p>
              <p className="text-[11px] text-slate-400">Powered by Go Julex 0% Platform Fee Commerce Cloud</p>
            </div>
            <div className="text-right space-y-4">
              {invoiceConfig.signatureUrl ? (
                <img
                  src={invoiceConfig.signatureUrl}
                  alt="Authorized Signature"
                  className="h-14 object-contain ml-auto block"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="h-10" />
              )}
              <div className="w-40 border-b border-slate-400 mx-auto" />
              <p className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">
                Authorized Signatory for {matchedStore.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
