import express from 'express';
import { prisma } from '../db.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { seedDatabase } from '../seed.js';

const router = express.Router();

// GET /api/admin/kpis — Aggregate Store KPIs & Financials (tenant-scoped)
router.get('/kpis', requireAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId || null;
    const tenantFilter = tenantId ? { tenantId } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orders, products, brands, users] = await Promise.all([
      prisma.order.findMany({ where: tenantFilter }),
      prisma.product.findMany({ where: tenantFilter }),
      prisma.brand.findMany(),
      prisma.user.findMany({ where: { role: 'USER' } })
    ]);

    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    const totalOrdersCount = orders.length;

    // Today's sales (paid orders created today)
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todaySalesINR = todayOrders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Fulfillment status counts (schema field: fulfillmentStatus)
    const processingOrdersCount = orders.filter(o => o.fulfillmentStatus === 'PROCESSING').length;
    const shippedOrdersCount = orders.filter(o => o.fulfillmentStatus === 'SHIPPED').length;
    const deliveredOrdersCount = orders.filter(o => o.fulfillmentStatus === 'DELIVERED').length;
    const cancelledOrdersCount = orders.filter(o => o.fulfillmentStatus === 'CANCELLED').length;
    const unfulfilledOrdersCount = processingOrdersCount;

    // Product stats
    const totalProductsCount = products.length;
    const discountedProductsCount = products.filter(p => (p.discountPercent || 0) > 0).length;
    const totalInventoryPieces = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const outOfStockCount = products.filter(p => (p.stock || 0) <= 0).length;
    const lowStockItemsCount = products.filter(p => (p.stock || 0) <= 2 && (p.stock || 0) > 0).length;

    const totalBrandsCount = brands.length;
    const totalCustomersCount = users.length;
    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Revenue by channel breakdown
    const channelRevenue = {};
    for (const ord of orders) {
      const ch = ord.channel || 'WEB';
      channelRevenue[ch] = (channelRevenue[ch] || 0) + (ord.totalAmount || 0);
    }

    return res.json({
      success: true,
      data: {
        totalRevenue,
        todaySalesINR,
        totalOrdersCount,
        processingOrdersCount,
        shippedOrdersCount,
        deliveredOrdersCount,
        cancelledOrdersCount,
        unfulfilledOrdersCount,
        totalProductsCount,
        discountedProductsCount,
        totalInventoryPieces,
        outOfStockCount,
        lowStockItemsCount,
        totalBrandsCount,
        totalCustomersCount,
        averageOrderValue,
        channelRevenue
      }
    });
  } catch (error) {
    console.error('KPIs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute KPIs.' });
  }
});

// GET /api/admin/recent-activity — Latest orders and customers
router.get('/recent-activity', requireAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId || null;
    const tenantFilter = tenantId ? { tenantId } : {};

    const [recentOrders, recentCustomers] = await Promise.all([
      prisma.order.findMany({
        where: tenantFilter,
        take: 5,
        orderBy: { createdAt: 'desc' }, // ← fixed: was 'date'
        include: { items: true }
      }),
      prisma.user.findMany({
        where: { role: 'USER' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true, avatarUrl: true }
      })
    ]);

    return res.json({
      success: true,
      data: {
        recentOrders,
        recentCustomers
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch recent activity.' });
  }
});

// GET /api/admin/analytics — Sales trends, top products, channel breakdown
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId || null;
    const tenantFilter = tenantId ? { tenantId } : {};

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [orders, orderItems] = await Promise.all([
      prisma.order.findMany({
        where: { ...tenantFilter, createdAt: { gte: thirtyDaysAgo } },
        include: { items: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.orderItem.findMany({
        include: { order: true }
      })
    ]);

    // Sales by day (last 30 days)
    const salesByDay = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      salesByDay[key] = { date: key, revenue: 0, orders: 0 };
    }
    for (const ord of orders) {
      const key = new Date(ord.createdAt).toISOString().split('T')[0];
      if (salesByDay[key]) {
        salesByDay[key].revenue += ord.totalAmount || 0;
        salesByDay[key].orders += 1;
      }
    }

    // Revenue by channel
    const channelBreakdown = {};
    for (const ord of orders) {
      const ch = ord.channel || 'WEB';
      if (!channelBreakdown[ch]) channelBreakdown[ch] = { channel: ch, revenue: 0, orders: 0 };
      channelBreakdown[ch].revenue += ord.totalAmount || 0;
      channelBreakdown[ch].orders += 1;
    }

    // Top products by sales volume (from orderItems)
    const productSales = {};
    for (const item of orderItems) {
      const k = item.productId || item.productName;
      if (!productSales[k]) {
        productSales[k] = {
          productId: item.productId,
          name: item.productName,
          image: item.productImage,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      productSales[k].totalQuantity += item.quantity;
      productSales[k].totalRevenue += item.priceAtPurchase * item.quantity;
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        salesByDay: Object.values(salesByDay),
        channelBreakdown: Object.values(channelBreakdown),
        topProducts
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute analytics.' });
  }
});

// GET /api/admin/discounts — All coupons for this tenant (admin view)
router.get('/discounts', requireAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId || null;
    const tenantFilter = tenantId ? { tenantId } : {};

    const coupons = await prisma.coupon.findMany({
      where: tenantFilter,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve discounts.' });
  }
});

// POST /api/admin/reset — Reset Database to Factory Defaults (super admin only)
router.post('/reset', requireSuperAdmin, async (req, res) => {
  try {
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.tenantInvoiceConfig.deleteMany();
    await prisma.masterInvoiceTemplate.deleteMany();
    await prisma.product.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany({ where: { role: { not: 'SUPER_ADMIN' } } });
    await prisma.tenant.deleteMany();

    await seedDatabase();

    return res.json({
      success: true,
      message: 'Database reset to factory defaults.'
    });
  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset database.' });
  }
});

export default router;
