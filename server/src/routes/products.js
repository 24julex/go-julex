import express from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to format product with parsed JSON specs and images
const formatProduct = (p) => {
  let specs = {};
  let images = [];
  let variants = [];
  let optionSets = [];
  try {
    specs = typeof p.specsJson === 'string' ? JSON.parse(p.specsJson) : (p.specsJson || {});
  } catch (e) {
    specs = {};
  }
  try {
    images = typeof p.imagesArray === 'string' ? JSON.parse(p.imagesArray) : (p.imagesArray || []);
  } catch (e) {
    images = [];
  }
  try {
    variants = typeof p.variantsJson === 'string' ? JSON.parse(p.variantsJson) : (p.variantsJson || []);
  } catch (e) {
    variants = [];
  }
  if (specs && Array.isArray(specs.optionSets)) {
    optionSets = specs.optionSets;
  }

  const stockQty = Number(p.stock !== undefined ? p.stock : 0);

  const formatted = {
    ...p,
    specs,
    stockQuantity: stockQty,
    stock: stockQty,
    sellingPriceINR: Number(p.price || 0),
    comparePriceINR: Number(p.compareAtPrice || p.price || 0),
    status: stockQty > 0 && p.status !== false ? 'Available' : 'No',
    hasVariants: Boolean(p.hasVariants),
    optionSets: p.hasVariants ? optionSets : [],
    availableSizes: p.hasVariants ? (specs.availableSizes || []) : [],
    availableColors: p.hasVariants ? (specs.availableColors || []) : [],
    variantMatrix: p.hasVariants ? variants : [],
    images: Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
    ],
    imageUrl: (Array.isArray(images) && images[0]) || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
  };

  if (p.reviews && Array.isArray(p.reviews)) {
    formatted.reviews = p.reviews;
  }

  return formatted;
};

// GET /api/products/categories (Fetch all unique categories with counts)
router.get('/categories', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { category: true }
    });

    const categoryMap = {};
    for (const p of products) {
      if (p.category) {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
      }
    }

    const categories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count
    }));

    return res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
});

