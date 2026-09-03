import express from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireSuperAdmin, requireMerchantAdmin } from '../middleware/auth.js';

const router = express.Router();

// ====================================================
// SECTION A: SUPER ADMIN MASTER INVOICE STUDIO
// ====================================================

/**
 * GET /api/super-admin/invoices
 * Lists all master invoice templates from the master registry
 */
router.get('/super-admin/invoices', requireSuperAdmin, async (req, res) => {
  try {
    const templates = await prisma.masterInvoiceTemplate.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const parsed = templates.map((t) => ({
      ...t,
      defaultLayout: typeof t.defaultLayoutJson === 'string' ? JSON.parse(t.defaultLayoutJson) : t.defaultLayoutJson
    }));

    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Fetch master invoices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch master invoice templates.' });
  }
});

/**
 * POST /api/super-admin/invoices
 * Creates a new master invoice template in registry
 */
router.post('/super-admin/invoices', requireSuperAdmin, async (req, res) => {
  try {
    const { name, slug, description, thumbnailUrl, isPublished, tierAccess, defaultLayout } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Template name and slug are required.' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    const existing = await prisma.masterInvoiceTemplate.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return res.status(400).json({ success: false, message: `A template with slug "${cleanSlug}" already exists.` });
    }

    const layoutJson = typeof defaultLayout === 'object' ? JSON.stringify(defaultLayout) : defaultLayout || '{}';

    const created = await prisma.masterInvoiceTemplate.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description || '',
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
        isPublished: isPublished !== undefined ? isPublished : true,
        tierAccess: tierAccess || 'FREE',
        defaultLayoutJson: layoutJson,
        installedCount: 0
      }
    });

    // Record audit trail
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        actorEmail: req.user.email,
        action: 'MASTER_INVOICE_TEMPLATE_CREATED',
        entityType: 'INVOICE_TEMPLATE',
        entityId: created.id,
        detailsJson: JSON.stringify({ name: created.name, slug: created.slug }),
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.status(201).json({
      success: true,
      message: `Master Invoice Template "${created.name}" published successfully!`,
      data: {
        ...created,
        defaultLayout: JSON.parse(created.defaultLayoutJson)
      }
    });
  } catch (error) {
    console.error('Create master invoice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create master invoice template.' });
  }
});

/**
 * PUT /api/super-admin/invoices/:id
 * Updates an existing master invoice template
 */
router.put('/super-admin/invoices/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, thumbnailUrl, isPublished, tierAccess, defaultLayout } = req.body;

    const existing = await prisma.masterInvoiceTemplate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invoice template not found.' });
    }

    const updated = await prisma.masterInvoiceTemplate.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        description: description !== undefined ? description : existing.description,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existing.thumbnailUrl,
        isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
        tierAccess: tierAccess !== undefined ? tierAccess : existing.tierAccess,
        defaultLayoutJson: defaultLayout ? JSON.stringify(defaultLayout) : existing.defaultLayoutJson
      }
    });

    return res.json({
      success: true,
      message: `Invoice template "${updated.name}" updated.`,
      data: {
        ...updated,
        defaultLayout: JSON.parse(updated.defaultLayoutJson)
      }
    });
  } catch (error) {
    console.error('Update master invoice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update invoice template.' });
  }
});

/**
 * DELETE /api/super-admin/invoices/:id
 * Removes a master invoice template
 */
router.delete('/super-admin/invoices/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.masterInvoiceTemplate.delete({ where: { id } });
    return res.json({ success: true, message: 'Master invoice template deleted.' });
  } catch (error) {
    console.error('Delete template error:', error);
    return res.status(500).json({ success: false, message: 'Cannot delete template actively in use.' });
  }
});

// ====================================================
// SECTION B: MERCHANT TENANT INVOICE CUSTOMIZATION
// ====================================================

/**
 * GET /api/merchant/invoice-config
 * Returns active invoice template and merchant customization settings for current store
 */
