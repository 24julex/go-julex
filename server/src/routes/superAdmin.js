import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// =====================================================
// TENANTS (Merchant Stores)
// =====================================================

/**
 * GET /api/super-admin/tenants
 * Lists all tenant stores with stats
 */
router.get('/tenants', requireSuperAdmin, async (req, res) => {
  try {
    const { search, status, plan } = req.query;

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (plan && plan !== 'all') where.planTier = plan;

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true }
        },
        invoiceConfig: true,
        _count: {
          select: { orders: true, products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let results = tenants;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.subdomain.toLowerCase().includes(q) ||
        (t.customDomain && t.customDomain.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }

    // Compute MRR per tenant based on planTier
    const planMRR = {
      TRIAL: 0,
      FREE: 0,
      SIX_MONTH: 1999,
      ONE_YEAR: 1666,
    };

    const enriched = results.map(t => ({
      ...t,
      ownerUser: t.users.find(u => u.role === 'MERCHANT_OWNER') || t.users[0] || null,
      userCount: t.users.length,
      orderCount: t._count.orders,
      productCount: t._count.products,
      monthlyRevenue: planMRR[t.planTier] || 0
    }));

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    console.error('Tenants list error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tenants.' });
  }
});

/**
 * GET /api/super-admin/tenants/:id
 * Full detail view for a single tenant
 */
router.get('/tenants/:id', requireSuperAdmin, async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: {
        users: true,
        invoiceConfig: { include: { template: true } },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
        _count: { select: { orders: true, products: true } }
      }
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    // Compute tenant GMV from orders
    const orders = await prisma.order.findMany({
      where: { tenantId: tenant.id },
      select: { totalAmount: true, fulfillmentStatus: true, paymentStatus: true, createdAt: true }
    });

    const gmv = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    return res.json({
      success: true,
      data: {
        ...tenant,
        orderCount: tenant._count.orders,
        productCount: tenant._count.products,
        gmv,
        orders
      }
    });
  } catch (error) {
    console.error('Tenant detail error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch tenant details.' });
  }
});

/**
 * POST /api/super-admin/tenants
 * Provision a new tenant store with an owner user
 */
router.post('/tenants', requireSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      subdomain,
      customDomain,
      category,
      city,
      state,
      planTier,
      ownerName,
      ownerEmail,
      ownerPassword
    } = req.body;

    if (!name || !subdomain || !ownerEmail || !ownerName) {
      return res.status(400).json({
        success: false,
        message: 'Store name, subdomain, owner name and owner email are required.'
      });
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const existing = await prisma.tenant.findUnique({ where: { subdomain: cleanSubdomain } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Subdomain "${cleanSubdomain}" is already taken.` });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(ownerPassword || 'merchant123', 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: name.trim(),
        subdomain: cleanSubdomain,
        customDomain: customDomain?.trim() || null,
        category: category || 'General',
        city: city || null,
        state: state || null,
        planTier: planTier || 'TRIAL',
        status: 'ACTIVE',
        users: {
          create: {
            email: ownerEmail.toLowerCase().trim(),
            passwordHash,
            name: ownerName.trim(),
            role: 'MERCHANT_OWNER',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=EFF6FF&color=2563EB&size=200`
          }
        }
      },
      include: { users: true }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: 'TENANT_PROVISIONED',
        entityType: 'TENANT',
        entityId: tenant.id,
        detailsJson: JSON.stringify({ name: tenant.name, subdomain: tenant.subdomain, plan: planTier }),
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.status(201).json({
      success: true,
      message: `Merchant store "${tenant.name}" provisioned successfully.`,
      data: tenant
    });
  } catch (error) {
    console.error('Provision tenant error:', error);
    return res.status(500).json({ success: false, message: 'Failed to provision tenant: ' + error.message });
  }
});

/**
 * PATCH /api/super-admin/tenants/:id/status
 * Suspend, activate, or upgrade plan for a tenant
 */
