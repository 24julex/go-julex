import { PrismaClient } from './generated/client/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ----------------------------------------------------
// Master Invoice Template Registry Seeds
// ----------------------------------------------------
export const SEED_MASTER_INVOICE_TEMPLATES = [
  {
    id: 'tpl_classic_tax_a4',
    name: 'Classic Tax A4',
    slug: 'classic-tax-a4',
    description: 'Government-compliant GST tax invoice featuring dual CGST/SGST breakdowns, HSN codes, authorized signatory box, and QR payment stamp.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    isPublished: true,
    tierAccess: 'FREE',
    installedCount: 420,
    defaultLayoutJson: JSON.stringify({
      headerStyle: 'split_left_right', // 'centered_minimal' | 'split_left_right' | 'banner_strip'
      accentColor: '#E8927C',
      fontFamily: 'Inter',
      fontSize: 12,
      columns: [
        { id: 'sno', label: 'S.No', visible: true, width: '8%' },
        { id: 'item', label: 'Item & SKU Details', visible: true, width: '42%' },
        { id: 'hsn', label: 'HSN / SAC', visible: true, width: '12%' },
        { id: 'qty', label: 'Qty', visible: true, width: '8%' },
        { id: 'price', label: 'Unit Rate (₹)', visible: true, width: '15%' },
        { id: 'total', label: 'Amount (₹)', visible: true, width: '15%' }
      ],
      taxFormat: 'split_cgst_sgst', // 'unified_gst' | 'split_cgst_sgst' | 'igst'
      showSignatoryBox: true,
      showQrCode: true,
      showDiscountBreakdown: true,
      defaultTerms: '1. Goods once sold can be exchanged within 7 days with original tax invoice.\n2. Warranty claims are subject to manufacturer terms.\n3. This is a computer-generated tax invoice issued under 0% platform fee.'
    })
  },
  {
    id: 'tpl_minimalist_thermal',
    name: 'Minimalist Thermal & POS',
    slug: 'minimalist-thermal',
    description: 'Ultra-compact, high-contrast monochrome layout optimized for thermal roll printers, WhatsApp instant delivery, and fast in-store pickup.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80',
    isPublished: true,
    tierAccess: 'FREE',
    installedCount: 310,
    defaultLayoutJson: JSON.stringify({
      headerStyle: 'centered_minimal',
      accentColor: '#4A281E',
      fontFamily: 'Space Grotesk',
      fontSize: 11,
      columns: [
        { id: 'sno', label: '#', visible: false, width: '0%' },
        { id: 'item', label: 'Description', visible: true, width: '55%' },
        { id: 'hsn', label: 'HSN', visible: false, width: '0%' },
        { id: 'qty', label: 'Qty', visible: true, width: '15%' },
        { id: 'price', label: 'Rate', visible: true, width: '15%' },
        { id: 'total', label: 'Total', visible: true, width: '15%' }
      ],
      taxFormat: 'unified_gst',
      showSignatoryBox: false,
      showQrCode: true,
      showDiscountBreakdown: true,
      defaultTerms: 'Thank you for supporting our independent store! Scan QR code to track delivery.'
    })
  },
  {
    id: 'tpl_modern_luxury_ribbon',
    name: 'Modern Luxury Ribbon',
    slug: 'modern-luxury-ribbon',
    description: 'Editorial high-fashion layout with terracotta ribbon borders, serif Roman titles, elegant product thumbnails, and velvet gold accents.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
    isPublished: true,
    tierAccess: 'PRO_EXCLUSIVE',
    installedCount: 185,
    defaultLayoutJson: JSON.stringify({
      headerStyle: 'banner_strip',
      accentColor: '#C86D51',
      fontFamily: 'Playfair Display',
      fontSize: 12,
      columns: [
        { id: 'sno', label: 'Item', visible: true, width: '10%' },
        { id: 'item', label: 'Atelier Piece & Craft Notes', visible: true, width: '50%' },
        { id: 'hsn', label: 'HSN', visible: false, width: '0%' },
        { id: 'qty', label: 'Qty', visible: true, width: '10%' },
        { id: 'price', label: 'Rate (₹)', visible: true, width: '15%' },
        { id: 'total', label: 'Total (₹)', visible: true, width: '15%' }
      ],
      taxFormat: 'split_cgst_sgst',
      showSignatoryBox: true,
      showQrCode: true,
      showDiscountBreakdown: true,
      defaultTerms: 'Handcrafted luxury pieces. Complimentary appraisal certificate included. 100% authenticity guaranteed.'
    })
  },
  {
    id: 'tpl_earthy_kraft_farm',
    name: 'Earthy Kraft Farm Slip',
    slug: 'earthy-kraft-farm',
    description: 'Organic rustic invoice with botanical emblems, batch harvest provenance notes, FSSAI registration stamp, and farm-to-table traceability.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    isPublished: true,
    tierAccess: 'FREE',
    installedCount: 220,
    defaultLayoutJson: JSON.stringify({
      headerStyle: 'split_left_right',
      accentColor: '#2D6A4F',
      fontFamily: 'Outfit',
      fontSize: 12,
      columns: [
        { id: 'sno', label: 'S.No', visible: true, width: '10%' },
        { id: 'item', label: 'Organic Harvest & Grain Type', visible: true, width: '45%' },
        { id: 'hsn', label: 'FSSAI/HSN', visible: true, width: '15%' },
        { id: 'qty', label: 'Weight/Qty', visible: true, width: '15%' },
        { id: 'price', label: 'Price (₹)', visible: false, width: '0%' },
        { id: 'total', label: 'Amount (₹)', visible: true, width: '15%' }
      ],
      taxFormat: 'unified_gst',
      showSignatoryBox: true,
      showQrCode: true,
      showDiscountBreakdown: true,
      defaultTerms: 'Certified 100% Pesticide-Free Organic Produce. Store in cool, dry container after opening.'
    })
  },
  {
    id: 'tpl_boutique_atelier',
    name: 'Boutique Atelier Slip',
    slug: 'boutique-atelier',
    description: 'Minimalist designer slip with bespoke signature seal, client loyalty point statements, and custom gift note section.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80',
    isPublished: true,
    tierAccess: 'PRO_EXCLUSIVE',
    installedCount: 140,
    defaultLayoutJson: JSON.stringify({
      headerStyle: 'split_left_right',
      accentColor: '#9A3412',
      fontFamily: 'Inter',
      fontSize: 12,
      columns: [
        { id: 'sno', label: 'No.', visible: true, width: '8%' },
        { id: 'item', label: 'Boutique Collection', visible: true, width: '47%' },
        { id: 'hsn', label: 'Code', visible: true, width: '10%' },
        { id: 'qty', label: 'Units', visible: true, width: '10%' },
        { id: 'price', label: 'Price (₹)', visible: true, width: '12%' },
        { id: 'total', label: 'Total (₹)', visible: true, width: '13%' }
      ],
      taxFormat: 'split_cgst_sgst',
      showSignatoryBox: true,
      showQrCode: true,
      showDiscountBreakdown: true,
      defaultTerms: 'Bespoke apparel custom fitted to your specifications. Exchanges accepted within 14 business days.'
    })
  },
  {
    id: 'tpl_neo_tech_digital',
    name: 'Neo-Tech Digital Receipt',
    slug: 'neo-tech-digital',
    description: 'Clean modern electronics receipt with IMEI/Serial number fields, extended warranty registration barcode, and direct technical support link.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80',
    isPublished: true,
    tierAccess: 'PRO_EXCLUSIVE',
    installedCount: 95,
    defaultLayoutJson: JSON.stringify({
      headerStyle: 'banner_strip',
      accentColor: '#1E3A8A',
      fontFamily: 'Space Grotesk',
      fontSize: 11,
      columns: [
        { id: 'sno', label: 'S.No', visible: true, width: '8%' },
        { id: 'item', label: 'Device & Hardware Model', visible: true, width: '42%' },
        { id: 'hsn', label: 'HSN / Serial', visible: true, width: '20%' },
        { id: 'qty', label: 'Qty', visible: true, width: '10%' },
        { id: 'price', label: 'Rate (₹)', visible: true, width: '10%' },
        { id: 'total', label: 'Total (₹)', visible: true, width: '10%' }
      ],
      taxFormat: 'split_cgst_sgst',
      showSignatoryBox: true,
      showQrCode: true,
      showDiscountBreakdown: true,
      defaultTerms: '1 Year Manufacturer Limited Warranty. Scan QR code to register your hardware warranty.'
    })
  }
];