router.get('/merchant/invoice-config', requireMerchantAdmin, async (req, res) => {
  try {
    // Super admins have no tenant of their own — allow targeting the store
    // they are currently administering in the console
    const tenantId = req.tenantId || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'No store selected.' });
    }

    let config = await prisma.tenantInvoiceConfig.findUnique({
      where: { tenantId },
      include: { template: true, tenant: true }
    });

    // Fallback if not created yet
    if (!config) {
      const defaultTemplate = await prisma.masterInvoiceTemplate.findFirst({
        where: { isPublished: true }
      });

      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

      config = await prisma.tenantInvoiceConfig.create({
        data: {
          tenantId,
          templateId: defaultTemplate ? defaultTemplate.id : 'tpl_classic_tax_a4',
          storeGstin: '27AAACA1234A1Z5',
          storeLegalName: tenant ? `${tenant.name} Pvt Ltd` : 'Go Julex Store',
          storeTradeName: tenant ? tenant.name : 'Store Name',
          storeAddress: tenant && tenant.city ? `${tenant.city}, ${tenant.state || 'India'}` : 'Mumbai, Maharashtra',
          storePhone: '+91 98201 54321',
          storeEmail: 'orders@store.gojulex.com',
          customStylesJson: JSON.stringify({
            fontFamily: 'Inter',
            fontSize: 12,
            primaryColor: '#2563EB',
            secondaryColor: '#0F172A',
            showTaxBreakdown: true,
            showQrCode: true,
            terms: 'Goods once sold can be exchanged within 7 days. Computer-generated tax invoice.'
          })
        },
        include: { template: true, tenant: true }
      });
    }

    const allPublishedTemplates = await prisma.masterInvoiceTemplate.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' }
    });

    return res.json({
      success: true,
      data: {
        config: {
          ...config,
          customStyles: typeof config.customStylesJson === 'string' ? JSON.parse(config.customStylesJson) : config.customStylesJson,
          template: config.template
            ? {
                ...config.template,
                defaultLayout: typeof config.template.defaultLayoutJson === 'string' ? JSON.parse(config.template.defaultLayoutJson) : config.template.defaultLayoutJson
              }
            : null
        },
        availableTemplates: allPublishedTemplates.map((t) => ({
          ...t,
          defaultLayout: typeof t.defaultLayoutJson === 'string' ? JSON.parse(t.defaultLayoutJson) : t.defaultLayoutJson
        }))
      }
    });
  } catch (error) {
    console.error('Fetch merchant invoice config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load merchant invoice configuration.' });
  }
});

/**
 * PUT /api/merchant/invoice-config
 * Updates merchant's invoice customization parameters
 */
router.put('/merchant/invoice-config', requireMerchantAdmin, async (req, res) => {
  try {
    // Prefer the authenticated merchant's own tenant; super admins may
    // target the store they are administering via body.tenantId
    const tenantId = req.tenantId || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'No store selected.' });
    }
    const {
      templateId,
      storeGstin,
      storeLegalName,
      storeTradeName,
      storeAddress,
      storePhone,
      storeEmail,
      authorizedSignatoryUrl,
      customStyles
    } = req.body;

    const stylesJson = typeof customStyles === 'object' ? JSON.stringify(customStyles) : customStyles || '{}';

    const updated = await prisma.tenantInvoiceConfig.upsert({
      where: { tenantId },
      update: {
        templateId: templateId || undefined,
        storeGstin: storeGstin !== undefined ? storeGstin : undefined,
        storeLegalName: storeLegalName || undefined,
        storeTradeName: storeTradeName !== undefined ? storeTradeName : undefined,
        storeAddress: storeAddress !== undefined ? storeAddress : undefined,
        storePhone: storePhone !== undefined ? storePhone : undefined,
        storeEmail: storeEmail !== undefined ? storeEmail : undefined,
        authorizedSignatoryUrl: authorizedSignatoryUrl !== undefined ? authorizedSignatoryUrl : undefined,
        customStylesJson: stylesJson
      },
      create: {
        tenantId,
        templateId: templateId || 'tpl_classic_tax_a4',
        storeGstin: storeGstin || '',
        storeLegalName: storeLegalName || 'Store Legal Entity',
        storeTradeName: storeTradeName || '',
        storeAddress: storeAddress || '',
        storePhone: storePhone || '',
        storeEmail: storeEmail || '',
        authorizedSignatoryUrl: authorizedSignatoryUrl || null,
        customStylesJson: stylesJson
      },
      include: { template: true }
    });

    if (templateId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { activeInvoiceTemplateId: templateId }
      });
      // Increment install counter
      await prisma.masterInvoiceTemplate.update({
        where: { id: templateId },
        data: { installedCount: { increment: 1 } }
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'Invoice styling and legal configurations saved successfully!',
      data: {
        ...updated,
        customStyles: JSON.parse(updated.customStylesJson)
      }
    });
  } catch (error) {
    console.error('Update invoice config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update invoice configuration.' });
  }
});

