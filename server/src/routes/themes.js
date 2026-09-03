import { Router } from 'express';
import { prisma } from '../db.js';
import { requireSuperAdmin, requireMerchantAdmin } from '../middleware/auth.js';

const router = Router();

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
