import React, { useState } from 'react';
import { InvoiceTemplate } from '../admin/orders/InvoiceTemplate';
import { HARMONIOUS_THEME_PRESETS } from '../../pages/admin/channels/AdminThemeBuilder';

// ============================================================
// REAL invoice full preview — renders the actual InvoiceTemplate
// component with the selected template's authentic layout, fonts
// and colors (not an illustration). Used by BOTH the merchant
// invoice settings and the super-admin invoice template registry.
// ============================================================
export const InvoiceFullPreviewModal = ({ isOpen, onClose, template, storeContext }) => {
  if (!isOpen || !template) return null;

  // Template defaultLayout carries headerStyle / accent / fonts (seed data)
  const layout = template.defaultLayout || {};
  // Template defaultLayout carries headerStyle / accent / fonts (seed data).
  // Deliberately generic sample values — this renders a template layout
  // preview, never real customer data.
  const sampleOrder = {
    id: 'ORD-PREVIEW',
    orderNumber: 'ORD-PREVIEW',
    invoiceNumber: 'INV-PREVIEW',
    customerName: 'Sample Customer',
    customerEmail: 'sample@example.com',
    customerPhone: '+91 90000 00000',
    tenantId: storeContext?.id,
    storeSubdomain: storeContext?.subdomain,
    createdAt: new Date().toISOString(),
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    trackingNumber: 'TRK-PREVIEW',
    shippingAddress: { street: 'Sample Address Line', city: 'City', state: 'State', postalCode: '000000' },
    items: [
      { id: 'itm1', name: 'Sample Product A', variant: 'Variant / Size', unitPrice: 1000, price: 1000, quantity: 2, subtotalINR: 2000 },
      { id: 'itm2', name: 'Sample Product B', variant: 'Variant', unitPrice: 500, price: 500, quantity: 1, subtotalINR: 500 }
    ],
    actualCostINR: 2500,
    totalAmountINR: 2500,
    totalAmount: 2500,
    discountAppliedINR: 0
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{template.name} — Full Invoice Preview</h3>
            <p className="text-[11px] text-slate-500">Actual print output with this template's real layout, fonts &amp; colors</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-xl font-bold cursor-pointer">✕</button>
        </div>
        {/* The REAL renderer used at checkout */}
        <InvoiceTemplate
          order={sampleOrder}
          isOpen
          onClose={onClose}
          storeContext={storeContext}
          previewConfig={{
            templateId: template.id,
            templateName: template.name,
            accentColor: layout.accentColor || '#D4A017',
            fontFamily: layout.fontFamily || 'Inter',
            fontSize: layout.fontSize || 12,
            headerStyle: layout.headerStyle || 'split_left_right',
            legalName: 'Sample Merchant Private Limited',
            tradeName: storeContext?.name || template.name,
            gstin: 'SAMPLE GSTIN',
            address: 'Sample Store Address, City, State - 000000',
            phone: '+91 90000 00000',
            email: 'sample@example.com',
            terms: layout.defaultTerms || '1. Goods once sold can be exchanged within 7 business days.\n2. Issued under Go Julex 0% platform fee.'
          }}
        />
      </div>
    </div>
  );
};
