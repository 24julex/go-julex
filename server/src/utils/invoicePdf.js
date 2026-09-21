import PDFDocument from 'pdfkit';

// ----------------------------------------------------
// TAX INVOICE PDF — attached to the automatic order email.
// Mirrors the HTML invoice email's numbers exactly (same
// GST-inclusive split, same seller config source), using
// pdfkit's built-in fonts. "Rs." instead of "₹" — the
// standard PDF fonts are WinAnsi and cannot render the
// rupee glyph.
// ----------------------------------------------------

const inr = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const escapeXml = (s) => String(s == null ? '' : s);

export const generateInvoicePdf = (order, config) => {
  const subtotal = order.subtotalAmount || order.items.reduce((s, i) => s + (i.priceAtPurchase * i.quantity), 0);
  const discount = order.discountAmount || 0;
  const shipping = order.shippingFee || 0;
  const tax = order.taxAmount || 0;
  const total = subtotal - discount + shipping + tax;
  // Prices are tax-inclusive: extract the GST content from the total
  // (platform 3% convention), never add it on top.
  const gstIncluded = Math.round(total * 3 / 103);
  const cgst = Math.round(gstIncluded / 2);
  const sgst = gstIncluded - cgst;

  const storeName = config?.storeTradeName || config?.storeLegalName || order.tenant?.name || 'The Store';
  const storeGstin = config?.storeGstin || null;
  const storeAddress = config?.storeAddress || [order.tenant?.city, order.tenant?.state].filter(Boolean).join(', ') || '';
  const storeContact = [config?.storePhone, config?.storeEmail].filter(Boolean).join('  |  ');

  let shipAddr = {};
  try { shipAddr = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : (order.shippingAddress || {}); } catch (e) {}

  const invoiceNo = `INV-${String(order.orderNumber || '').replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const left = 40;
      const right = 555;
      const gold = '#A87A00';
      const ink = '#0F172A';
      const slate = '#475569';
      const light = '#94A3B8';

      // ---- Header band ----
      doc.rect(0, 0, 595, 86).fill(ink);
      doc.fill('#D4A017').font('Helvetica-Bold').fontSize(16).text(escapeXml(storeName), left, 18);
      doc.fill('#94A3B8').font('Helvetica').fontSize(9).text('GST TAX INVOICE', left, 40);
      doc.fill('#E2E8F0').font('Helvetica').fontSize(9)
        .text(`No: ${invoiceNo}    Date: ${invoiceDate}    Order: ${order.orderNumber || '-'}`, left, 56);
      doc.fill(gold).font('Helvetica-Bold').fontSize(8)
        .text('0% PLATFORM FEE', right - 90, 18, { width: 90, align: 'right' });
      doc.fill('#94A3B8').font('Helvetica').fontSize(7)
        .text('Direct from the maker', right - 90, 32, { width: 90, align: 'right' });

      let y = 106;

      // ---- Seller / Billed To ----
      const colW = (right - left) / 2 - 12;
      doc.fill(light).font('Helvetica-Bold').fontSize(8).text('SELLER', left, y);
      doc.fill(light).font('Helvetica-Bold').fontSize(8).text('BILLED TO', left + colW + 24, y);
      let yl = y + 14;
      let yr = y + 14;
      doc.fill(ink).font('Helvetica-Bold').fontSize(10).text(escapeXml(storeName), left, yl, { width: colW });
      yl += 14;
      if (storeAddress) { doc.fill(slate).font('Helvetica').fontSize(9).text(escapeXml(storeAddress), left, yl, { width: colW }); yl += 24; }
      if (storeGstin) { doc.fill(slate).font('Helvetica').fontSize(9).text(`GSTIN: ${escapeXml(storeGstin)}`, left, yl, { width: colW }); yl += 12; }
      if (storeContact) { doc.fill(slate).font('Helvetica').fontSize(9).text(escapeXml(storeContact), left, yl, { width: colW }); yl += 12; }

      doc.fill(ink).font('Helvetica-Bold').fontSize(10).text(escapeXml(order.customerName), left + colW + 24, yr, { width: colW });
      yr += 14;
      if (order.customerPhone) { doc.fill(slate).font('Helvetica').fontSize(9).text(escapeXml(order.customerPhone), left + colW + 24, yr, { width: colW }); yr += 12; }
      if (order.customerEmail) { doc.fill(slate).font('Helvetica').fontSize(9).text(escapeXml(order.customerEmail), left + colW + 24, yr, { width: colW }); yr += 12; }
      const addrLine = [shipAddr.street, shipAddr.city, shipAddr.state, shipAddr.postalCode || shipAddr.zipCode].filter(Boolean).join(', ');
      if (addrLine) { doc.fill(slate).font('Helvetica').fontSize(9).text(escapeXml(addrLine), left + colW + 24, yr, { width: colW }); yr += 22; }

      y = Math.max(yl, yr) + 10;
      doc.moveTo(left, y).lineTo(right, y).strokeColor('#E2E8F0').stroke();
      y += 10;

      // ---- Items table ----
      const c1 = left + 4;            // #
      const c2 = left + 26;           // item
      const c3 = left + 300;          // qty
      const c4 = left + 360;          // rate
      const c5 = right;               // amount (right-aligned)
      doc.rect(left, y, right - left, 18).fill('#F1F5F9');
      doc.fill('#64748B').font('Helvetica-Bold').fontSize(8);
      doc.text('#', c1, y + 5);
      doc.text('ITEM', c2, y + 5);
      doc.text('QTY', c3, y + 5);
      doc.text('RATE', c4, y + 5);
      doc.text('AMOUNT', c5 - 70, y + 5, { width: 70, align: 'right' });
      y += 18;

      for (let idx = 0; idx < order.items.length; idx++) {
        const i = order.items[idx];
        const label = escapeXml(i.productName) + (i.variantLabel ? ` (${escapeXml(i.variantLabel)})` : '');
        // Measure wrapped label height to keep rows from colliding.
        const labelH = doc.font('Helvetica').fontSize(9).heightOfString(label, { width: 264 });
        const rowH = Math.max(18, labelH + 8);
        if (y + rowH > 740) { doc.addPage(); y = 50; }
        if (idx % 2 === 1) doc.rect(left, y, right - left, rowH).fill('#FAFAF8');
        doc.fill(ink).font('Helvetica').fontSize(9).text(String(idx + 1), c1, y + 5);
        doc.font('Helvetica').fontSize(9).fill(ink).text(label, c2, y + 5, { width: 264 });
        doc.fill(slate).text(String(i.quantity), c3, y + 5);
        doc.fill(slate).text(inr(i.priceAtPurchase), c4, y + 5);
        doc.fill(ink).font('Helvetica-Bold').fontSize(9).text(inr(i.priceAtPurchase * i.quantity), c5 - 70, y + 5, { width: 70, align: 'right' });
        y += rowH;
        doc.moveTo(left, y).lineTo(right, y).strokeColor('#EEF2F6').lineWidth(0.5).stroke();
      }
      y += 12;

      // ---- Totals (right-aligned block) ----
      const tX = right - 200;
      const totalRow = (label, value, opts = {}) => {
        doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.big ? 11 : 9)
          .fill(opts.color || slate).text(label, tX, y, { width: 120 });
        doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.big ? 11 : 9)
          .fill(opts.color || ink).text(value, right - 80, y, { width: 80, align: 'right' });
        y += opts.big ? 18 : 14;
      };
      totalRow('Subtotal', inr(subtotal));
      if (discount > 0) totalRow(`Discount${order.couponCodeApplied ? ` (${order.couponCodeApplied})` : ''}`, `- ${inr(discount)}`, { color: '#059669' });
      totalRow('Shipping', shipping > 0 ? inr(shipping) : 'FREE');
      totalRow('CGST (included)', inr(cgst));
      totalRow('SGST (included)', inr(sgst));
      doc.moveTo(tX, y).lineTo(right, y).strokeColor(ink).lineWidth(1.2).stroke();
      y += 6;
      totalRow('TOTAL', inr(total), { bold: true, big: true });

      // ---- Payment / footer ----
      y += 10;
      doc.fill(slate).font('Helvetica').fontSize(9)
        .text(`Payment: ${escapeXml(order.paymentMethod || '-')}    |    Status: ${escapeXml(order.paymentStatus || '-')}`, left, y);
      y += 14;
      doc.fill(slate).font('Helvetica').fontSize(9)
        .text(`Tracking: ${escapeXml(order.trackingNumber || 'Will be shared once shipped')}`, left, y);
      y += 24;
      doc.moveTo(left, y).lineTo(right, y).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
      y += 10;
      doc.fill(light).font('Helvetica').fontSize(8)
        .text('Prices are inclusive of applicable taxes. Thank you for shopping directly with ' + escapeXml(storeName) + ' - 0% platform fee.', left, y, { width: right - left });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};
