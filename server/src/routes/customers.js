import express from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/customers — All customers with order count & total spent
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;

    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        orders: {
          select: { id: true, totalAmount: true, paymentStatus: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let results = users.map(u => {
      const paidOrders = u.orders.filter(o => o.paymentStatus === 'PAID');
      const totalSpent = paidOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      const lastOrder = u.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        address: u.address,
        avatarUrl: u.avatarUrl,
        ordersCount: u.orders.length,
        paidOrdersCount: paidOrders.length,
        totalSpentINR: totalSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
        segment:
          totalSpent >= 500000 ? 'VIP'
          : totalSpent >= 100000 ? 'High Value'
          : paidOrders.length >= 3 ? 'Loyal'
          : paidOrders.length >= 1 ? 'Customer'
          : 'Prospect',
        createdAt: u.createdAt
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
      );
    }

    return res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
});

// GET /api/customers/:id — Single customer with order history
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user || user.role !== 'USER') {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const paidOrders = user.orders.filter(o => o.paymentStatus === 'PAID');
    const totalSpent = paidOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatarUrl: user.avatarUrl,
        ordersCount: user.orders.length,
        totalSpentINR: totalSpent,
        createdAt: user.createdAt,
        orders: user.orders
      }
    });
  } catch (error) {
    console.error('Fetch customer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer.' });
  }
});

// PATCH /api/customers/:id — Update customer details
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, phone, address, avatarUrl } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData
    });

    return res.json({
      success: true,
      message: 'Customer updated.',
      data: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update customer.' });
  }
});

// DELETE /api/customers/:id — Delete customer account
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.role !== 'USER') {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Nullify their order references rather than cascade delete orders
    await prisma.order.updateMany({
      where: { userId: req.params.id },
      data: { userId: null }
    });

    await prisma.review.deleteMany({ where: { userId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });

    return res.json({ success: true, message: `Customer "${existing.name}" removed.` });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete customer.' });
  }
});

export default router;