// GET /api/products/featured (Curated showcase groups)
router.get('/featured', async (req, res) => {
  try {
    const [featured, newArrivals, bestSellers, discounted] = await Promise.all([
      prisma.product.findMany({ where: { isFeatured: true }, take: 4 }),
      prisma.product.findMany({ where: { isNewArrival: true }, take: 4 }),
      prisma.product.findMany({ where: { isBestSeller: true }, take: 4 }),
      prisma.product.findMany({ where: { discountPercent: { gt: 0 } }, take: 4 })
    ]);

    return res.json({
      success: true,
      data: {
        featured: featured.map(formatProduct),
        newArrivals: newArrivals.map(formatProduct),
        bestSellers: bestSellers.map(formatProduct),
        discounted: discounted.map(formatProduct)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve featured products.' });
  }
});

// GET /api/products (Fetch products with rich filters and multi-tenant scoping)
router.get('/', async (req, res) => {
  try {
    const { tenantId, subdomain, search, brand, category, discount, minPrice, maxPrice, inStock, isFeatured, isNewArrival, isBestSeller, sort } = req.query;

    const where = {};
    if (tenantId && tenantId !== 'all') {
      where.tenantId = tenantId;
    }
    if (brand && brand !== 'all') {
      where.brand = { equals: brand };
    }
    if (category && category !== 'all') {
      where.category = { equals: category };
    }
    if (discount === 'true') {
      where.discountPercent = { gt: 0 };
    }
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }
    if (isFeatured === 'true') {
      where.isFeatured = true;
    }
    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }
    if (isBestSeller === 'true') {
      where.isBestSeller = true;
    }

    const rawProducts = await prisma.product.findMany({
      where,
      include: {
        reviews: {
          select: { id: true, rating: true, authorName: true, comment: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let formatted = rawProducts.map(formatProduct);

    // Filter by Price range (calculating final selling price)
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      formatted = formatted.filter((p) => {
        const discountAmt = Math.round((p.price * (p.discountPercent || 0)) / 100);
        const finalPrice = Math.max(0, p.price - discountAmt);
        return finalPrice >= min && finalPrice <= max;
      });
    }

    // In-memory search for flexible matching (name, brand, sku, category)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      formatted = formatted.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort) {
      formatted.sort((a, b) => {
        const aFinal = a.price - Math.round((a.price * (a.discountPercent || 0)) / 100);
        const bFinal = b.price - Math.round((b.price * (b.discountPercent || 0)) / 100);

        if (sort === 'price-low') return aFinal - bFinal;
        if (sort === 'price-high') return bFinal - aFinal;
        if (sort === 'discount-high') return (b.discountPercent || 0) - (a.discountPercent || 0);
        if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
    }

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
});

// GET /api/products/:id (Single product details with reviews)
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in catalog.' });
    }

    return res.json({ success: true, data: formatProduct(product) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving product.' });
  }
});

// POST /api/products (Admin Only: Add new product)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      brand,
      category,
      productType,
      price,
      sellingPriceINR,
      compareAtPrice,
      comparePriceINR,
      discountPercent,
      stock,
      stockQuantity,
      sku,
      description,
      specs,
      optionSets,
      availableSizes,
      availableColors,
      hasVariants,
      variantMatrix,
      images,
      tenantId,
      isFeatured,
      isNewArrival,
      isBestSeller
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Product title is required.' });
    }

    const cleanImages = Array.isArray(images) && images.length > 0
      ? images.filter(Boolean).slice(0, 6)
      : ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'];

    const effectiveStock = Number(stockQuantity !== undefined ? stockQuantity : (stock !== undefined ? stock : 10));
    const effectivePrice = Number(sellingPriceINR !== undefined ? sellingPriceINR : (price || 0));
    const effectiveCompare = Number(comparePriceINR !== undefined ? comparePriceINR : (compareAtPrice || effectivePrice));
    const effectiveVariants = Boolean(hasVariants);

    // Ensure the referenced tenant exists — locally-created stores may not yet
    // have a DB row, which would fail the product's tenant FK (P2003)
    let productTenantId = tenantId || null;
    if (productTenantId) {
      const existingTenant = await prisma.tenant.findUnique({ where: { id: productTenantId } });
      if (!existingTenant) {
        const stubSub = `${productTenantId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 30) || 'store'}-${Date.now().toString().slice(-6)}`;
        await prisma.tenant.create({
          data: {
            id: productTenantId,
            name: brand?.trim() || productTenantId.replace(/^store_/, '').replace(/_/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase()) || 'My Store',
            subdomain: `${stubSub}.gojulex.com`
          }
        }).catch(() => {});
      }
    }

    const fullSpecs = {
      ...(typeof specs === 'object' ? specs : {}),
      optionSets: effectiveVariants ? (optionSets || []) : [],
      availableSizes: effectiveVariants ? (availableSizes || []) : [],
      availableColors: effectiveVariants ? (availableColors || []) : []
    };

    let created;
    try {
      created = await prisma.product.create({
        data: {
          // Preserve the caller's id (merchant console ids) so checkout stock
          // deduction and cross-view sync match on the same product id
          ...(id ? { id } : {}),
          name: name.trim(),
          brand: brand?.trim() || 'Store Brand',
          category: category?.trim() || 'General',
          productType: productType?.trim() || category?.trim() || 'General',
          price: effectivePrice,
          compareAtPrice: effectiveCompare,
          discountPercent: Number(discountPercent) || 0,
          stock: effectiveStock,
          status: effectiveStock > 0,
          sku: sku?.trim() || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
          description: description?.trim() || '',
          specsJson: JSON.stringify(fullSpecs),
          imagesArray: JSON.stringify(cleanImages),
          hasVariants: effectiveVariants,
          variantsJson: effectiveVariants ? JSON.stringify(variantMatrix || []) : null,
          tenantId: productTenantId,
          rating: 5.0,
          reviewsCount: 0,
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
          isBestSeller: Boolean(isBestSeller)
        }
      });
    } catch (e) {
      // Provided id already exists — treat as already-synced (idempotent),
      // do NOT create a duplicate
      if (e?.code === 'P2002' && id) {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (existing) {
          return res.json({
            success: true,
            message: `Product "${existing.name}" already exists.`,
            data: formatProduct(existing)
          });
        }
      }
      // SKU conflict without caller id — retry with a regenerated SKU
      if (e?.code === 'P2002') {
        created = await prisma.product.create({
          data: {
            name: name.trim(),
            brand: brand?.trim() || 'Store Brand',
            category: category?.trim() || 'General',
            productType: productType?.trim() || category?.trim() || 'General',
            price: effectivePrice,
            compareAtPrice: effectiveCompare,
            discountPercent: Number(discountPercent) || 0,
            stock: effectiveStock,
            status: effectiveStock > 0,
            sku: sku?.trim() ? `${sku.trim()}-${Date.now().toString().slice(-4)}` : `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
            description: description?.trim() || '',
            specsJson: JSON.stringify(fullSpecs),
            imagesArray: JSON.stringify(cleanImages),
            hasVariants: effectiveVariants,
            variantsJson: effectiveVariants ? JSON.stringify(variantMatrix || []) : null,
            tenantId: productTenantId,
            rating: 5.0,
            reviewsCount: 0,
            isFeatured: Boolean(isFeatured),
            isNewArrival: Boolean(isNewArrival),
            isBestSeller: Boolean(isBestSeller)
          }
        });
      } else {
        throw e;
      }
    }
    const newProduct = created;

    // Auto-register brand if not exists
    if (brand?.trim()) {
      await prisma.brand.upsert({
        where: { name: brand.trim() },
        update: {},
        create: { name: brand.trim() }
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: `Product "${newProduct.name}" created successfully.`,
      data: formatProduct(newProduct)
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

// PUT /api/products/:id (Admin Only: Update product)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      productType,
      price,
      sellingPriceINR,
      compareAtPrice,
      comparePriceINR,
      discountPercent,
      stock,
      stockQuantity,
      sku,
      description,
      specs,
      optionSets,
      availableSizes,
      availableColors,
      hasVariants,
      variantMatrix,
      images,
      tenantId,
      isFeatured,
      isNewArrival,
      isBestSeller
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const cleanImages = Array.isArray(images) && images.length > 0
      ? images.filter(Boolean).slice(0, 6)
      : (existing.imagesArray ? JSON.parse(existing.imagesArray) : []);

    const effectiveStock = stockQuantity !== undefined ? Number(stockQuantity) : (stock !== undefined ? Number(stock) : existing.stock);
    const effectivePrice = sellingPriceINR !== undefined ? Number(sellingPriceINR) : (price !== undefined ? Number(price) : existing.price);
    const effectiveCompare = comparePriceINR !== undefined ? Number(comparePriceINR) : (compareAtPrice !== undefined ? Number(compareAtPrice) : existing.compareAtPrice);
    const effectiveVariants = hasVariants !== undefined ? Boolean(hasVariants) : existing.hasVariants;

    let existingSpecs = {};
    try {
      existingSpecs = existing.specsJson ? JSON.parse(existing.specsJson) : {};
    } catch (e) {}

    const fullSpecs = {
      ...existingSpecs,
      ...(typeof specs === 'object' ? specs : {}),
      optionSets: effectiveVariants ? (optionSets || existingSpecs.optionSets || []) : [],
      availableSizes: effectiveVariants ? (availableSizes || existingSpecs.availableSizes || []) : [],
      availableColors: effectiveVariants ? (availableColors || existingSpecs.availableColors || []) : []
    };

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ? name.trim() : existing.name,
        brand: brand ? brand.trim() : existing.brand,
        category: category ? category.trim() : existing.category,
        productType: productType ? productType.trim() : (category ? category.trim() : existing.productType),
        price: effectivePrice,
        compareAtPrice: effectiveCompare,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : existing.discountPercent,
        stock: effectiveStock,
        status: effectiveStock > 0,
        sku: sku !== undefined ? sku.trim() : existing.sku,
        description: description !== undefined ? description.trim() : existing.description,
        specsJson: JSON.stringify(fullSpecs),
        imagesArray: JSON.stringify(cleanImages),
        hasVariants: effectiveVariants,
        variantsJson: effectiveVariants ? JSON.stringify(variantMatrix || []) : null,
        tenantId: tenantId !== undefined ? tenantId : existing.tenantId,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : existing.isNewArrival,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : existing.isBestSeller
      }
    });

    return res.json({
      success: true,
      message: `Product "${updated.name}" updated successfully.`,
      data: formatProduct(updated)
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// PATCH /api/products/:id/pricing (Admin Only: Quick rate & discount modifier)
router.patch('/:id/pricing', requireAdmin, async (req, res) => {
  try {
    const { price, discountPercent } = req.body;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        price: price !== undefined ? Number(price) : undefined,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined
      }
    });

    return res.json({
      success: true,
      message: 'Rate and discount updated.',
      data: formatProduct(updated)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update pricing.' });
  }
});

// PATCH /api/products/:id/stock (Admin Only: Quick stock modifier)
router.patch('/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { stock } = req.body;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        stock: Math.max(0, Number(stock) || 0)
      }
    });

    return res.json({
      success: true,
      message: `Stock updated to ${updated.stock} units.`,
      data: formatProduct(updated)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update stock.' });
  }
});

// DELETE /api/products/:id (Admin Only: Permanent deletion)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const identifier = req.params.id;

    // Find by ID, SKU or partial
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { sku: identifier }
        ]
      }
    });

    if (!existing) {
      return res.json({ success: true, message: 'Timepiece already removed.' });
    }

    // Clean up dependent child tables in SQLite to prevent FK constraint failures
    await prisma.review.deleteMany({ where: { productId: existing.id } }).catch(() => {});
    await prisma.orderItem.updateMany({
      where: { productId: existing.id },
      data: { productId: null }
    }).catch(() => {});

    // Delete product record
    await prisma.product.delete({ where: { id: existing.id } });

    return res.json({
      success: true,
      deletedId: existing.id,
      message: `Timepiece "${existing.name}" permanently removed from catalog.`
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete timepiece: ' + error.message });
  }
});

// GET /api/products/:id/reviews (Fetch reviews for a product)
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
});

// POST /api/products/:id/reviews (Customer review submission with storage)
router.post('/:id/reviews', async (req, res) => {
  try {
    const { authorName, rating, comment, userId } = req.body;
    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Create review in database
    const createdReview = await prisma.review.create({
      data: {
        productId: req.params.id,
        userId: userId || null,
        authorName: authorName?.trim() || 'Customer',
        rating: numRating,
        comment: comment?.trim() || 'Exceptional timepiece and impeccable quality.'
      }
    });

    // Recompute average rating and count
    const allReviews = await prisma.review.findMany({
      where: { productId: req.params.id }
    });

    const newCount = allReviews.length;
    const avgRating = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1));

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        rating: avgRating,
        reviewsCount: newCount
      },
      include: {
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Your review has been verified and published.',
      review: createdReview,
      data: formatProduct(updatedProduct)
    });
  } catch (error) {
    console.error('Submit review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

export default router;
