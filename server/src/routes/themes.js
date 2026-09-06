import { Router } from 'express';
import { prisma } from '../db.js';
import { requireSuperAdmin, requireMerchantAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * PUT /api/themes/config — Merchant: persist the full published theme config
 * (preset, styles, sections, inline edits) on the tenant so EVERY visitor
 * sees the store as designed, not just the merchant's browser.
 */
router.put('/config', requireMerchantAdmin, async (req, res) => {
  try {
    const { config, subdomain } = req.body;
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ success: false, message: 'Missing theme config payload.' });
    }

    // Resolve the tenant the config belongs to. Priority: impersonation scope,
    // then the store subdomain being customized (super admin switching stores),
    // then the logged-in merchant's own tenant.
    const norm = (v) => String(v || '').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');
    let tenantId = req.impersonatedTenantId || null;

    if (!tenantId && subdomain) {
      const clean = norm(subdomain);
      const all = await prisma.tenant.findMany();
      const match = all.find((t) => norm(t.subdomain) === clean || norm(t.id) === clean);
      if (!match) {
        return res.status(404).json({ success: false, message: `No store found for subdomain "${clean}".` });
      }
      const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
      if (!isSuperAdmin && match.id !== req.user.tenantId) {
        return res.status(403).json({ success: false, message: 'You can only publish themes to your own store.' });
      }
      tenantId = match.id;
    }

    if (!tenantId) tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'No store selected. Switch to a store first.' });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { themeConfig: JSON.stringify(config) }
    });
    return res.json({
      success: true,
      message: 'Theme config published.',
      data: { tenantId: updated.id, subdomain: updated.subdomain }
    });
  } catch (error) {
    console.error('Save theme config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save theme config.' });
  }
});

/**
 * GET /api/themes/public/:subdomain — public: the published theme config
 * for a store (used by the storefront for every visitor).
 */
router.get('/public/:subdomain', async (req, res) => {
  try {
    const clean = String(req.params.subdomain || '').toLowerCase().replace(/\.gojulex\.com$/, '');
    const all = await prisma.tenant.findMany();
    const norm = (v) => String(v || '').toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');
    const matches = all.filter((t) => norm(t.subdomain) === clean || norm(t.id) === clean);
    const tenant = matches.find((t) => t.themeConfig) || matches[0] || null;
    if (!tenant || !tenant.themeConfig) {
      return res.json({ success: true, data: null });
    }
    return res.json({ success: true, data: JSON.parse(tenant.themeConfig) });
  } catch (error) {
    console.error('Fetch public theme config error:', error);
    return res.json({ success: true, data: null });
  }
});

/**
 * GET /api/themes — public: all theme catalog overrides (edits + deletions).
 * Both the merchant gallery and the super admin portal read from here so
 * template customizations are consistent everywhere.
 */
router.get('/', async (req, res) => {
  try {
    const overrides = await prisma.themeCatalogOverride.findMany();
    return res.json({ success: true, data: overrides });
  } catch (error) {
    console.error('Fetch theme overrides error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load theme catalog overrides.' });
  }
});

/**
 * PUT /api/themes/:id — Super Admin: create/update a template override
 */
router.put('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tagline, vertical, accentColor, backgroundColor, headingFont, deleted } = req.body;

    const data = {
      ...(name !== undefined ? { name } : {}),
      ...(tagline !== undefined ? { tagline } : {}),
      ...(vertical !== undefined ? { vertical } : {}),
      ...(accentColor !== undefined ? { accentColor } : {}),
      ...(backgroundColor !== undefined ? { backgroundColor } : {}),
      ...(headingFont !== undefined ? { headingFont } : {}),
      ...(deleted !== undefined ? { deleted } : {})
    };

    const override = await prisma.themeCatalogOverride.upsert({
      where: { id },
      update: data,
      create: { id, ...data }
    });

    return res.json({ success: true, message: 'Template updated.', data: override });
  } catch (error) {
    console.error('Update theme override error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update template.' });
  }
});

/**
 * DELETE /api/themes/:id — Super Admin: mark template deleted from the catalog
 */
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.themeCatalogOverride.upsert({
      where: { id },
      update: { deleted: true },
      create: { id, deleted: true }
    });
    return res.json({ success: true, message: 'Template deleted from the catalog.' });
  } catch (error) {
    console.error('Delete theme override error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete template.' });
  }
});

/**
 * POST /api/themes/reset — Super Admin: restore catalog defaults (clear all overrides)
 */
router.post('/reset', requireSuperAdmin, async (req, res) => {
  try {
    await prisma.themeCatalogOverride.deleteMany();
    return res.json({ success: true, message: 'Master catalog restored to defaults.' });
  } catch (error) {
    console.error('Reset theme overrides error:', error);
    return res.status(500).json({ success: false, message: 'Failed to restore defaults.' });
  }
});

/**
 * POST /api/themes/assign — merchant applies a theme to their store.
 * Records the real store->theme mapping (used by the super-admin portal).
 */
router.post('/assign', requireMerchantAdmin, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.body.tenantId;
    const { themeId } = req.body;
    if (!tenantId || !themeId) {
      return res.status(400).json({ success: false, message: 'tenantId and themeId are required.' });
    }
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { activeThemeId: themeId }
    });
    return res.json({ success: true, message: 'Theme assigned to store.' });
  } catch (error) {
    console.error('Assign theme error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign theme.' });
  }
});

export default router;
