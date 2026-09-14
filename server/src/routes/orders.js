import express from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();

// Helper to format order with parsed JSON fields
const formatOrder = (ord) => {
  let shippingAddress = {};
  try {
    shippingAddress = typeof ord.shippingAddress === 'string' ? JSON.parse(ord.shippingAddress) : ord.shippingAddress;
  } catch (e) {
    shippingAddress = {};
  }

  const items = ord.items?.map((item) => ({
    id: item.productId || item.id,
    orderItemId: item.id,
    name: item.productName,
    variant: item.variantLabel,
    image: item.productImage,
    quantity: item.quantity,
    finalPrice: item.priceAtPurchase
  })) || [];

  return {
    id: ord.orderNumber || ord.id,
    dbId: ord.id,
    orderNumber: ord.orderNumber,
    date: ord.createdAt,                          // ← schema field is createdAt
    status: ord.fulfillmentStatus || ord.status,   // ← schema field is fulfillmentStatus
    paymentStatus: ord.paymentStatus,
    trackingNumber: ord.trackingNumber || `TRK-${(ord.orderNumber || ord.id).replace(/[^0-9]/g, '')}-EXP`,
    notes: ord.notes || '',
    totalAmount: ord.totalAmount,
    totalAmountINR: ord.totalAmount,
    subtotalAmount: ord.subtotalAmount,
    discountAmount: ord.discountAmount,
    shippingFee: ord.shippingFee,
    taxAmount: ord.taxAmount,
    channel: ord.channel,
    customerName: ord.customerName,
    customerEmail: ord.customerEmail,
    customerPhone: ord.customerPhone,
    shippingAddress,
    deliveryMethod: ord.deliveryMethod,
    paymentMethod: ord.paymentMethod,
    tenantId: ord.tenantId,
    storeName: ord.tenant?.name || ord.tenantName || null,
    storeSubdomain: ord.tenant?.subdomain || null,
    items
  };
};

// GET /api/orders (Admin Only: Fetch all client orders with search, status filter, and sorting)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, search, tenantId } = req.query;

    const where = {};
    if (tenantId && tenantId !== 'all') {
      where.tenantId = tenantId;
    }
    if (status && status !== 'all') {
      where.fulfillmentStatus = { equals: status };
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } },
      orderBy: { createdAt: 'desc' }
    });

    let formatted = orders.map(formatOrder);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      formatted = formatted.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

// GET /api/orders/user/:email (Fetch orders for specific customer)
router.get('/user/:email', async (req, res) => {
  try {
    const email = req.params.email?.toLowerCase().trim();
    const orders = await prisma.order.findMany({
      where: { customerEmail: { equals: email } },
      include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      count: orders.length,
      data: orders.map(formatOrder)
    });
  } catch (error) {
    console.error('Fetch user orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer orders.' });
  }
});

// GET /api/orders/:id (Fetch single order by ID or orderNumber)
router.get('/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: identifier },
          { orderNumber: identifier }
        ]
      },
      include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      data: formatOrder(order)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
});

