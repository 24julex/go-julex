import PDFDocument from 'pdfkit';

// ----------------------------------------------------
// TAX INVOICE PDF — server-side twin of the merchant's
// SELECTED invoice template (InvoiceTemplate.jsx).
// Driven entirely by the store's configuration:
//   • TenantInvoiceConfig.customStylesJson (fontFamily,
//     fontSize, primaryColor, headerStyle, terms)
//   • MasterInvoiceTemplate.defaultLayoutJson defaults
//   • authorizedSignatoryUrl → signature image block
// Three header variants (split_left_right / banner_strip /
// centered_minimal) mirror the template picker exactly.
// Standard 14 PDF fonts have no ₹ glyph, so amounts use
// "Rs." — universally accepted on Indian invoices.
// ----------------------------------------------------

const parseJson = (raw, fallback = {}) => {
  try { const v = typeof raw === 'string' ? JSON.parse(raw) : raw; return v && typeof v === 'object' ? v : fallback; } catch { return fallback; }
};

const inr = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fetchImageBuffer = async (url) => {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 0 ? buf : null;
  } catch { return null; }
};

/**
 * generateInvoicePdf(order, config, template) → Promise<Buffer>
 *   order    — must include items[] and tenant (plain object)
 *   config   — TenantInvoiceConfig row (nullable)
 *   template — MasterInvoiceTemplate row for config.templateId (nullable)
 */
