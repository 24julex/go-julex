import { Router } from 'express';
import { prisma } from '../db.js';
import { requireMerchantAdmin } from '../middleware/auth.js';
import { makeSlug, validateSlug, uniqueSlug, normSub } from '../utils/slug.js';

const router = Router();

const slugFromRequest = (v) => makeSlug(v);

// GET /api/domains/check?name=... (or ?slug=...)
// Availability preview for the Domains page — validated AND checked in the DB.
router.get('/check', requireMerchantAdmin, async (req, res) => {
  try {
    const desired = slugFromRequest(req.query.slug || req.query.name || '');
    if (!desired) return res.json({ success: true, available: false, slug: '', message: 'Enter a store name.' });
    const err = validateSlug(desired);
    if (err) return res.json({ success: true, available: false, slug: desired, message: err });
    const r = await uniqueSlug(prisma, desired, { excludeTenantId: req.tenantId });
    if (r.error) return res.json({ success: true, available: false, slug: desired, message: r.error });
    const exact = r.slug === desired;
    return res.json({
      success: true,
      available: exact,
      slug: r.slug,
      subdomain: `${r.slug}.go.julex.shop`,
      message: exact ? `"${r.slug}.go.julex.shop" is available.` : `"${desired}.go.julex.shop" is taken — "${r.slug}.go.julex.shop" is free.`
    });
  } catch (error) {
    console.error('Domain check error:', error);
    return res.status(500).json({ success: false, message: 'Could not check availability.' });
  }
});

// PUT /api/domains/subdomain  { name }
// Store name -> slug -> uniqueness -> {slug}.go.julex.shop saved on the tenant.
// The previous hostname is kept as an alias so old links keep resolving.
router.put('/subdomain', requireMerchantAdmin, async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ success: false, message: 'No store is selected. Switch to your store first.' });
    }
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Store name is required.' });

    const desired = makeSlug(name);
    const err = validateSlug(desired);
    if (err) return res.status(400).json({ success: false, message: err });

    const r = await uniqueSlug(prisma, desired, { excludeTenantId: req.tenantId });
    if (r.error) return res.status(409).json({ success: false, message: r.error });

    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Store not found.' });

    const oldHost = normSub(tenant.subdomain) === r.slug ? null : tenant.subdomain;
    const aliases = (() => {
      try { return tenant.subdomainAliases ? JSON.parse(tenant.subdomainAliases) : []; } catch (e) { return []; }
    })();
    const newSubdomain = `${r.slug}.go.julex.shop`;
    if (oldHost && !aliases.includes(oldHost)) aliases.push(oldHost);

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name,
        subdomain: newSubdomain,
        subdomainAliases: aliases.length > 0 ? JSON.stringify(aliases) : null
      }
    });

    return res.json({
      success: true,
      message: `Store identity saved — your Go Julex subdomain is ${newSubdomain}`,
      data: {
        name: updated.name,
        slug: r.slug,
        subdomain: newSubdomain,
        aliases,
        url: `https://${newSubdomain}`
      }
    });
  } catch (error) {
    console.error('Set subdomain error:', error);
    return res.status(500).json({ success: false, message: 'Could not save the store identity.' });
  }
});

export default router;