// ----------------------------------------------------
// Multi-Tenant Stores Seeds
// ----------------------------------------------------
export const SEED_TENANTS = [
  // Demo storefront stores — ids/subdomains MUST match DEMO_STORES in
  // src/data/multiVerticalMockData.js so checkout orders (tenantId: store_<sub>)
  // resolve to real TenantInvoiceConfigs.
  {
    id: 'store_luxestudio',
    name: 'luxe studio',
    subdomain: 'luxestudio.gojulex.com',
    customDomain: 'luxestudio.in',
    category: 'Fashion & Designer Apparel',
    city: 'Mumbai',
    state: 'Maharashtra',
    planTier: 'SIX_MONTH',
    status: 'ACTIVE',
    activeThemeId: 'theme_aura_soft_peach',
    activeInvoiceTemplateId: 'tpl_classic_tax_a4',
    owner: {
      email: 'owner@luxestudio.gojulex.com',
      name: 'luxe studio Owner',
      phone: '+91 98200 10001',
      role: 'MERCHANT_OWNER'
    },
    invoiceConfig: {
      storeGstin: '27AABCL1234M1Z1',
      storeLegalName: 'Luxe Studio Fashion House Private Limited',
      storeTradeName: 'luxe studio',
      storeAddress: '18 Linking Road, Bandra West, Mumbai, Maharashtra - 400050',
      storePhone: '+91 98200 10001',
      storeEmail: 'care@luxestudio.in',
      authorizedSignatoryUrl: null,
      customStyles: {
        fontFamily: 'Inter',
        fontSize: 12,
        primaryColor: '#D4A017',
        secondaryColor: '#0F172A',
        showTaxBreakdown: true,
        showQrCode: true,
        terms: '1. Goods once sold can be exchanged within 7 business days with original invoice.\n2. In accordance with Indian GST Rule 46.\n3. Issued under Go Julex 0% platform fee.'
      }
    }
  },
  {
    id: 'store_abisjewel',
    name: "ABI's JEWELRY STORE",
    subdomain: 'abisjewel.gojulex.com',
    customDomain: 'abisjewel.in',
    category: 'Fine Jewelry & Luxury',
    city: 'Chennai',
    state: 'Tamil Nadu',
    planTier: 'ONE_YEAR',
    status: 'ACTIVE',
    activeThemeId: 'theme_aura_soft_peach',
    activeInvoiceTemplateId: 'tpl_classic_tax_a4',
    owner: {
      email: 'owner@abisjewel.gojulex.com',
      name: 'Abi Jewel Owner',
      phone: '+91 98400 20002',
      role: 'MERCHANT_OWNER'
    },
    invoiceConfig: {
      storeGstin: '33AABCA1234J1Z2',
      storeLegalName: 'Abi Fine Jewellery Private Limited',
      storeTradeName: "ABI's Jewelry Store",
      storeAddress: '7 Greams Road, Thousand Lights, Chennai, Tamil Nadu - 600006',
      storePhone: '+91 98400 20002',
      storeEmail: 'care@abisjewel.in',
      authorizedSignatoryUrl: null,
      customStyles: {
        fontFamily: 'Inter',
        fontSize: 12,
        primaryColor: '#D4A017',
        secondaryColor: '#0F172A',
        showTaxBreakdown: true,
        showQrCode: true,
        terms: '1. BIS-hallmarked jewellery; exchange as per store policy.\n2. In accordance with Indian GST Rule 46.\n3. Issued under Go Julex 0% platform fee.'
      }
    }
  },
  {
    id: 'store_bookstore',
    name: 'Book Haven Store',
    subdomain: 'bookstore.gojulex.com',
    customDomain: 'bookhaven.in',
    category: 'Books & Literature',
    city: 'Bengaluru',
    state: 'Karnataka',
    planTier: 'SIX_MONTH',
    status: 'ACTIVE',
    activeThemeId: 'theme_aura_soft_peach',
    activeInvoiceTemplateId: 'tpl_classic_tax_a4',
    owner: {
      email: 'owner@bookstore.gojulex.com',
      name: 'Book Haven Owner',
      phone: '+91 98800 30003',
      role: 'MERCHANT_OWNER'
    },
    invoiceConfig: {
      storeGstin: '29AACCB1234K1Z3',
      storeLegalName: 'Book Haven Retail Private Limited',
      storeTradeName: 'Book Haven Store',
      storeAddress: '22 Church Street, Bengaluru, Karnataka - 560001',
      storePhone: '+91 98800 30003',
      storeEmail: 'care@bookhaven.in',
      authorizedSignatoryUrl: null,
      customStyles: {
        fontFamily: 'Inter',
        fontSize: 12,
        primaryColor: '#D4A017',
        secondaryColor: '#0F172A',
        showTaxBreakdown: true,
        showQrCode: true,
        terms: '1. Returns accepted within 7 days for undamaged books.\n2. In accordance with Indian GST Rule 46.\n3. Issued under Go Julex 0% platform fee.'
      }
    }
  },
  {
    id: 'store_ramstshirt',
    name: "RAM'S T-SHIRT STORE",
    subdomain: 'ramstshirt.gojulex.com',
    customDomain: 'ramstshirt.in',
    category: 'Premium T-Shirts & Apparel',
    city: 'Chennai',
    state: 'Tamil Nadu',
    planTier: 'SIX_MONTH',
    status: 'ACTIVE',
    activeThemeId: 'theme_aura_soft_peach',
    activeInvoiceTemplateId: 'tpl_classic_tax_a4',
    owner: {
      email: 'ramstshirt@merchant.com',
      name: 'Ram',
      phone: '+91 98765 43210',
      role: 'MERCHANT_OWNER'
    },
    invoiceConfig: {
      storeGstin: '33AABCR1234T1Z8',
      storeLegalName: "Ram's Apparel Private Limited",
      storeTradeName: "RAM'S T-SHIRT STORE",
      storeAddress: '128 Heritage Avenue, Studio Lane, Chennai, Tamil Nadu - 600001',
      storePhone: '+91 98765 43210',
      storeEmail: 'ramstshirt@merchant.com',
      authorizedSignatoryUrl: null,
      customStyles: {
        fontFamily: 'Inter',
        fontSize: 12,
        primaryColor: '#D4A017',
        secondaryColor: '#0F172A',
        showTaxBreakdown: true,
        showQrCode: true,
        terms: '1. Goods once sold can be exchanged within 7 business days with original invoice.\n2. In accordance with Indian GST Rule 46.\n3. Issued under Go Julex 0% platform fee.'
      }
    }
  },
];

