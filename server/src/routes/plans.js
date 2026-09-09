import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireMerchantAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

const planToApi = (p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  priceINR: p.priceInr,
  billingPeriod: p.billingPeriod,
  productLimit: p.productLimit,
  storageLimitMb: p.storageLimitMb,
  customDomain: p.customDomain,
  features: (() => { try { return JSON.parse(p.featuresJson || '[]'); } catch (e) { return []; } })(),
  badge: p.badge,
  isPopular: p.isPopular,
  allowsPublish: p.allowsPublish,
  sortOrder: p.sortOrder
});

// ----------------------------------------------------
// Compute publish authorisation for a tenant.
// Grandfather rule: stores that were already live (status ACTIVE/PUBLISHED)
// stay publishable. New DRAFT stores need an ACTIVE subscription on a plan
// that allows publishing. ACTIVE can ONLY come from a real payment provider
// (future gateway) or an explicit Super Admin activation — never the frontend.
// ----------------------------------------------------
export const computePublishAuth = async (tenant) => {
  const suspended = String(tenant.status || '').toUpperCase() === 'SUSPENDED';
  const legacyLive = !suspended && ['ACTIVE', 'PUBLISHED'].includes(String(tenant.status || '').toUpperCase());
  const sub = await prisma.subscription.findUnique({
    where: { tenantId: tenant.id },
    include: { plan: true }
  });
  const subActive = sub?.status === 'ACTIVE' && (!sub.expiresAt || new Date(sub.expiresAt) > new Date());
  const planAllows = subActive ? (sub.plan?.allowsPublish !== false) : false;
  return {
    legacyLive,
    subscription: sub ? {
      status: sub.status,
      plan: sub.plan ? planToApi(sub.plan) : null,
      selectedAt: sub.selectedAt,
      activatedAt: sub.activatedAt,
      expiresAt: sub.expiresAt
    } : null,
    canPublish: legacyLive || planAllows,
    reason: legacyLive ? 'LEGACY_LIVE' : (subActive ? 'SUBSCRIPTION_ACTIVE' : (sub ? 'PLAN_NOT_ACTIVE' : 'NO_PLAN'))
  };
};

// GET /api/plans — public: the real plan catalogue from the database
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return res.json({ success: true, data: plans.map(planToApi) });
  } catch (error) {
    console.error('List plans error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load plans.' });
  }
});

// GET /api/plans/subscription/me — merchant: my subscription + authorisation state
router.get('/subscription/me', requireMerchantAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, message: 'No store selected.' });
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Store not found.' });
    const auth = await computePublishAuth(tenant);
    return res.json({ success: true, data: { storeStatus: tenant.status, ...auth } });
  } catch (error) {
    console.error('Subscription me error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load subscription.' });
  }
});

// POST /api/plans/select — merchant: record plan choice. This is ONLY a
// selection — it never activates anything and never publishes anything.
router.post('/select', requireMerchantAdmin, async (req, res) => {
  try {
    const { planId } = req.body || {};
    if (!planId) return res.status(400).json({ success: false, message: 'Plan is required.' });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) return res.status(404).json({ success: false, message: 'Plan not found.' });
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, message: 'No store selected.' });

    const existing = await prisma.subscription.findUnique({ where: { tenantId } });
    // An ACTIVE subscription is never downgraded by a mere selection
    if (existing?.status === 'ACTIVE') {
      return res.json({ success: true, message: 'You already have an active plan.', data: { status: existing.status } });
    }
    const sub = await prisma.subscription.upsert({
      where: { tenantId },
      create: { tenantId, planId, status: 'PLAN_SELECTED', selectedAt: new Date() },
      update: { planId, status: 'PLAN_SELECTED', selectedAt: new Date() }
    });
    return res.json({
      success: true,
      message: 'Plan selected. Payment is required to activate publishing.',
      data: { status: sub.status, plan: planToApi(plan), paymentRequired: true }
    });
  } catch (error) {
    console.error('Select plan error:', error);
    return res.status(500).json({ success: false, message: 'Could not select plan.' });
  }
});

// POST /api/plans/payment-pending — merchant: acknowledge the checkout state.
// The real gateway is not configured yet, so this endpoint records ONLY the
// honest PAYMENT_PENDING state. It never fakes success.
router.post('/payment-pending', requireMerchantAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const sub = await prisma.subscription.findUnique({ where: { tenantId } });
    if (!sub) return res.status(400).json({ success: false, message: 'Select a plan first.' });
    if (sub.status === 'ACTIVE') {
      return res.json({ success: true, message: 'Plan already active.', data: { status: sub.status } });
    }
    await prisma.subscription.update({ where: { tenantId }, data: { status: 'PAYMENT_PENDING' } });
    return res.json({
      success: true,
      message: 'Payment gateway is currently being configured. Your store setup is saved — publishing unlocks once payment processing is enabled.',
      data: { status: 'PAYMENT_PENDING', gatewayConfigured: false }
    });
  } catch (error) {
    console.error('Payment-pending error:', error);
    return res.status(500).json({ success: false, message: 'Could not update payment state.' });
  }
});