export const generateInvoicePdf = async (order, config, template) => {
  const custom = parseJson(config?.customStylesJson);
  const layout = parseJson(template?.defaultLayoutJson);

  const accent = custom.primaryColor || layout.accentColor || '#D4A017';
  const headerStyle = custom.headerStyle || layout.headerStyle || 'split_left_right';
  const termsText = custom.terms || layout.defaultTerms || '';
  const family = String(custom.fontFamily || layout.fontFamily || 'Inter');
  const serif = /playfair|fraunces|serif|times|georgia|garamond|cinzel|merriweather|crimson/i.test(family);
  const scale = Math.min(Math.max(Number(custom.fontSize || layout.fontSize || 12) || 12, 9), 14) / 12;

  const storeName = config?.storeTradeName || config?.storeLegalName || order.tenant?.name || 'The Store';
  const legalName = config?.storeLegalName || storeName;
  const storeAddress = config?.storeAddress || '';
  const gstin = config?.storeGstin || null;
  const support = [config?.storeEmail, config?.storePhone].filter(Boolean).join('  •  ');

  let shipAddr = {};
  try { shipAddr = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : (order.shippingAddress || {}); } catch (e) {}

  const invoiceNo = `INV-${String(order.orderNumber || '').replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const subtotal = order.subtotalAmount || (order.items || []).reduce((s, i) => s + (i.priceAtPurchase * i.quantity), 0);
  const discount = order.discountAmount || 0;
  const shipping = order.shippingFee || 0;
  const total = Number(order.totalAmount || subtotal - discount + shipping);

  const signatureBuffer = await fetchImageBuffer(config?.authorizedSignatoryUrl);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 44, bufferPages: true });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      const W = right - left;

      const F = {
        head: serif ? 'Times-Bold' : 'Helvetica-Bold',
        body: serif ? 'Times-Roman' : 'Helvetica',
        italic: serif ? 'Times-Italic' : 'Helvetica-Oblique'
      };
      const INK = '#0F172A';
      const SLATE = '#475569';
      const MUTED = '#94A3B8';
      const LINE = '#E2E8F0';

      let y = doc.page.margins.top;

      // ================= HEADER (template-selected variant) =================
      if (headerStyle === 'banner_strip') {
        const bandH = 74;
        doc.roundedRect(left, y, W, bandH, 10).fill(accent);
        doc.fill('#FFFFFF').font(F.head).fontSize(17 * scale).text(storeName, left + 18, y + 12);
        doc.font(F.body).fontSize(8 * scale).fill('#FFFFFF');
        if (storeAddress) doc.text(storeAddress.replace(/\\n/g, ', '), left + 18, y + 32, { width: W * 0.55 });
        if (gstin) doc.font('Helvetica-Bold').fontSize(8 * scale).text(`GSTIN: ${gstin}`, left + 18, y + (storeAddress ? 46 : 34));
        doc.font(F.head).fontSize(7.5).fill(accent);
        doc.roundedRect(right - 150, y + 12, 132, 15, 4).fill('#FFFFFF');
        doc.fill(accent).font(F.head).fontSize(7).text('ORIGINAL TAX INVOICE', right - 150, y + 16.5, { width: 132, align: 'center' });
        doc.fill('#FFFFFF').font(F.head).fontSize(10).text(`#${invoiceNo}`, right - 150, y + 34, { width: 132, align: 'right' });
        doc.font(F.body).fontSize(8).fill('#FFFFFF').text(invoiceDate, right - 150, y + 48, { width: 132, align: 'right' });
        y += bandH + 18;
      } else if (headerStyle === 'centered_minimal') {
        doc.fill(INK).font(F.head).fontSize(19 * scale).text(storeName, left, y, { width: W, align: 'center' });
        y += 24 * scale + 4;
        if (storeAddress) { doc.fill(SLATE).font(F.body).fontSize(8.5 * scale).text(storeAddress.replace(/\\n/g, ', '), left, y, { width: W, align: 'center' }); y += 12 * scale; }
        doc.fill(SLATE).font('Helvetica-Bold').fontSize(8 * scale).text(`GSTIN: ${gstin || '—'}   |   Phone: ${config?.storePhone || '—'}`, left, y, { width: W, align: 'center' });
        y += 16 * scale + 6;
        const pillW = 220;
        doc.roundedRect((doc.page.width - pillW) / 2, y, pillW, 17, 8).fill(accent);
        doc.fill('#FFFFFF').font(F.head).fontSize(7.5).text(`TAX INVOICE #${invoiceNo}`, (doc.page.width - pillW) / 2, y + 5, { width: pillW, align: 'center' });
        y += 17 + 14;
      } else {
        // split_left_right (default) — left store block and right invoice
        // meta use INDEPENDENT fixed positions so they can never collide.
        const h0 = y; // header top
        doc.fill(accent).font(F.head).fontSize(21 * scale).text(storeName, left, h0, { width: W * 0.60 });
        const nameW = doc.font(F.head).fontSize(21 * scale).widthOfString(storeName);
        const chipX = Math.min(left + nameW + 10, left + W * 0.60 - 96);
        doc.roundedRect(chipX, h0 + 5, 92, 14, 4).fill('#DCFCE7');
        doc.fill('#065F46').font(F.head).fontSize(6.5).text('0% COMMISSION D2C', chipX, h0 + 9, { width: 92, align: 'center' });
        let ly = h0 + 26 * scale + 4;
        if (storeAddress) {
          const addrLines = Math.ceil(doc.font(F.body).fontSize(8.5 * scale).heightOfString(storeAddress.replace(/\\n/g, ', '), { width: W * 0.60 }) / 11);
          doc.fill(SLATE).font(F.body).fontSize(8.5 * scale).text(storeAddress.replace(/\\n/g, ', '), left, ly, { width: W * 0.60 });
          ly += addrLines * 11 + 2;
        }
        if (gstin) { doc.fill(SLATE).font(F.body).fontSize(8.5 * scale).text('GSTIN: ', left, ly, { width: W * 0.60, continued: false }); doc.fill(INK).font('Helvetica-Bold').fontSize(8.5 * scale).text(`GSTIN: ${gstin}`, left, ly, { width: W * 0.60 }); ly += 12 * scale; }
        if (support) { doc.fill(SLATE).font(F.body).fontSize(8.5 * scale).text(`Support: ${support}`, left, ly, { width: W * 0.60 }); ly += 12 * scale; }

        const rx = left + W * 0.64;
        const rw = W * 0.36;
        doc.roundedRect(rw + left > right - 132 ? right - 132 : rx, h0 + 2, 132, 15, 3).fill(accent);
        doc.fill('#FFFFFF').font(F.head).fontSize(6.8).text('ORIGINAL TAX INVOICE', right - 132, h0 + 6.5, { width: 132, align: 'center' });
        doc.fill(INK).font('Helvetica-Bold').fontSize(10).text(`Invoice No: #${invoiceNo}`, rx, h0 + 24, { width: rw, align: 'right' });
        doc.fill(SLATE).font(F.body).fontSize(8.5).text(`Date: ${invoiceDate}`, rx, h0 + 39, { width: rw, align: 'right' });
        doc.fill(SLATE).font(F.body).fontSize(8.5).text(`Payment: ${order.paymentMethod || 'Not recorded'}`, rx, h0 + 53, { width: rw, align: 'right' });

        const headerBottom = Math.max(ly, h0 + 68);
        doc.moveTo(left, headerBottom).lineTo(right, headerBottom).strokeColor(LINE).lineWidth(1).stroke();
        y = headerBottom + 16;
      }

      // ================= BILL TO / SHIP TO =================
      const panelH = 92;
      doc.roundedRect(left, y, W, panelH, 8).fill('#F8FAFC');
      const colW = (W - 36) / 2;
      doc.fill(MUTED).font(F.head).fontSize(7).text('BILLED TO', left + 16, y + 10);
      doc.fill(INK).font(F.head).fontSize(10.5 * scale).text(order.customerName, left + 16, y + 22, { width: colW });
      doc.fill(SLATE).font(F.body).fontSize(8.5 * scale);
      let by = y + 22 + 14 * scale;
      if (order.customerPhone) { doc.text(order.customerPhone, left + 16, by, { width: colW }); by += 11 * scale; }
      if (order.customerEmail) { doc.text(order.customerEmail, left + 16, by, { width: colW }); by += 11 * scale; }
      const billAddr = [shipAddr.street, shipAddr.city, shipAddr.state, shipAddr.zipCode || shipAddr.postalCode].filter(Boolean).join(', ');
      if (billAddr) { doc.text(billAddr, left + 16, by, { width: colW }); }

      const sx = left + colW + 36;
      doc.fill(MUTED).font(F.head).fontSize(7).text('SHIPPED TO', sx, y + 10);
      doc.fill(INK).font(F.head).fontSize(10.5 * scale).text(order.customerName, sx, y + 22, { width: colW });
      doc.fill(SLATE).font(F.body).fontSize(8.5 * scale).text(billAddr || '—', sx, y + 22 + 14 * scale, { width: colW });
      doc.fill(SLATE).font(F.body).fontSize(8 * scale).text(`Delivery: ${order.deliveryMethod || 'Standard Courier'}`, sx, y + 22 + 14 * scale + 24 * scale, { width: colW });
      y += panelH + 16;

      // ================= ITEMS TABLE =================
      const cols = [
        { key: '#', x: left + 4, w: 22, align: 'left' },
        { key: 'ITEM & SKU', x: left + 26, w: W - 26 - 40 - 76 - 82, align: 'left' },
        { key: 'QTY', x: right - 198, w: 40, align: 'right' },
        { key: 'UNIT RATE', x: right - 158, w: 76, align: 'right' },
        { key: 'AMOUNT', x: right - 82, w: 78, align: 'right' }
      ];
      const drawTableHeader = () => {
        doc.rect(left, y, W, 20).fill(accent);
        doc.fill('#FFFFFF').font(F.head).fontSize(7.5);
        cols.forEach((c) => doc.text(c.key, c.x, y + 7, { width: c.w, align: c.align }));
        y += 20;
      };
      drawTableHeader();

      (order.items || []).forEach((it, idx) => {
        const label = `${it.productName}${it.variantLabel ? ` (${it.variantLabel})` : ''}`;
        const sub = [it.productSku ? `SKU: ${it.productSku}` : null, it.gstPercent ? `incl. ${it.gstPercent}% GST` : null].filter(Boolean).join('  •  ');
        const labelH = doc.font(F.body).fontSize(8.5 * scale).heightOfString(label, { width: cols[1].w });
        const rowH = Math.max(24, labelH + (sub ? 12 : 0) + 10);
        if (y + rowH > doc.page.height - 260) { doc.addPage(); y = doc.page.margins.top; drawTableHeader(); }
        if (idx % 2 === 1) doc.rect(left, y, W, rowH).fill('#FAFAF8');
        doc.fill(INK).font(F.body).fontSize(8.5 * scale).text(String(idx + 1), cols[0].x, y + 8);
        doc.text(label, cols[1].x, y + 8, { width: cols[1].w });
        if (sub) doc.fill(MUTED).font(F.body).fontSize(7 * scale).text(sub, cols[1].x, y + 8 + labelH, { width: cols[1].w });
        doc.fill(SLATE).font(F.body).fontSize(8.5 * scale).text(String(it.quantity || 1), cols[2].x, y + 8, { width: cols[2].w, align: 'right' });
        doc.text(inr(it.priceAtPurchase), cols[3].x, y + 8, { width: cols[3].w, align: 'right' });
        doc.fill(INK).font(F.head).fontSize(8.5 * scale).text(inr(it.priceAtPurchase * it.quantity), cols[4].x, y + 8, { width: cols[4].w, align: 'right' });
        y += rowH;
        doc.moveTo(left, y).lineTo(right, y).strokeColor('#EEF2F6').lineWidth(0.5).stroke();
      });
      y += 14;

      // ================= PAYMENT BOX + TOTALS BOX =================
      if (y > doc.page.height - 280) { doc.addPage(); y = doc.page.margins.top; }
      const boxH = 118;
      // Left: payment summary
      doc.roundedRect(left, y, W * 0.42, boxH, 8).fill('#FFFDF5').lineWidth(0.8).strokeColor('#E7D9B5');
      doc.fill(INK).font(F.head).fontSize(8.5 * scale).text('Payment', left + 14, y + 10);
      doc.fill('#047857').font(F.head).fontSize(9 * scale).text(String(order.paymentStatus || 'PENDING').toUpperCase(), left + 14, y + 24);
      doc.fill(SLATE).font(F.body).fontSize(8 * scale).text(`Method: ${order.paymentMethod || 'Not recorded'}`, left + 14, y + 40);
      if (order.trackingNumber) doc.text(`Tracking: ${order.trackingNumber}`, left + 14, y + 52, { width: W * 0.42 - 28 });
      doc.fill('#047857').font(F.body).fontSize(7.5 * scale).text('0% Platform Fee Applied (Rs. 0 intermediary cut)', left + 14, y + boxH - 16, { width: W * 0.42 - 28 });

      // Right: totals
      const tX = left + W * 0.46;
      const tW = W * 0.54;
      doc.roundedRect(tX, y, tW, boxH, 8).fill('#F8FAFC').lineWidth(0.8).strokeColor(LINE);
      const totRow = (label, value, yy, opts = {}) => {
        doc.font(opts.bold ? F.head : F.body).fontSize(opts.big ? 12 * scale : 8.5 * scale);
        doc.fill(opts.bold ? INK : SLATE).text(label, tX + 14, yy, { width: tW - 150 });
        doc.fill(opts.accent ? accent : INK).text(value, tX + 14, yy, { width: tW - 28, align: 'right' });
      };
      totRow('Subtotal:', inr(subtotal), y + 10);
      if (discount > 0) totRow(`(-) Discount${order.couponCodeApplied ? ` (${order.couponCodeApplied})` : ''}:`, `- ${inr(discount)}`, y + 26, {});
      totRow('(+) Shipping:', shipping > 0 ? inr(shipping) : 'FREE', y + (discount > 0 ? 42 : 26));
      doc.moveTo(tX + 14, y + 62).lineTo(right - 14, y + 62).strokeColor(LINE).stroke();
      doc.fill(SLATE).font(F.body).fontSize(7 * scale).text('Prices are inclusive of applicable taxes.', tX + 14, y + 66, { width: tW - 28 });
      totRow('TOTAL PAID:', inr(total), y + boxH - 34, { bold: true, big: true, accent: true });
      y += boxH + 16;

      // ================= TERMS =================
      if (termsText) {
        const termsH = Math.min(70, 12 + Math.ceil(termsText.length / 110) * 10);
        if (y + termsH > doc.page.height - 190) { doc.addPage(); y = doc.page.margins.top; }
        doc.fill(MUTED).font(F.head).fontSize(6.5).text('TERMS & CONDITIONS', left, y);
        doc.fill(SLATE).font(F.body).fontSize(7 * scale).text(String(termsText).replace(/\\n/g, '\n'), left, y + 11, { width: W, height: termsH });
        y += 11 + termsH + 6;
      }

      // ================= FOOTER + SIGNATURE =================
      // Keep the footer block ON the current page: clamp its start so the
      // signature caption always lands inside the bottom margin.
      const sigBlockH = 66;
      if (y + sigBlockH > doc.page.height - doc.page.margins.bottom - 10) { doc.addPage(); y = doc.page.margins.top; }
      y = Math.max(y + 14, doc.page.height - doc.page.margins.bottom - sigBlockH - 34);
      doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).stroke();
      y += 12;

      doc.fill(INK).font(F.head).fontSize(8.5 * scale).text(`Thank you for supporting ${storeName}!`, left, y, { width: W * 0.5 });
      doc.fill(MUTED).font(F.body).fontSize(7).text('Powered by Go Julex 0% Platform Fee Commerce Cloud', left, y + 12, { width: W * 0.5 });

      const sigX = right - 170;
      if (signatureBuffer) {
        try { doc.image(signatureBuffer, sigX, y - 6, { fit: [150, 40], align: 'right' }); } catch (e) {}
      }
      doc.moveTo(sigX, y + 42).lineTo(right, y + 42).strokeColor('#94A3B8').lineWidth(0.8).stroke();
      doc.fill(SLATE).font(F.head).fontSize(6.5).text(`AUTHORIZED SIGNATORY FOR ${String(storeName).toUpperCase()}`, sigX, y + 47, { width: 170, align: 'center' });

      // ================= PAGE FOOTERS =================
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fill(MUTED).font(F.body).fontSize(6.5)
          .text(`${legalName} — system-generated tax invoice for order ${order.orderNumber}. Page ${i - range.start + 1} of ${range.count}`, left, doc.page.height - 34, { width: W, align: 'center' });
      }
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};
