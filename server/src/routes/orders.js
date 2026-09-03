import express from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

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
      include: { items: true },
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
      include: { items: true },
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
      include: { items: true }
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
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      subtotalAmount,
      discountAmount,
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
        productImage: item.image || item.productImage || item.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        quantity: Number(item.quantity) || 1,
        priceAtPurchase: Number(item.finalPrice !== undefined ? item.finalPrice : item.price) || 0
      });
    }

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        tenantId: tenantId || null,
        userId,
        customerName: customerName ? customerName.trim() : 'Valued Customer',
        customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : 'customer@gojulex.com',
        customerPhone: customerPhone ? customerPhone.trim() : '+91 98200 12345',
        subtotalAmount: Number(subtotalAmount) || Number(totalAmount) || 0,
        discountAmount: Number(discountAmount) || 0,
        shippingFee: Number(shippingFee) || 0,
        taxAmount: Number(taxAmount) || 0,
        totalAmount: Number(totalAmount) || 0,
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
      include: { items: true }
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
      include: { items: true }
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
      include: { items: true }
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