// POST /api/orders (Customer Checkout: Create Order & Deduct Inventory Stock)
// ----------------------------------------------------
// GST tax invoice email — sent automatically to the customer
// right after their order is placed.
// ----------------------------------------------------
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const sendOrderInvoiceEmail = async (order) => {
  try {
    const config = order.tenantId
      ? await prisma.tenantInvoiceConfig.findUnique({ where: { tenantId: order.tenantId } })
      : null;

    const subtotal = order.subtotalAmount || order.items.reduce((s2, i) => s2 + (i.priceAtPurchase * i.quantity), 0);
    const discount = order.discountAmount || 0;
    const shipping = order.shippingFee || 0;
    const tax = order.taxAmount || 0;
    // What the customer ACTUALLY paid — identical to the merchant dashboard
    const total = subtotal - discount + shipping + tax;
    // Prices are tax-inclusive: show the GST content extracted from the
    // total (platform 3% convention), never added on top of it
    const gstIncluded = Math.round(total * 3 / 103);
    const cgst = Math.round(gstIncluded / 2);
    const sgst = gstIncluded - cgst;

    const storeName = config?.storeTradeName || config?.storeLegalName || order.tenant?.name || 'The Store';
    const storeGstin = config?.storeGstin || null;
    const storeAddress = config?.storeAddress || [order.tenant?.city, order.tenant?.state].filter(Boolean).join(', ') || '';
    const storeContact = [config?.storePhone, config?.storeEmail].filter(Boolean).join(' \u00B7 ');

    let shipAddr = {};
    try { shipAddr = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : (order.shippingAddress || {}); } catch (e) {}

    const invoiceNo = `INV-${String(order.orderNumber || '').replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`;
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const rows = order.items.map((i, idx) => `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:8px;font-size:12px;color:#334155">${idx + 1}</td>
        <td style="padding:8px;font-size:12px;color:#334155">
          <strong>${i.productName}</strong>${i.variantLabel ? `<div style="color:#94a3b8;font-size:11px">${i.variantLabel}</div>` : ''}
        </td>
        <td style="padding:8px;font-size:12px;color:#334155;text-align:center">${i.quantity}</td>
        <td style="padding:8px;font-size:12px;color:#334155;text-align:right">${inr(i.priceAtPurchase)}</td>
        <td style="padding:8px;font-size:12px;color:#334155;text-align:right">${inr(i.priceAtPurchase * i.quantity)}</td>
      </tr>`).join('');

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#0F172A;padding:18px 24px">
        <div style="color:#D4A017;font-weight:800;font-size:16px">${storeName}</div>
        <div style="color:#94a3b8;font-size:11px">GST TAX INVOICE</div>
        <div style="color:#e2e8f0;font-size:11px;margin-top:6px">
          No: <strong>${invoiceNo}</strong> &nbsp;|&nbsp; Date: <strong>${invoiceDate}</strong> &nbsp;|&nbsp; Order: <strong>${order.orderNumber}</strong>
        </div>
      </div>

      <div style="padding:16px 24px;border-bottom:1px solid #e2e8f0;background:#f8fafc">
        <table style="width:100%;border-collapse:collapse"><tr>
          <td style="width:50%;vertical-align:top">
            <div style="font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:1px;margin-bottom:4px">SELLER</div>
            <div style="font-size:12px;color:#0f172a"><strong>${storeName}</strong></div>
            ${storeAddress ? `<div style="font-size:11px;color:#475569">${storeAddress}</div>` : ''}
            ${storeGstin ? `<div style="font-size:11px;color:#475569"><strong>GSTIN:</strong> ${storeGstin}</div>` : ''}
            ${storeContact ? `<div style="font-size:11px;color:#475569">${storeContact}</div>` : ''}
          </td>
          <td style="width:50%;vertical-align:top">
            <div style="font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:1px;margin-bottom:4px">BILLED TO</div>
            <div style="font-size:12px;color:#0f172a"><strong>${order.customerName}</strong></div>
            ${order.customerPhone ? `<div style="font-size:11px;color:#475569">${order.customerPhone}</div>` : ''}
            ${order.customerEmail ? `<div style="font-size:11px;color:#475569">${order.customerEmail}</div>` : ''}
            ${(shipAddr.street || shipAddr.city) ? `<div style="font-size:11px;color:#475569">${[shipAddr.street, shipAddr.city, shipAddr.state, shipAddr.postalCode || shipAddr.zipCode].filter(Boolean).join(', ')}</div>` : ''}
          </td>
        </tr></table>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:8px;font-size:10px;color:#64748b;text-align:left">#</th>
            <th style="padding:8px;font-size:10px;color:#64748b;text-align:left">ITEM</th>
            <th style="padding:8px;font-size:10px;color:#64748b;text-align:center">QTY</th>
            <th style="padding:8px;font-size:10px;color:#64748b;text-align:right">RATE</th>
            <th style="padding:8px;font-size:10px;color:#64748b;text-align:right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="padding:12px 24px 4px">
        <table style="width:260px;margin-left:auto;border-collapse:collapse">
          <tr><td style="padding:4px 0;font-size:12px;color:#475569">Subtotal</td><td style="padding:4px 0;font-size:12px;color:#0f172a;text-align:right">${inr(subtotal)}</td></tr>
          ${discount > 0 ? `<tr><td style="padding:4px 0;font-size:12px;color:#475569">Discount${order.couponCodeApplied ? ` (${order.couponCodeApplied})` : ''}</td><td style="padding:4px 0;font-size:12px;color:#059669;text-align:right">&minus; ${inr(discount)}</td></tr>` : ''}
          <tr><td style="padding:4px 0;font-size:12px;color:#475569">Shipping</td><td style="padding:4px 0;font-size:12px;color:#0f172a;text-align:right">${shipping > 0 ? inr(shipping) : 'FREE'}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#475569">CGST <span style="color:#94a3b8">(included)</span></td><td style="padding:4px 0;font-size:12px;color:#0f172a;text-align:right">${inr(cgst)}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#475569">SGST <span style="color:#94a3b8">(included)</span></td><td style="padding:4px 0;font-size:12px;color:#0f172a;text-align:right">${inr(sgst)}</td></tr>
          <tr style="border-top:2px solid #0f172a"><td style="padding:8px 0;font-size:13px;font-weight:800;color:#0f172a">TOTAL PAID</td><td style="padding:8px 0;font-size:13px;font-weight:800;color:#0f172a;text-align:right">${inr(total)}</td></tr>
        </table>
      </div>

      <div style="padding:12px 24px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0">
        <div><strong>Payment:</strong> ${order.paymentMethod || '&mdash;'} &nbsp;&middot;&nbsp; <strong>Status:</strong> ${order.paymentStatus || '&mdash;'}</div>
        <div style="margin-top:4px"><strong>Tracking:</strong> ${order.trackingNumber || '&mdash;'}</div>
        <div style="margin-top:8px;color:#94a3b8">Prices are inclusive of applicable taxes. Thank you for shopping directly with ${storeName} &mdash; 0% platform fee, powered by Go Julex.</div>
      </div>
    </div>`;

    // Send AS the store: invoice-config store email, else the store owner's
    // account, else the platform address — with a Reply-To back to the store
    const storeFromEmail = config?.storeEmail || order.tenant?.users?.[0]?.email || null;
    const fromHeader = storeFromEmail
      ? `${storeName.replace(/["<>]/g, '')} <${storeFromEmail}>`
      : undefined;

    return sendMail({
      to: order.customerEmail,
      ...(fromHeader ? { from: fromHeader, replyTo: storeFromEmail } : {}),
      subject: `${storeName} - GST Invoice ${invoiceNo} (Order ${order.orderNumber})`,
      html,
      text: `${storeName} GST Invoice ${invoiceNo} for order ${order.orderNumber}. Total ${inr(total)}. Thank you for your purchase.`
    });
  } catch (e) {
    console.error('Invoice email build failed:', e.message);
    return { sent: false, error: e.message };
  }
};

router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      subtotalAmount,
      discountAmount,
      discountAppliedINR,
      couponCode,
      shippingFee,
      taxAmount,
      channel,
      tenantId,
      items,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      paymentStatus,
      fulfillmentStatus,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart contains no items to order.' });
    }

    const orderNumSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${orderNumSuffix}`;
    const trackingNumber = `TRK-IN-${orderNumSuffix}-EXP`;

    // Try finding user id if registered
    let userId = null;
    if (customerEmail) {
      const user = await prisma.user.findUnique({ where: { email: customerEmail.toLowerCase().trim() } });
      if (user) userId = user.id;
    }

    // Safely validate item relations
    const preparedItems = [];
    for (const item of items) {
      let validProductId = null;
      if (item.id && !item.id.startsWith('prod-') && !item.id.startsWith('p_')) {
        try {
          const p = await prisma.product.findUnique({ where: { id: item.id } });
          if (p) validProductId = p.id;
        } catch (err) {
          validProductId = null;
        }
      }

      preparedItems.push({
        productId: validProductId,
        productName: item.name || item.productName || 'Direct D2C Order Piece',
        variantLabel: (item.variant || item.variantLabel || null),
        productImage: item.image || item.productImage || item.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        quantity: Number(item.quantity) || 1,
        priceAtPurchase: Number(item.finalPrice !== undefined ? item.finalPrice : item.price) || 0
      });
    }

    // Totals are computed from the LINE ITEMS — the single source of truth.
    // (The checkout's post-discount total used to be stored as the subtotal,
    // then the invoice subtracted the discount AGAIN and invented a 3% tax,
    // producing totals that disagreed across dashboard/invoice/email.)
    const computedSubtotal = preparedItems.reduce((acc, i) => acc + (i.priceAtPurchase * i.quantity), 0);
    const orderDiscount = Math.min(computedSubtotal, Number(discountAmount ?? discountAppliedINR) || 0);

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        tenantId: tenantId || null,
        userId,
        customerName: customerName ? customerName.trim() : 'Valued Customer',
        customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : '',
        customerPhone: customerPhone ? customerPhone.trim() : null,
        subtotalAmount: computedSubtotal,
        discountAmount: orderDiscount,
        couponCodeApplied: couponCode ? String(couponCode).trim().toUpperCase() : null,
        shippingFee: Number(shippingFee) || 0,
        taxAmount: Number(taxAmount) || 0,
        totalAmount: Math.max(0, computedSubtotal - orderDiscount + (Number(shippingFee) || 0) + (Number(taxAmount) || 0)),
        channel: channel || 'WEB',
        paymentStatus: paymentStatus || 'PAID',
        fulfillmentStatus: fulfillmentStatus || 'PROCESSING',
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress || {}),
        deliveryMethod: deliveryMethod || 'Complimentary Insured Express Transit (Pan-India)',
        paymentMethod: paymentMethod || 'Instant UPI',
        trackingNumber,
        notes: notes || '',
        items: {
          create: preparedItems
        }
      },
      include: { items: true, tenant: { select: { id: true, name: true, subdomain: true, users: { select: { email: true }, take: 1 } } } }
    });

    // Deduct stock from products
    for (const item of items) {
      if (item.id) {
        try {
          const product = await prisma.product.findUnique({ where: { id: item.id } });
          if (product) {
            const newStock = Math.max(0, product.stock - (item.quantity || 1));
            await prisma.product.update({
              where: { id: item.id },
              data: { stock: newStock }
            });
          }
        } catch (e) {
          // Fallback gracefully
        }
      }
    }

    // Coupon usage tracking — count redemptions on the store's own coupon
    if (couponCode) {
      try {
        const cleanCoupon = String(couponCode).trim().toUpperCase();
        const used = await prisma.coupon.updateMany({
          where: { code: cleanCoupon, ...(tenantId ? { tenantId } : {}) },
          data: { usageCount: { increment: 1 } }
        });
        if (used.count === 0) console.warn(`Coupon usage not counted (unknown code ${cleanCoupon})`);
      } catch (e) {
        console.warn('Coupon usage increment failed:', e.message);
      }
    }

    // Email the GST invoice to the customer automatically. Non-blocking:
    // a mail outage must never fail the order itself.
    if (createdOrder.customerEmail) {
      sendOrderInvoiceEmail(createdOrder)
        .then((r) => {
          if (r?.sent) console.log(`GST invoice emailed for ${createdOrder.orderNumber} to ${createdOrder.customerEmail}`);
          else console.warn(`Invoice email not sent for ${createdOrder.orderNumber}: ${r?.error || 'unknown'}`);
        })
        .catch((e) => console.warn('Invoice email failed:', e.message));
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed and confirmed successfully.',
      data: formatOrder(createdOrder)
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to place order.' });
  }
});

// PATCH /api/orders/:id/status (Admin Only: Update order fulfillment status & restore stock on Cancelled)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const identifier = req.params.id;

    // Search by orderNumber or uuid
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: identifier },
          { orderNumber: identifier }
        ]
      },
      include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.fulfillmentStatus;
    const dataToUpdate = {};
    if (status) dataToUpdate.fulfillmentStatus = status;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: dataToUpdate,
      include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } }
    });

    // If order was newly cancelled, restore product stock
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      for (const item of order.items) {
        if (item.productId) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            });
          } catch (e) {
            // Ignore
          }
        }
      }
    }

    return res.json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: formatOrder(updated)
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// DELETE /api/orders/:id (Admin Only: Delete / cancel order)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const identifier = req.params.id;
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: identifier },
          { orderNumber: identifier }
        ]
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await prisma.order.delete({ where: { id: order.id } });

    return res.json({
      success: true,
      message: `Order "${order.orderNumber}" deleted.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
});

export default router;
