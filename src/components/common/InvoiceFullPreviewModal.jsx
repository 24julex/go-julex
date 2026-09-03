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
  const sampleOrder = {
    id: 'ORD-PREVIEW',
    orderNumber: 'ORD-10001',
    invoiceNumber: 'INV-10001',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav@example.com',
    customerPhone: '+91 98450 12345',
    tenantId: storeContext?.id,
    storeSubdomain: storeContext?.subdomain,
    createdAt: new Date().toISOString(),
    paymentMethod: 'Instant UPI (demo@upi)',
    paymentStatus: 'PAID',
    trackingNumber: 'TRK-IN-10001-EXP',
    shippingAddress: { street: '42 Marine Drive', city: 'Mumbai', state: 'Maharashtra', postalCode: '400020' },
    items: [
      { id: 'itm1', name: 'Signature Artisan Piece', variant: 'Ivory / Medium', unitPrice: 4850, price: 4850, quantity: 2, subtotalINR: 9700 },
      { id: 'itm2', name: 'Bespoke Gift Wrap', variant: 'Gold', unitPrice: 250, price: 250, quantity: 1, subtotalINR: 250 }
    ],
    actualCostINR: 9950,
    totalAmountINR: 9950,
    totalAmount: 9950,
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
            legalName: 'Preview Merchant Private Limited',
            tradeName: storeContext?.name || template.name,
            gstin: '27AAACA1234A1Z5',
            address: 'Preview Store, Marine Drive, Mumbai, Maharashtra - 400020',
            phone: '+91 98201 54321',
            email: 'orders@preview.gojulex.com',
            terms: layout.defaultTerms || '1. Goods once sold can be exchanged within 7 business days.\n2. Issued under Go Julex 0% platform fee.'
          }}
        />
      </div>
    </div>
  );
};
