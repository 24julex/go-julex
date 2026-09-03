import express from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/coupons (Public: Fetch all active coupons for customer checkout & showcase)
router.get('/', async (req, res) => {
  try {
    let coupons = await prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // Auto-seed default luxury coupons if registry is currently empty
    if (coupons.length === 0) {
      const defaultCoupons = [
        {
          code: 'CHRONOS10',
          description: 'Welcome Customer Privilege Voucher (10% Off Entire Vault)',
          discountType: 'PERCENT',
          discountValue: 10,
          minOrderAmount: 0,
          maxDiscountAmount: 500000,
          isActive: true
        },
        {
          code: 'ROYAL50000',
          description: 'Grand Horology Voucher (₹50,000 Off Orders over ₹10 Lakhs)',
          discountType: 'FIXED',
          discountValue: 50000,
          minOrderAmount: 1000000,
          isActive: true
        },
        {
          code: 'FESTIVE15',
          description: 'Festive Connoisseur Celebration (15% Off Orders over ₹5 Lakhs)',
          discountType: 'PERCENT',
          discountValue: 15,
          minOrderAmount: 500000,
          maxDiscountAmount: 300000,
          isActive: true
        }
      ];

      for (const c of defaultCoupons) {
        await prisma.coupon.upsert({
          where: { code: c.code },
          update: {},
          create: c
        }).catch(() => {});
      }

      coupons = await prisma.coupon.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    const now = new Date();
    const validCoupons = coupons.filter((c) => !c.expiresAt || new Date(c.expiresAt) > now);

    return res.json({
      success: true,
      count: validCoupons.length,
      data: validCoupons
    });
  } catch (error) {
    console.error('Fetch active coupons error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve available coupons.' });
  }
});

// GET /api/coupons/all (Admin Only: Fetch all coupons including inactive & analytics)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    console.error('Admin fetch coupons error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve coupon registry.' });
  }
});

// POST /api/coupons (Admin Only: Create new coupon)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiresAt,
      isActive
    } = req.body;

    const cleanCode = code?.trim().toUpperCase();
    if (!cleanCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon description is required.' });
    }

    const value = Number(discountValue);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ success: false, message: 'Discount value must be greater than 0.' });
    }

    if (discountType === 'PERCENT' && value > 90) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 90%.' });
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${cleanCode}" already exists. Please use a unique code or update the existing one.`
      });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description.trim(),
        discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENT',
        discountValue: value,
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    return res.status(201).json({
      success: true,
      message: `Privilege coupon "${newCoupon.code}" created successfully.`,
      data: newCoupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create coupon: ' + error.message });
  }
});

// PUT /api/coupons/:id (Admin Only: Update coupon details or toggle active status)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const identifier = req.params.id;
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiresAt,
      isActive
    } = req.body;

    const existing = await prisma.coupon.findFirst({
      where: {
        OR: [{ id: identifier }, { code: identifier.toUpperCase() }]
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found in registry.' });
    }

    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (description !== undefined) updateData.description = description.trim();
    if (discountType) updateData.discountType = discountType === 'FIXED' ? 'FIXED' : 'PERCENT';
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) {
      updateData.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    }
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.coupon.update({
      where: { id: existing.id },
      data: updateData
    });

    return res.json({
      success: true,
      message: `Coupon "${updated.code}" updated successfully.`,
      data: updated
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

// DELETE /api/coupons/:id (Admin Only: Delete coupon)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const identifier = req.params.id;

    const existing = await prisma.coupon.findFirst({
      where: {
        OR: [{ id: identifier }, { code: identifier.toUpperCase() }]
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    await prisma.coupon.delete({ where: { id: existing.id } });

    return res.json({
      success: true,
      message: `Coupon "${existing.code}" removed from registry.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

// POST /api/coupons/validate (Public: Validate promo code against current cart valuation)
// PUT /api/coupons/:code — Admin: update coupon (status, terms)
router.put('/:code', requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const { isActive, discountValue, minOrderAmount, maxDiscountAmount, expiresAt, description } = req.body;
    const cleanCode = code?.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    const updated = await prisma.coupon.update({
      where: { code: cleanCode },
      data: {
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(discountValue !== undefined ? { discountValue: Number(discountValue) } : {}),
        ...(minOrderAmount !== undefined ? { minOrderAmount: Number(minOrderAmount) || 0 } : {}),
        ...(maxDiscountAmount !== undefined ? { maxDiscountAmount: Number(maxDiscountAmount) || null } : {}),
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        ...(description !== undefined ? { description } : {})
      }
    });
    return res.json({ success: true, message: `Coupon ${cleanCode} updated.`, data: { code: updated.code, isActive: updated.isActive } });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const cleanCode = code?.trim().toUpperCase();

    if (!cleanCode) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const coupon = await prisma.coupon.findFirst({
      where: { code: cleanCode, isActive: true }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Promo code "${cleanCode}" is invalid or expired.`
      });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: `Promo code "${cleanCode}" expired on ${new Date(coupon.expiresAt).toLocaleDateString()}.`
      });
    }

    const currentTotal = Number(cartTotal) || 0;
    if (coupon.minOrderAmount > 0 && currentTotal < coupon.minOrderAmount) {
      const needed = coupon.minOrderAmount - currentTotal;
      return res.status(400).json({
        success: false,
        message: `Code "${cleanCode}" requires a minimum order of ₹${coupon.minOrderAmount.toLocaleString('en-IN')}. Add ₹${needed.toLocaleString('en-IN')} more to qualify.`
      });
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'PERCENT') {
      calculatedDiscount = (currentTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = Math.min(coupon.discountValue, currentTotal);
    }

    return res.json({
      success: true,
      data: {
        code: coupon.code,
        label: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
  }
});

export default router;
