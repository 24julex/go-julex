import express from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/brands (List all active luxury brand names with optional counts)
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });

    if (req.query.details === 'true') {
      const products = await prisma.product.findMany({
        select: { brand: true }
      });
      const counts = {};
      for (const p of products) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
      const detailed = brands.map((b) => ({
        id: b.id,
        name: b.name,
        productCount: counts[b.name] || 0
      }));
      return res.json({ success: true, data: detailed });
    }

    return res.json({
      success: true,
      data: brands.map((b) => b.name)
    });
  } catch (error) {
    console.error('Fetch brands error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch brands.' });
  }
});

// POST /api/brands (Admin Only: Add new brand)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const trimmed = name?.trim();

    if (!trimmed) {
      return res.status(400).json({ success: false, message: 'Brand name cannot be empty.' });
    }

    const existing = await prisma.brand.findFirst({
      where: { name: { equals: trimmed } }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Brand "${trimmed}" already exists in the catalog.` });
    }

    const brand = await prisma.brand.create({
      data: { name: trimmed }
    });

    return res.status(201).json({
      success: true,
      message: `Brand "${brand.name}" added to the registry.`,
      brand: brand.name,
      data: brand
    });
  } catch (error) {
    console.error('Add brand error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add brand.' });
  }
});

// PUT /api/brands/:name (Admin Only: Rename brand & update products)
router.put('/:name', requireAdmin, async (req, res) => {
  try {
    const oldName = req.params.name;
    const { newName } = req.body;
    const trimmed = newName?.trim();

    if (!trimmed) {
      return res.status(400).json({ success: false, message: 'New brand name is required.' });
    }

    const brand = await prisma.brand.findFirst({ where: { name: oldName } });
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found in registry.' });
    }

    // Update brand record
    const updated = await prisma.brand.update({
      where: { id: brand.id },
      data: { name: trimmed }
    });

    // Update associated products
    await prisma.product.updateMany({
      where: { brand: oldName },
      data: { brand: trimmed }
    });

    return res.json({
      success: true,
      message: `Brand renamed from "${oldName}" to "${trimmed}".`,
      brand: updated.name
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to rename brand.' });
  }
});

// DELETE /api/brands/:name (Admin Only: Delete brand)
router.delete('/:name', requireAdmin, async (req, res) => {
  try {
    const brandName = req.params.name;

    const brand = await prisma.brand.findFirst({
      where: { name: { equals: brandName } }
    });

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found in registry.' });
    }

    await prisma.brand.delete({
      where: { id: brand.id }
    });

    return res.json({
      success: true,
      message: `Brand "${brandName}" was removed from the registry.`
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete brand.' });
  }
});

export default router;