// ----------------------------------------------------
// PaymentService seam — the future real gateway (e.g. Razorpay) plugs in
// here. verifyAndActivate() must ONLY be called by a verified webhook /
// server-to-server callback from the provider, never by the browser.
// ----------------------------------------------------
export const PaymentService = {
  providerConfigured: () => Boolean(process.env.PAYMENT_PROVIDER_KEY && process.env.PAYMENT_PROVIDER_SECRET),
  async verifyAndActivate({ tenantId, paymentProvider, paymentRef, months }) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Store not found');
    const sub = await prisma.subscription.findUnique({ where: { tenantId } });
    if (!sub) throw new Error('No plan selected');
    const now = new Date();
    const expiresAt = new Date(now); expiresAt.setMonth(expiresAt.getMonth() + (months || 6));
    await prisma.subscription.update({
      where: { tenantId },
      data: {
        status: 'ACTIVE',
        activatedAt: now,
        expiresAt,
        paymentMetaJson: JSON.stringify({ paymentProvider, paymentRef, verifiedAt: now.toISOString() })
      }
    });
    return true;
  }
};


// POST /api/plans — Super Admin: create a plan
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    const { id, name, description, priceINR, billingPeriod, productLimit, customDomain, features, badge, isPopular, allowsPublish, sortOrder } = req.body || {};
    if (!id || !name) return res.status(400).json({ success: false, message: 'Plan id and name are required.' });
    if (await prisma.plan.findUnique({ where: { id } })) {
      return res.status(400).json({ success: false, message: 'A plan with this ID already exists.' });
    }
    const plan = await prisma.plan.create({
      data: {
        id, name,
        description: description || '',
        priceInr: Number(priceINR) || 0,
        billingPeriod: billingPeriod || 'SIX_MONTH',
        productLimit: productLimit ? Number(productLimit) : null,
        customDomain: Boolean(customDomain),
        featuresJson: JSON.stringify(Array.isArray(features) ? features : []),
        badge: badge || null,
        isPopular: Boolean(isPopular),
        allowsPublish: allowsPublish !== false,
        sortOrder: Number(sortOrder) || 99,
        isActive: true
      }
    });
    return res.status(201).json({ success: true, message: `Plan "${plan.name}" created.`, data: planToApi(plan) });
  } catch (error) {
    console.error('Create plan error:', error);
    return res.status(500).json({ success: false, message: 'Could not create plan.' });
  }
});

// PUT /api/plans/:id — Super Admin: update a plan
router.put('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const planId = req.params.id;
    const existing = await prisma.plan.findUnique({ where: { id: planId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Plan not found.' });
    const { name, description, priceINR, billingPeriod, productLimit, customDomain, features, badge, isPopular, allowsPublish, sortOrder, isActive } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (priceINR !== undefined) data.priceInr = Number(priceINR);
    if (billingPeriod !== undefined) data.billingPeriod = billingPeriod;
    if (productLimit !== undefined) data.productLimit = productLimit ? Number(productLimit) : null;
    if (customDomain !== undefined) data.customDomain = Boolean(customDomain);
    if (features !== undefined) data.featuresJson = JSON.stringify(Array.isArray(features) ? features : []);
    if (badge !== undefined) data.badge = badge || null;
    if (isPopular !== undefined) data.isPopular = Boolean(isPopular);
    if (allowsPublish !== undefined) data.allowsPublish = Boolean(allowsPublish);
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    const plan = await prisma.plan.update({ where: { id: planId }, data });
    return res.json({ success: true, message: `Plan "${plan.name}" updated.`, data: planToApi(plan) });
  } catch (error) {
    console.error('Update plan error:', error);
    return res.status(500).json({ success: false, message: 'Could not update plan.' });
  }
});

// DELETE /api/plans/:id — Super Admin: deactivate a plan (soft delete)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const planId = req.params.id;
    const existing = await prisma.plan.findUnique({ where: { id: planId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Plan not found.' });
    await prisma.plan.delete({ where: { id: planId } }).catch(async (e) => {
      // FK constraint (stores still subscribed) → deactivate instead
      await prisma.plan.update({ where: { id: planId }, data: { isActive: false } });
    });
    return res.json({ success: true, message: `Plan "${existing.name}" removed.` });
  } catch (error) {
    console.error('Delete plan error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete plan.' });
  }
});

export default router;