/**
 * GET /api/invoices/store-config/:tenantId
 * Public endpoint: returns a store's active invoice template + customization.
 * Used by the customer checkout invoice preview (no merchant auth available there).
 */
router.get('/invoices/store-config/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;

    let config = await prisma.tenantInvoiceConfig.findUnique({
      where: { tenantId },
      include: { template: true }
    });

    // Fallback: resolve the tenant by subdomain (checkout passes either
    // the tenant id, e.g. "store_ramstshirt", or a bare subdomain, e.g. "ramstshirt")
    if (!config) {
      const cleanSub = String(tenantId).toLowerCase().replace(/\.gojulex\.com$/, '').replace(/^store_/, '');
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { subdomain: `${cleanSub}.gojulex.com` },
            { subdomain: cleanSub },
            { id: cleanSub },
            { id: `store_${cleanSub}` }
          ]
        }
      });
      if (tenant) {
        config = await prisma.tenantInvoiceConfig.findUnique({
          where: { tenantId: tenant.id },
          include: { template: true }
        });
      }
    }

    if (!config) {
      return res.json({ success: true, data: { config: null } });
    }

    return res.json({
      success: true,
      data: {
        config: {
          ...config,
          customStyles: typeof config.customStylesJson === 'string' ? JSON.parse(config.customStylesJson) : config.customStylesJson,
          template: config.template
            ? {
                ...config.template,
                defaultLayout: typeof config.template.defaultLayoutJson === 'string' ? JSON.parse(config.template.defaultLayoutJson) : config.template.defaultLayoutJson
              }
            : null
        }
      }
    });
  } catch (error) {
    console.error('Fetch store invoice config error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load store invoice configuration.' });
  }
});

/**
 * GET /api/merchant/invoices/render/:orderId
 * Generates an invoice data model populated with dynamic calculations for printing/download
 */
router.get('/merchant/invoices/render/:orderId', requireMerchantAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const tenantId = req.tenantId;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(tenantId ? { tenantId } : {})
      },
      include: { items: true, tenant: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const config = await prisma.tenantInvoiceConfig.findUnique({
      where: { tenantId: order.tenantId || tenantId },
      include: { template: true }
    });

    // Compute dynamic tax breakdowns
    const subtotal = order.subtotalAmount || order.items.reduce((s, i) => s + (i.priceAtPurchase * i.quantity), 0);
    const discount = order.discountAmount || 0;
    const shipping = order.shippingFee || 0;
    const tax = order.taxAmount || Math.round((subtotal - discount) * 0.03);
    const calculatedTotal = subtotal - discount + shipping + tax;

    const invoicePayload = {
      invoiceNumber: `INV-${order.orderNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`,
      invoiceDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      order: {
        ...order,
        shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
        subtotal,
        discount,
        shipping,
        tax,
        total: calculatedTotal
      },
      store: {
        legalName: config?.storeLegalName || order.tenant?.name || 'Go Julex Store',
        tradeName: config?.storeTradeName || order.tenant?.name,
        gstin: config?.storeGstin || '27AAACA1234A1Z5',
        address: config?.storeAddress || `${order.tenant?.city || 'Mumbai'}, ${order.tenant?.state || 'Maharashtra'}`,
        phone: config?.storePhone || '+91 98201 54321',
        email: config?.storeEmail || 'orders@store.gojulex.com',
        signatoryUrl: config?.authorizedSignatoryUrl
      },
      template: config?.template ? {
        ...config.template,
        defaultLayout: JSON.parse(config.template.defaultLayoutJson)
      } : null,
      customStyles: config?.customStylesJson ? JSON.parse(config.customStylesJson) : {}
    };

    return res.json({ success: true, data: invoicePayload });
  } catch (error) {
    console.error('Render invoice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate invoice data model.' });
  }
});

export default router;