// ----------------------------------------------------
// Master Seed Runner
// ----------------------------------------------------
export async function seedDatabase() {
  console.log('🌱 Starting Go Julex multi-tenant database seed...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('customer123', 10);

  // 1. Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@gojulex.com' },
    update: {
      role: 'SUPER_ADMIN',
      name: 'Eleanor Vance (Master Super Admin)'
    },
    create: {
      email: 'admin@gojulex.com',
      passwordHash,
      name: 'Eleanor Vance (Master Super Admin)',
      role: 'SUPER_ADMIN',
      twoFactorEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98200 11223'
    }
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 2. Seed Master Invoice Templates (Super Admin Registry)
  for (const tpl of SEED_MASTER_INVOICE_TEMPLATES) {
    await prisma.masterInvoiceTemplate.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        description: tpl.description,
        thumbnailUrl: tpl.thumbnailUrl,
        isPublished: tpl.isPublished,
        tierAccess: tpl.tierAccess,
        installedCount: tpl.installedCount,
        defaultLayoutJson: tpl.defaultLayoutJson
      },
      create: tpl
    });
  }
  console.log(`✅ Seeded ${SEED_MASTER_INVOICE_TEMPLATES.length} Master Invoice Templates`);

  // 3. Seed Tenants & Tenant Invoice Configurations
  for (const tData of SEED_TENANTS) {
    const tenant = await prisma.tenant.upsert({
      where: { subdomain: tData.subdomain },
      update: {
        name: tData.name,
        customDomain: tData.customDomain,
        category: tData.category,
        city: tData.city,
        state: tData.state,
        planTier: tData.planTier,
        status: tData.status,
        activeThemeId: tData.activeThemeId,
        activeInvoiceTemplateId: tData.activeInvoiceTemplateId
      },
      create: {
        id: tData.id,
        name: tData.name,
        subdomain: tData.subdomain,
        customDomain: tData.customDomain,
        category: tData.category,
        city: tData.city,
        state: tData.state,
        planTier: tData.planTier,
        status: tData.status,
        activeThemeId: tData.activeThemeId,
        activeInvoiceTemplateId: tData.activeInvoiceTemplateId
      }
    });

    // Create Merchant Owner User
    await prisma.user.upsert({
      where: { email: tData.owner.email },
      update: {
        name: tData.owner.name,
        role: tData.owner.role,
        tenantId: tenant.id,
        phone: tData.owner.phone
      },
      create: {
        email: tData.owner.email,
        passwordHash,
        name: tData.owner.name,
        role: tData.owner.role,
        tenantId: tenant.id,
        phone: tData.owner.phone,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
      }
    });

    // Create / Update Tenant Invoice Config
    await prisma.tenantInvoiceConfig.upsert({
      where: { tenantId: tenant.id },
      update: {
        templateId: tData.activeInvoiceTemplateId,
        storeGstin: tData.invoiceConfig.storeGstin,
        storeLegalName: tData.invoiceConfig.storeLegalName,
        storeTradeName: tData.invoiceConfig.storeTradeName,
        storeAddress: tData.invoiceConfig.storeAddress,
        storePhone: tData.invoiceConfig.storePhone,
        storeEmail: tData.invoiceConfig.storeEmail,
        authorizedSignatoryUrl: tData.invoiceConfig.authorizedSignatoryUrl,
        customStylesJson: JSON.stringify(tData.invoiceConfig.customStyles)
      },
      create: {
        tenantId: tenant.id,
        templateId: tData.activeInvoiceTemplateId,
        storeGstin: tData.invoiceConfig.storeGstin,
        storeLegalName: tData.invoiceConfig.storeLegalName,
        storeTradeName: tData.invoiceConfig.storeTradeName,
        storeAddress: tData.invoiceConfig.storeAddress,
        storePhone: tData.invoiceConfig.storePhone,
        storeEmail: tData.invoiceConfig.storeEmail,
        authorizedSignatoryUrl: tData.invoiceConfig.authorizedSignatoryUrl,
        customStylesJson: JSON.stringify(tData.invoiceConfig.customStyles)
      }
    });
  }
  console.log(`✅ Seeded ${SEED_TENANTS.length} Multi-Tenant Stores & Invoice Configs`);

  // Common Merchant Owner (merchant@gojulex.com) — belongs to the RAM'S T-SHIRT
  // demo storefront so invoice-config saves match what checkout customers see
  const commonMerchant = await prisma.user.upsert({
    where: { email: 'merchant@gojulex.com' },
    update: {
      name: 'Go Julex Store Owner',
      role: 'MERCHANT_OWNER',
      tenantId: 'store_ramstshirt',
      phone: '+91 98765 43210'
    },
    create: {
      email: 'merchant@gojulex.com',
      passwordHash,
      name: 'Go Julex Store Owner',
      role: 'MERCHANT_OWNER',
      tenantId: 'store_ramstshirt',
      twoFactorEnabled: false,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: '+91 98765 43210'
    }
  });
  console.log(`✅ Common Merchant created: ${commonMerchant.email}`);

  // 4. Seed Products
  const sampleProducts = [];

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p
    });
  }
  console.log(`✅ Seeded ${sampleProducts.length} Demo Products`);

  // 5. Seed Sample Multi-Tenant Orders
  const sampleOrders = [];

  for (const ord of sampleOrders) {
    await prisma.order.upsert({
      where: { orderNumber: ord.orderNumber },
      update: ord,
      create: ord
    });
  }
  console.log(`✅ Seeded ${sampleOrders.length} Demo Orders`);

  // 6. Seed Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      tenantId: 'store_luxestudio',
      actorId: superAdmin.id,
      actorEmail: superAdmin.email,
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'PLATFORM',
      entityId: 'ROOT',
      detailsJson: JSON.stringify({ version: '3.2.0', initializedAt: new Date().toISOString() }),
      ipAddress: '127.0.0.1'
    }
  });

  console.log('🎉 Database seeding completed successfully!');
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