router.patch('/tenants/:id/status', requireSuperAdmin, async (req, res) => {
  try {
    const { status, planTier, notes } = req.body;
    const { id } = req.params;

    const updateData = {};
    if (status) updateData.status = status;
    if (planTier) updateData.planTier = planTier;

    const updated = await prisma.tenant.update({
      where: { id },
      data: updateData
    });

    const action = status === 'SUSPENDED' ? 'TENANT_SUSPENDED'
      : status === 'ACTIVE' ? 'TENANT_ACTIVATED'
      : planTier ? 'TENANT_PLAN_CHANGED'
      : 'TENANT_UPDATED';

    await prisma.auditLog.create({
      data: {
        tenantId: id,
        actorId: req.user.id,
        actorEmail: req.user.email,
        action,
        entityType: 'TENANT',
        entityId: id,
        detailsJson: JSON.stringify({ status, planTier, notes }),
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({
      success: true,
      message: `Tenant status updated.`,
      data: updated
    });
  } catch (error) {
    console.error('Update tenant status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update tenant.' });
  }
});

// =====================================================
// PLATFORM METRICS
// =====================================================

/**
 * GET /api/super-admin/metrics
 * Aggregate platform-wide KPI metrics
 */
router.get('/metrics', requireSuperAdmin, async (req, res) => {
  try {
    const [tenants, orders, users] = await Promise.all([
      prisma.tenant.findMany(),
      prisma.order.findMany({ select: { totalAmount: true, paymentStatus: true, createdAt: true } }),
      prisma.user.findMany({ select: { id: true, role: true, createdAt: true } })
    ]);

    const planMRR = { TRIAL: 0, FREE: 0, SIX_MONTH: 1999, ONE_YEAR: 1666 };

    const totalStores = tenants.length;
    const activeStores = tenants.filter(t => t.status === 'ACTIVE').length;
    const trialingStores = tenants.filter(t => t.status === 'TRIALING' || t.planTier === 'TRIAL').length;
    const suspendedStores = tenants.filter(t => t.status === 'SUSPENDED').length;
    const freeStores = tenants.filter(t => t.planTier === 'FREE').length;

    const estimatedMRR = tenants.reduce((s, t) => s + (planMRR[t.planTier] || 0), 0);
    const estimatedARR = estimatedMRR * 12;

    const totalPlatformGMV = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalPlatformOrders = orders.length;
    const totalFeeSavedINR = Math.round(totalPlatformGMV * 0.18); // vs 18% marketplace fee

    // 7-day signup velocity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent7DaySignups = tenants.filter(t => new Date(t.createdAt) >= sevenDaysAgo).length;

    // Monthly GMV trend (last 6 months)
    const gmvTrend = [];
    for (let i = 5; i >= 0; i--) {
      const from = new Date();
      from.setDate(1);
      from.setMonth(from.getMonth() - i);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setMonth(to.getMonth() + 1);

      const monthOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= from && d < to;
      });
      const gmv = monthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      gmvTrend.push({
        month: from.toLocaleString('default', { month: 'short', year: '2-digit' }),
        gmv,
        orders: monthOrders.length
      });
    }

    return res.json({
      success: true,
      data: {
        totalStores,
        activeStores,
        trialingStores,
        suspendedStores,
        freeStores,
        estimatedMRR,
        estimatedARR,
        totalPlatformGMV,
        totalPlatformOrders,
        totalFeeSavedINR,
        recent7DaySignups,
        gmvTrend
      }
    });
  } catch (error) {
    console.error('Platform metrics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute platform metrics.' });
  }
});

// =====================================================
// AUDIT LOGS
// =====================================================

/**
 * GET /api/super-admin/audit-logs
 * Paginated audit log feed
 */
router.get('/audit-logs', requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, tenantId, action } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (tenantId) where.tenantId = tenantId;
    if (action) where.action = { contains: action };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, name: true, subdomain: true } }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: logs
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
});

// =====================================================
// MERCHANTS
// =====================================================

/**
 * GET /api/super-admin/merchants
 * All merchant users across all tenants
 */
router.get('/merchants', requireSuperAdmin, async (req, res) => {
  try {
    const { search } = req.query;

    const where = {
      role: { in: ['MERCHANT_OWNER', 'MERCHANT_STAFF', 'ADMIN'] }
    };

    const users = await prisma.user.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, planTier: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let results = users;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.tenant && u.tenant.name.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: results.length,
      data: results.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl,
        phone: u.phone,
        twoFactorEnabled: u.twoFactorEnabled,
        tenantId: u.tenantId,
        tenant: u.tenant,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Merchants list error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch merchant users.' });
  }
});

// =====================================================
// BROADCASTS
// =====================================================

/**
 * POST /api/super-admin/broadcast
 * Record and dispatch a platform broadcast notification
 */
router.post('/broadcast', requireSuperAdmin, async (req, res) => {
  try {
    const { title, message, targetTier, type = 'PLATFORM_BROADCAST' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    // Determine target tenants
    const where = targetTier && targetTier !== 'all' ? { planTier: targetTier } : {};
    const targets = await prisma.tenant.findMany({ where, select: { id: true } });

    // Log broadcast as audit entry per tenant (or once if all)
    if (targets.length > 0) {
      await prisma.auditLog.createMany({
        data: targets.map(t => ({
          tenantId: t.id,
          actorId: req.user.id,
          actorEmail: req.user.email,
          action: type,
          entityType: 'BROADCAST',
          detailsJson: JSON.stringify({ title, message, targetTier }),
          ipAddress: req.ip || '127.0.0.1'
        }))
      });
    } else {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorEmail: req.user.email,
          action: type,
          entityType: 'BROADCAST',
          detailsJson: JSON.stringify({ title, message, targetTier }),
          ipAddress: req.ip || '127.0.0.1'
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: `Broadcast "${title}" sent to ${targets.length || 'all'} store(s).`,
      recipients: targets.length
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send broadcast.' });
  }
});

export default router;
