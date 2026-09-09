import { Router } from 'express';
import { prisma } from '../db.js';
import { requireMerchantAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { computePublishAuth, PaymentService } from './plans.js';

const router = Router();

const normSub = (v) => String(v || '').toLowerCase()
  .replace(/\.go\.julex\.shop$/, '').replace(/\.gojulex\.com$/, '').replace(/^store_/, '');

const findTenantBySub = async (sub) => {
  const clean = normSub(sub);
  const all = await prisma.tenant.findMany();
  return all.find((t) => normSub(t.subdomain) === clean || normSub(t.id) === clean) || null;
};

// GET /api/store/status — merchant: the real store + subscription state
router.get('/status', requireMerchantAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, message: 'No store selected.' });
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Store not found.' });
    const auth = await computePublishAuth(tenant);
    return res.json({
      success: true,
      data: {
        storeStatus: tenant.status,
        name: tenant.name,
        subdomain: tenant.subdomain,
        logoUrl: tenant.logoUrl,
        profileImageUrl: tenant.profileImageUrl,
        whatsappNumber: tenant.whatsappNumber,
        instagramHandle: tenant.instagramHandle,
        ...auth
      }
    });
  } catch (error) {
    console.error('Store status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load store status.' });
  }
});

// PUT /api/store/profile — merchant: persist store identity fields
router.put('/profile', requireMerchantAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, message: 'No store selected.' });
    const { name, logoUrl, profileImageUrl, whatsappNumber, instagramHandle, ownerPhone, category } = req.body || {};
    const data = {};
    if (typeof name === 'string' && name.trim()) data.name = name.trim();
    if (logoUrl !== undefined) data.logoUrl = logoUrl || null;
    if (profileImageUrl !== undefined) data.profileImageUrl = profileImageUrl || null;
    if (whatsappNumber !== undefined) data.whatsappNumber = (whatsappNumber || '').trim() || null;
    if (instagramHandle !== undefined) data.instagramHandle = (instagramHandle || '').trim() || null;
    if (ownerPhone !== undefined) data.ownerPhone = (ownerPhone || '').trim() || null;
    if (typeof category === 'string' && category.trim()) data.category = category.trim();
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update.' });
    }
    const updated = await prisma.tenant.update({ where: { id: tenantId }, data });
    return res.json({
      success: true,
      message: 'Store profile saved.',
      data: { name: updated.name, logoUrl: updated.logoUrl, profileImageUrl: updated.profileImageUrl, whatsappNumber: updated.whatsappNumber, instagramHandle: updated.instagramHandle, ownerPhone: updated.ownerPhone, category: updated.category }
    });
  } catch (error) {
    console.error('Store profile error:', error);
    return res.status(500).json({ success: false, message: 'Could not save store profile.' });
  }
});

// GET /api/store/public-status/:subdomain — public: is this store published?
// Backend-enforced gate used by the storefront (§19) — the UI cannot bypass it.
router.get('/public-status/:subdomain', async (req, res) => {
  try {
    const tenant = await findTenantBySub(req.params.subdomain);
    if (!tenant) return res.json({ success: true, data: { exists: false, published: false } });
    const published = ['ACTIVE', 'PUBLISHED'].includes(String(tenant.status || '').toUpperCase());
    return res.json({ success: true, data: { exists: true, published, name: tenant.name } });
  } catch (error) {
    return res.json({ success: true, data: { exists: false, published: false } });
  }
});

// POST /api/store/publish — merchant: publish the store (backend-enforced).
// Rejects with 402 unless the store is authorised (legacy live or ACTIVE
// subscription on a plan that allows publishing).
router.post('/publish', requireMerchantAdmin, async (req, res) => {
  try {
    const tenantId = req.impersonatedTenantId || req.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, message: 'No store selected.' });
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Store not found.' });
    const auth = await computePublishAuth(tenant);
    if (!auth.canPublish) {
      return res.status(402).json({
        success: false,
        paymentRequired: true,
        code: auth.reason,
        message: 'Payment required: choose and activate a Go Julex plan to publish your store.',
        data: { storeStatus: tenant.status, subscription: auth.subscription }
      });
    }
    const updated = await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'PUBLISHED' } });
    return res.json({ success: true, message: 'Store published.', data: { status: updated.status, subdomain: updated.subdomain } });
  } catch (error) {
    console.error('Store publish error:', error);
    return res.status(500).json({ success: false, message: 'Could not publish store.' });
  }
});

// POST /api/store/super-admin/activate — Super Admin: manually record a plan
// activation (real human authorisation while the gateway is not configured;
// every activation is attributed and logged — never done automatically).
router.post('/super-admin/activate', requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId, planId, months } = req.body || {};
    if (!tenantId || !planId) return res.status(400).json({ success: false, message: 'tenantId and planId are required.' });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    await PaymentService.verifyAndActivate({
      tenantId,
      paymentProvider: 'SUPER_ADMIN',
      paymentRef: `manual:${req.user?.email || 'super-admin'}:${Date.now()}`,
      months: months || (plan.billingPeriod === 'ONE_YEAR' ? 12 : plan.billingPeriod === 'TWO_YEAR' ? 24 : 6)
    });
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'PUBLISHED', planTier: plan.billingPeriod } });
    return res.json({ success: true, message: `Plan ${plan.name} activated and store published.` });
  } catch (error) {
    console.error('Super admin activate error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Activation failed.' });
  }
});


// POST /api/store/super-admin/restrict — Super Admin: restrict an unpaid
// store from going live (after the 3-day grace period). Status → SUSPENDED.
router.post('/super-admin/restrict', requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId, reason } = req.body || {};
    if (!tenantId) return res.status(400).json({ success: false, message: 'tenantId required.' });
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Store not found.' });
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'SUSPENDED' }
    });
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorEmail: req.user?.email || 'super-admin',
        action: 'STORE_RESTRICTED',
        entityType: 'TENANT',
        entityId: tenantId,
        detailsJson: JSON.stringify({ reason: reason || 'Billing overdue', restrictedBy: req.user?.email, at: new Date().toISOString() })
      }
    }).catch(() => {});
    return res.json({ success: true, message: `Store "${tenant.name}" restricted from publishing (billing overdue).` });
  } catch (error) {
    console.error('Restrict store error:', error);
    return res.status(500).json({ success: false, message: 'Could not restrict store.' });
  }
});

// POST /api/store/super-admin/restore — Super Admin: restore a restricted store
router.post('/super-admin/restore', requireSuperAdmin, async (req, res) => {
  try {
    const { tenantId } = req.body || {};
    if (!tenantId) return res.status(400).json({ success: false, message: 'tenantId required.' });
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Store not found.' });
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'PUBLISHED' } });
    return res.json({ success: true, message: `Store "${tenant.name}" restored.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not restore store.' });
  }
});

export default router;
