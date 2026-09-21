import express from 'express';
import { prisma } from '../db.js';
import { randomBytes } from 'node:crypto';
import { requireAdmin, requireAuth, optionalAuth, tenantScope } from '../middleware/auth.js';
import { sendMail, invoiceEmailHtml } from '../utils/mailer.js';
import { generateInvoicePdf } from '../utils/invoicePdf.js';

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
    createdAt: ord.createdAt,
    status: ord.fulfillmentStatus || ord.status,   // ← schema field is fulfillmentStatus
    fulfillmentStatus: ord.fulfillmentStatus,
    paymentStatus: ord.paymentStatus,
    trackingNumber: ord.trackingNumber || null,
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

    const where = { ...tenantScope(req) };
    if (tenantId && tenantId !== 'all') {
      if (req.user.role !== 'SUPER_ADMIN' && tenantId !== req.tenantId) {
        return res.status(403).json({ success: false, message: 'Not your store.' });
      }
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
router.get('/user/:email', requireAuth, async (req, res) => {
  try {
    const email = req.params.email?.toLowerCase().trim();
    if (req.user.role !== 'SUPER_ADMIN' && req.user.email.toLowerCase() !== email) {
      return res.status(403).json({ success: false, message: 'Not your orders.' });
    }
    const orders = await prisma.order.findMany({
      where: { customerEmail: { equals: email }, ...(req.user.role === 'SUPER_ADMIN' ? {} : { userId: req.user.id }) },
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
router.get('/:id', requireAuth, async (req, res) => {
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
    const isPlatformAdmin = req.user.role === 'SUPER_ADMIN';
    const isMerchant = ['MERCHANT_OWNER', 'MERCHANT_STAFF', 'ADMIN'].includes(req.user.role) && order.tenantId === req.tenantId;
    const isCustomer = order.userId === req.user.id && order.customerEmail.toLowerCase() === req.user.email.toLowerCase();
    if (!isPlatformAdmin && !isMerchant && !isCustomer) {
      return res.status(403).json({ success: false, message: 'Not your order.' });
    }

    return res.json({
      success: true,
      data: formatOrder(order)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
});

// ----------------------------------------------------
// GST tax invoice email — sent automatically to the customer
// right after their order is placed: a branded order-summary
// body plus the tax invoice as a PDF attachment (built from
// the store's invoice config). Fire-and-forget: a mail/PDF
// failure NEVER fails the order itself, and the idempotent
// checkoutKey replay path does not re-send.
// ----------------------------------------------------
const sendOrderInvoiceEmail = async (order) => {
  try {
    const config = order.tenantId
      ? await prisma.tenantInvoiceConfig.findUnique({ where: { tenantId: order.tenantId } })
      : null;
    const pdfBuffer = await generateInvoicePdf(order, config);
    const invoiceNo = `INV-${String(order.orderNumber || '').replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`;
    const storeName = config?.storeTradeName || config?.storeLegalName || order.tenant?.name || 'The Store';

    // Send AS the store when its invoice config carries an email — with a
    // Reply-To back to the store — else from the platform address.
    const storeFromEmail = config?.storeEmail || null;
    const fromHeader = storeFromEmail
      ? `${storeName.replace(/["<>]/g, '')} <${storeFromEmail}>`
      : undefined;

    const total = Number(order.totalAmount || 0);
    const mail = await sendMail({
      to: order.customerEmail,
      ...(fromHeader ? { from: fromHeader, replyTo: storeFromEmail } : {}),
      subject: `${storeName} - GST Invoice ${invoiceNo} (Order ${order.orderNumber})`,
      text: `Hi ${order.customerName},

Thank you for your order ${order.orderNumber} from ${storeName}! Your GST tax invoice ${invoiceNo} is attached to this email as a PDF.

Total payable (${order.paymentMethod || 'Cash on Delivery'}): Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

We will contact you shortly about delivery.

- ${storeName}`,
      html: invoiceEmailHtml(order, storeName, invoiceNo),
      attachments: [{ filename: `${invoiceNo}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    });
    console.log(`[invoice] ${mail.sent ? 'EMAILED' : 'MAIL-FAILED'} ${invoiceNo} for ${order.orderNumber} to ${order.customerEmail}`);
    return mail;
  } catch (e) {
    console.error(`[invoice] could not email invoice for ${order?.orderNumber}:`, e.message);
    return { sent: false };
  }
};

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, tenantId, items, shippingAddress, couponCode, paymentMethod, checkoutKey } = req.body || {};
    const fail = (status, message) => { const error = new Error(message); error.status = status; throw error; };
    const cleanEmail = String(customerEmail || '').trim().toLowerCase();
    const cleanName = String(customerName || '').trim();
    const cleanPhone = String(customerPhone || '').trim();
    const key = String(checkoutKey || '').trim();
    if (!key || key.length > 128) fail(400, 'A checkout key is required. Refresh checkout and try again.');
    if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !/^\+?[0-9\s-]{10,16}$/.test(cleanPhone)) {
      fail(400, 'Name, valid email and phone number are required.');
    }
    if (!tenantId || !Array.isArray(items) || items.length === 0 || items.length > 100) fail(400, 'Select products from one store before checking out.');
    if (!/cash on delivery|\bcod\b/i.test(String(paymentMethod || ''))) fail(400, 'Online payment is not available yet. Choose cash on delivery.');
    const address = typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress;
    if (!address || !String(address.street || '').trim() || !String(address.city || '').trim() || !String(address.state || '').trim() || !/^\d{6}$/.test(String(address.zipCode || address.postalCode || ''))) {
      fail(400, 'Enter a complete delivery address and a six-digit PIN code.');
    }
    const existing = await prisma.order.findUnique({ where: { checkoutKey: key }, include: { items: true, tenant: true } });
    if (existing) {
      if (existing.customerEmail !== cleanEmail || existing.tenantId !== tenantId) fail(409, 'This checkout key belongs to another order.');
      return res.json({ success: true, message: 'Order already placed.', data: formatOrder(existing) });
    }
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !['ACTIVE', 'PUBLISHED'].includes(String(tenant.status).toUpperCase())) fail(400, 'This store is not accepting orders.');

    const createdOrder = await prisma.$transaction(async (tx) => {
      const preparedItems = [];
      let subtotalPaise = 0;
      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) fail(400, 'Invalid product quantity.');
        const product = await tx.product.findFirst({ where: { id: String(item.id || item.productId || ''), tenantId, status: true } });
        if (!product || !Number.isFinite(product.price) || product.price <= 0) fail(400, 'A product in your cart is no longer available.');
        const updated = await tx.product.updateMany({ where: { id: product.id, tenantId, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } });
        if (updated.count !== 1) fail(409, `${product.name} is out of stock. Please update your cart.`);
        const pricePaise = Math.round(product.price * 100);
        subtotalPaise += pricePaise * quantity;
        let images = [];
        try { images = JSON.parse(product.imagesArray || '[]'); } catch {}
        preparedItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          variantLabel: item.variant || item.variantLabel || null,
          productImage: Array.isArray(images) ? String(images[0] || '') : '',
          quantity,
          priceAtPurchase: pricePaise / 100,
          gstPercent: product.chargeTax ? product.gstRatePercent : 0
        });
      }
      let discountPaise = 0;
      let cleanCoupon = null;
      if (couponCode) {
        cleanCoupon = String(couponCode).trim().toUpperCase();
        const coupon = await tx.coupon.findFirst({ where: { code: cleanCoupon, tenantId, isActive: true } });
        if (!coupon || (coupon.expiresAt && coupon.expiresAt <= new Date()) || subtotalPaise < Math.round(coupon.minOrderAmount * 100)) fail(400, 'Coupon is invalid or no longer applies to this order.');
        discountPaise = coupon.discountType === 'PERCENT'
          ? Math.round(subtotalPaise * coupon.discountValue / 100)
          : Math.round(coupon.discountValue * 100);
        if (coupon.maxDiscountAmount != null) discountPaise = Math.min(discountPaise, Math.round(coupon.maxDiscountAmount * 100));
        discountPaise = Math.max(0, Math.min(subtotalPaise, discountPaise));
        await tx.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
      }
      const suffix = `${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
      return tx.order.create({
        data: {
          checkoutKey: key,
          orderNumber: `ORD-${suffix}`,
          tenantId,
          userId: req.user?.role === 'USER' && req.user.email.toLowerCase() === cleanEmail ? req.user.id : null,
          customerName: cleanName,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          subtotalAmount: subtotalPaise / 100,
          discountAmount: discountPaise / 100,
          couponCodeApplied: cleanCoupon,
          shippingFee: 0,
          taxAmount: 0,
          totalAmount: (subtotalPaise - discountPaise) / 100,
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'PROCESSING',
          shippingAddress: JSON.stringify(address),
          deliveryMethod: 'Standard Courier',
          paymentMethod: 'Cash on Delivery',
          trackingNumber: null,
          items: { create: preparedItems }
        },
        include: { items: true, tenant: true }
      });
    });
    // Invoice PDF email goes out asynchronously — the customer's order
    // response is never delayed or failed by mail problems.
    sendOrderInvoiceEmail(createdOrder).catch(() => {});
    return res.status(201).json({ success: true, message: 'Order placed. Payment is due on delivery.', data: formatOrder(createdOrder) });
  } catch (error) {
    console.error('Create order error:', error);
    if (error.code === 'P2002' && req.body?.checkoutKey) {
      const existing = await prisma.order.findUnique({ where: { checkoutKey: String(req.body.checkoutKey) }, include: { items: true, tenant: true } });
      if (existing && existing.customerEmail === String(req.body.customerEmail || '').trim().toLowerCase()) return res.json({ success: true, message: 'Order already placed.', data: formatOrder(existing) });
    }
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Failed to place order.' });
  }
});

// PATCH /api/orders/:id/status (Admin Only: Update order fulfillment status & restore stock on Cancelled)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    if (status && !['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid fulfillment status.' });
    }
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
    if (req.user.role !== 'SUPER_ADMIN' && order.tenantId !== req.tenantId) {
      return res.status(403).json({ success: false, message: 'Not your order.' });
    }

    const previousStatus = order.fulfillmentStatus;
    const dataToUpdate = {};
    if (status) dataToUpdate.fulfillmentStatus = status;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;
    if (notes !== undefined) dataToUpdate.notes = notes;

    if (previousStatus === 'CANCELLED' && status && status !== 'CANCELLED') {
      return res.status(409).json({ success: false, message: 'A cancelled order cannot be reopened.' });
    }
    if (status === 'CANCELLED' && (order.paymentStatus === 'PAID' || previousStatus === 'DELIVERED')) {
      return res.status(409).json({ success: false, message: 'A paid or delivered order requires a separate return or refund process.' });
    }
    const updated = await prisma.$transaction(async (tx) => {
      let newlyCancelled = false;
      if (status === 'CANCELLED') {
        const result = await tx.order.updateMany({ where: { id: order.id, fulfillmentStatus: { not: 'CANCELLED' } }, data: dataToUpdate });
        newlyCancelled = result.count === 1;
      } else {
        await tx.order.update({ where: { id: order.id }, data: dataToUpdate });
      }
      if (newlyCancelled) {
        for (const item of order.items) {
          if (item.productId) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }
      return tx.order.findUnique({ where: { id: order.id }, include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } } });
    });

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

// Cash collection is a merchant-attested event. Keep an audit trail and never
// accept a customer-supplied payment status at checkout.
router.patch('/:id/collect-cod', requireAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({ where: { OR: [{ id: req.params.id }, { orderNumber: req.params.id }] }, include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (req.user.role !== 'SUPER_ADMIN' && order.tenantId !== req.tenantId) return res.status(403).json({ success: false, message: 'Not your order.' });
    if (order.paymentMethod !== 'Cash on Delivery' || order.fulfillmentStatus !== 'DELIVERED') return res.status(409).json({ success: false, message: 'Cash collection can be recorded only after a cash-on-delivery order is delivered.' });
    if (order.paymentStatus !== 'PENDING') return res.status(409).json({ success: false, message: 'Payment has already been recorded or changed.' });
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({ where: { id: order.id, paymentStatus: 'PENDING' }, data: { paymentStatus: 'PAID' } });
      if (result.count !== 1) return null;
      await tx.auditLog.create({ data: { tenantId: order.tenantId, actorId: req.user.id, actorEmail: req.user.email, action: 'COD_CASH_COLLECTED', entityType: 'ORDER', entityId: order.id, detailsJson: JSON.stringify({ orderNumber: order.orderNumber, amount: order.totalAmount }), ipAddress: req.ip || '' } });
      return tx.order.findUnique({ where: { id: order.id }, include: { items: true, tenant: { select: { id: true, name: true, subdomain: true } } } });
    });
    if (!updated) return res.status(409).json({ success: false, message: 'Payment was already recorded.' });
    return res.json({ success: true, data: formatOrder(updated) });
  } catch (error) {
    console.error('Record cash collection error:', error);
    return res.status(500).json({ success: false, message: 'Could not record cash collection.' });
  }
});

// Historical orders are financial records. Cancel rather than deleting them.
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
    if (req.user.role !== 'SUPER_ADMIN' && order.tenantId !== req.tenantId) {
      return res.status(403).json({ success: false, message: 'Not your order.' });
    }

    return res.status(405).json({ success: false, message: 'Orders cannot be deleted. Use the cancellation status instead.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete order.' });
  }
});

export default router;
