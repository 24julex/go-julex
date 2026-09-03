// One-way sync: pushes the storefront mock products for the four demo stores
// into the database so the merchant dashboard, super-admin metrics and the
// storefronts all read the same catalog (and stock deduction works).
// Usage: node src/sync-store-products.js
import { prisma } from './db.js';

const STORE_KEYS = ['store_luxestudio', 'store_abisjewel', 'store_bookstore', 'store_ramstshirt'];

const toDbProduct = (p, tenantId) => ({
  id: p.id,
  tenantId,
  name: p.name,
  brand: p.brand || tenantId.replace('store_', ''),
  category: p.category || 'General',
  productType: p.productType || null,
  price: Number(p.sellingPriceINR || p.price || 0),
  compareAtPrice: Number(p.comparePriceINR || p.compareAtPrice || 0) || null,
  discountPercent: Number(p.discountPercent || 0),
  stock: Number(p.stockQuantity ?? p.stock ?? 0),
  sku: p.sku || `${p.id}_sku`,
  description: p.description || '',
  specsJson: JSON.stringify(p.specs || p.optionSets || {}),
  imagesArray: JSON.stringify(p.images || (p.imageUrl ? [p.imageUrl] : [])),
  hasVariants: Boolean(p.hasVariants),
  isFeatured: Boolean(p.isFeatured),
  isNewArrival: Boolean(p.isNewArrival),
  isBestSeller: Boolean(p.isBestSeller),
  status: (p.status ?? true) !== false && p.status !== 'No'
});

const main = async () => {
  // The mock catalog lives in the frontend source tree — unavailable inside the
  // server Docker image; skip silently in that case.
  let INITIAL_PRODUCTS_BY_STORE = {};
  try {
    const mod = await import('../../src/data/multiVerticalMockData.js');
    INITIAL_PRODUCTS_BY_STORE = mod.INITIAL_PRODUCTS_BY_STORE || {};
  } catch (e) {
    console.log('ℹ️ Frontend mock catalog unavailable (container build) — skipping store product sync.');
    await prisma.$disconnect();
    return;
  }

  console.log('🔄 Syncing storefront catalogs to database...');
  let count = 0;
  for (const storeKey of STORE_KEYS) {
    const products = INITIAL_PRODUCTS_BY_STORE[storeKey] || [];
    for (const p of products) {
      if (!p?.id || !p?.name) continue;
      const data = toDbProduct(p, storeKey);
      await prisma.product.upsert({
        where: { id: p.id },
        update: data,
        create: data
      });
      count++;
    }
    console.log(`✅ ${storeKey}: ${products.length} product(s) synced`);
  }
  console.log(`🎉 Done — ${count} products upserted.`);
  await prisma.$disconnect();
};

main().catch(async (err) => {
  console.error('Sync failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
