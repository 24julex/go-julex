import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

async function bootstrap() {
  await prisma.plan.upsert({
    where: { id: 'plan_free_preview' },
    update: {},
    create: {
      id: 'plan_free_preview',
      name: 'Free Preview',
      description: 'Build and preview a store before publishing.',
      priceInr: 0,
      billingPeriod: 'FREE',
      allowsPublish: false,
      featuresJson: JSON.stringify(['Store draft', 'Theme preview', 'Product setup'])
    }
  });
  await prisma.masterInvoiceTemplate.upsert({
    where: { id: 'tpl_classic_tax_a4' },
    // Align the slug with seed.js / the frontend catalog on volumes created
    // before they agreed, so the demo seed's slug-keyed upserts find this row.
    update: { slug: 'classic-tax-a4' },
    create: {
      id: 'tpl_classic_tax_a4',
      name: 'Classic A4',
      slug: 'classic-tax-a4',
      description: 'Basic print layout. Merchant legal and tax details must be configured.',
      isPublished: true,
      tierAccess: 'FREE',
      defaultLayoutJson: JSON.stringify({ headerStyle: 'split_left_right', accentColor: '#A87A00', showTaxBreakdown: false, defaultTerms: '' })
    }
  });
  const email = String(process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.BOOTSTRAP_ADMIN_PASSWORD || '');
  if (!email || !password) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 16) {
    throw new Error('BOOTSTRAP_ADMIN_EMAIL must be valid and BOOTSTRAP_ADMIN_PASSWORD must have at least 16 characters.');
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: { email, name: 'Platform Administrator', passwordHash: await bcrypt.hash(password, 12), role: 'SUPER_ADMIN', emailVerified: true }
    });
    console.log('Initial platform administrator created.');
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error.message);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
