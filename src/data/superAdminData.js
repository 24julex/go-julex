/**
 * Go Julex Super Admin Portal - Enterprise Master Dataset
 * Universal Multi-Tenant E-Commerce SaaS Platform
 */

export const initialTenants = [];

export const initialPlans = [
  {
    id: 'plan_6mo',
    name: '6-Month Growth Plan',
    tagline: 'Ideal for rapidly scaling D2C brands, modern retail sellers & multi-channel stores',
    priceINR: 18000,
    interval: '6_months',
    normalizedMRR: 3000,
    trialDays: 14,
    isPopular: true,
    badge: 'Most Popular',
    subscribersCount: 0,
    revenueGeneratedINR: 0,
    description: 'Flat ₹18,000 for 6 months full access. Includes 0% platform fee and automated multi-channel sync.',
    features: {
      customDomain: true,
      whatsappSync: true,
      instagramApi: true,
      maxProducts: 'Unlimited',
      platformFeePercent: 0,
      prioritySupport: true,
      customSsl: true,
      analyticsExport: true,
    },
    status: 'active',
  },
  {
    id: 'plan_1yr',
    name: '1-Year Enterprise Plan',
    tagline: 'Best value for high-volume retail brands, fashion labels & fast-scaling enterprises',
    priceINR: 36000,
    interval: 'year',
    normalizedMRR: 3000,
    trialDays: 14,
    isPopular: false,
    badge: 'Best Value (Annual)',
    subscribersCount: 0,
    revenueGeneratedINR: 0,
    description: 'Flat ₹36,000 for 12 months full access. Zero platform transaction commission, VIP concierge support.',
    features: {
      customDomain: true,
      whatsappSync: true,
      instagramApi: true,
      maxProducts: 'Unlimited',
      platformFeePercent: 0,
      prioritySupport: true,
      customSsl: true,
      analyticsExport: true,
    },
    status: 'active',
  },
  {
    id: 'plan_monthly',
    name: 'Monthly Flexible Tier',
    tagline: 'Flexible month-to-month plan for new brand launches and seasonal popups',
    priceINR: 3999,
    interval: 'month',
    normalizedMRR: 3999,
    trialDays: 7,
    isPopular: false,
    badge: 'Flexible',
    subscribersCount: 0,
    revenueGeneratedINR: 0,
    description: 'Month-to-month billing with 0% platform fee and standard priority support.',
    features: {
      customDomain: true,
      whatsappSync: true,
      instagramApi: false,
      maxProducts: 1000,
      platformFeePercent: 0,
      prioritySupport: false,
      customSsl: true,
      analyticsExport: true,
    },
    status: 'active',
  },
  {
    id: 'plan_trial',
    name: '14-Day Free Trial',
    tagline: 'Full trial experience to launch your product catalog and configure payment gateways',
    priceINR: 0,
    interval: 'month',
    normalizedMRR: 0,
    trialDays: 14,
    isPopular: false,
    badge: 'Free Trial',
    subscribersCount: 0,
    revenueGeneratedINR: 0,
    description: '14-day zero-risk trial with up to 250 products and full order checkout capabilities.',
    features: {
      customDomain: false,
      whatsappSync: true,
      instagramApi: false,
      maxProducts: 250,
      platformFeePercent: 0,
      prioritySupport: false,
      customSsl: true,
      analyticsExport: false,
    },
    status: 'active',
  },
  {
    id: 'plan_bespoke_enterprise',
    name: 'Bespoke Enterprise Suite',
    tagline: 'Custom multi-brand umbrella solution with dedicated account manager & ERP sync',
    priceINR: 75000,
    interval: 'year',
    normalizedMRR: 6250,
    trialDays: 30,
    isPopular: false,
    badge: 'Flagship Enterprise',
    subscribersCount: 0,
    revenueGeneratedINR: 0,
    description: 'Full white-label solution, custom ERP integration, dedicated SLA, and custom domain SSL cluster.',
    features: {
      customDomain: true,
      whatsappSync: true,
      instagramApi: true,
      maxProducts: 'Unlimited',
      platformFeePercent: 0,
      prioritySupport: true,
      customSsl: true,
      analyticsExport: true,
    },
    status: 'active',
  },
];

export const initialMRRHistory = [
  { month: 'Sep 2025', newMrr: 12000, expansionMrr: 3000, contractionMrr: 0, churnMrr: 0, netMrr: 15000, endingMrr: 21000, activePaidStores: 7 },
  { month: 'Oct 2025', newMrr: 9000, expansionMrr: 3000, contractionMrr: 0, churnMrr: 0, netMrr: 12000, endingMrr: 33000, activePaidStores: 9 },
  { month: 'Nov 2025', newMrr: 15000, expansionMrr: 6000, contractionMrr: 0, churnMrr: 0, netMrr: 21000, endingMrr: 54000, activePaidStores: 12 },
  { month: 'Dec 2025', newMrr: 18000, expansionMrr: 6000, contractionMrr: 0, churnMrr: 3000, netMrr: 21000, endingMrr: 75000, activePaidStores: 14 },
  { month: 'Jan 2026', newMrr: 15000, expansionMrr: 3000, contractionMrr: 0, churnMrr: 0, netMrr: 18000, endingMrr: 93000, activePaidStores: 16 },
  { month: 'Feb 2026', newMrr: 12000, expansionMrr: 6000, contractionMrr: 0, churnMrr: 3000, netMrr: 15000, endingMrr: 108000, activePaidStores: 18 },
  { month: 'Mar 2026', newMrr: 21000, expansionMrr: 6000, contractionMrr: 0, churnMrr: 0, netMrr: 27000, endingMrr: 135000, activePaidStores: 22 },
  { month: 'Apr 2026', newMrr: 18000, expansionMrr: 3000, contractionMrr: 0, churnMrr: 0, netMrr: 21000, endingMrr: 156000, activePaidStores: 25 },
  { month: 'May 2026', newMrr: 24000, expansionMrr: 6000, contractionMrr: 0, churnMrr: 3000, netMrr: 27000, endingMrr: 183000, activePaidStores: 29 },
  { month: 'Jun 2026', newMrr: 18000, expansionMrr: 6000, contractionMrr: 0, churnMrr: 0, netMrr: 24000, endingMrr: 207000, activePaidStores: 32 },
  { month: 'Jul 2026', newMrr: 21000, expansionMrr: 3000, contractionMrr: 0, churnMrr: 3000, netMrr: 21000, endingMrr: 228000, activePaidStores: 35 },
  { month: 'Aug 2026', newMrr: 27000, expansionMrr: 6000, contractionMrr: 0, churnMrr: 0, netMrr: 33000, endingMrr: 261000, activePaidStores: 39 },
];

export const initialAtRiskSubscriptions = [];

export const initialAuditLogs = [];

export const initialMerchantUsers = [];

export const initialBroadcasts = [
  {
    id: 'bc_01',
    title: 'Peak Festive Season: 0% Platform Fee & High Concurrency Optimizations',
    message: 'To support peak online shopping traffic across all retail categories, all Go Julex edge servers have been auto-scaled. Remember that Go Julex charges 0% platform fee on all store sales.',
    type: 'System Alert',
    targetAudience: 'All Tenants',
    channels: ['in_app', 'email', 'whatsapp'],
    sentAt: '2026-08-25 18:22 IST',
    sentBy: 'Rhea Sen (Lead Ops)',
    deliveredCount: 16,
    openRatePercent: 93.8,
    status: 'sent'
  },
  {
    id: 'bc_02',
    title: 'Scheduled Edge Maintenance: Sunday 02:00 AM - 02:30 AM IST',
    message: 'We will be upgrading database read-replicas for faster product search indexing. No storefront downtime is expected.',
    type: 'Maintenance',
    targetAudience: 'All Tenants',
    channels: ['in_app', 'email'],
    sentAt: '2026-08-20 14:00 IST',
    sentBy: 'Aditya Verma (Super Admin)',
    deliveredCount: 16,
    openRatePercent: 87.5,
    status: 'sent'
  },
  {
    id: 'bc_03',
    title: 'New Feature: Automated WhatsApp Product Catalog & Order Tracking',
    message: 'You can now sync your complete product inventory to WhatsApp Business in 1-click under Settings > Sales Channels.',
    type: 'Feature Update',
    targetAudience: 'Active Only',
    channels: ['in_app', 'email'],
    sentAt: '2026-08-14 10:30 IST',
    sentBy: 'Aditya Verma (Super Admin)',
    deliveredCount: 11,
    openRatePercent: 100.0,
    status: 'sent'
  }
];

export const initialFeatureFlags = [
  {
    id: 'flag_01',
    key: 'custom_domain_auto_verify',
    name: 'Custom Domain Verification Engine',
    description: 'Automated Cloudflare SSL and DNS CNAME validation for merchant custom domains without manual DNS checks.',
    category: 'Infrastructure',
    enabled: true,
    rollOutPercentage: 100,
    lastModified: '2026-08-26 05:40 IST',
    updatedBy: 'Aditya Verma'
  },
  {
    id: 'flag_02',
    key: 'csv_bulk_import_system',
    name: 'CSV Bulk Import System (50,000 SKUs)',
    description: 'Enables high-speed background job processing for bulk product imports with SKU, variants, weight, and pricing columns.',
    category: 'Commerce Engine',
    enabled: true,
    rollOutPercentage: 100,
    lastModified: '2026-08-22 14:15 IST',
    updatedBy: 'Rhea Sen'
  },
  {
    id: 'flag_03',
    key: 'mandatory_email_phone_otp',
    name: 'Mandatory Email & Phone OTP Verification',
    description: 'Enforces mobile OTP and email verification during merchant signup to prevent bot storefront generation.',
    category: 'Security',
    enabled: true,
    rollOutPercentage: 100,
    lastModified: '2026-08-18 10:00 IST',
    updatedBy: 'Aditya Verma'
  },
  {
    id: 'flag_04',
    key: 'platform_wide_2fa_enforcement',
    name: 'Platform-wide 2FA Enforcement',
    description: 'Forces all Store Owners and Admin staff to configure Authenticator TOTP before accessing payout data.',
    category: 'Security',
    enabled: false,
    rollOutPercentage: 0,
    lastModified: '2026-08-15 09:20 IST',
    updatedBy: 'Aditya Verma'
  },
  {
    id: 'flag_05',
    key: 'domain_hosting_auto_provisioning',
    name: 'Domain Hosting Auto-Provisioning',
    description: 'Automatically provisions Vercel edge routes and edge SSL certificates upon tenant signup.',
    category: 'Infrastructure',
    enabled: true,
    rollOutPercentage: 100,
    lastModified: '2026-08-10 16:30 IST',
    updatedBy: 'Aditya Verma'
  },
  {
    id: 'flag_06',
    key: 'whatsapp_commerce_auto_sync',
    name: 'WhatsApp Commerce Automated Catalog Sync',
    description: 'Bi-directional live inventory sync with Meta Commerce Catalog Graph API for real-time stock reservations.',
    category: 'Commerce Engine',
    enabled: true,
    rollOutPercentage: 100,
    lastModified: '2026-08-12 11:00 IST',
    updatedBy: 'Rhea Sen'
  },
  {
    id: 'flag_07',
    key: 'dynamic_currency_conversion',
    name: 'Dynamic Currency Conversion for International D2C',
    description: 'Real-time multi-currency pricing (USD, AED, GBP, EUR) for global and international online shoppers.',
    category: 'Growth',
    enabled: true,
    rollOutPercentage: 50,
    lastModified: '2026-08-20 12:00 IST',
    updatedBy: 'Aditya Verma'
  }
];

export const conversionFunnelData = [
  { stage: '1. Sign-Up Initiated', count: 180, conversionRate: 100, dropOffRate: 0, description: 'Store creator registered phone/email' },
  { stage: '2. Trial Store Created', count: 142, conversionRate: 78.9, dropOffRate: 21.1, description: 'Subdomain provisioned & dashboard unlocked' },
  { stage: '3. Added 5+ Products', count: 96, conversionRate: 53.3, dropOffRate: 32.4, description: 'Uploaded product catalog with photos & specs' },
  { stage: '4. Connected Payment Gateway', count: 68, conversionRate: 37.8, dropOffRate: 29.2, description: 'Razorpay / Cashfree / Stripe live keys added' },
  { stage: '5. Active Paid Subscription', count: 42, conversionRate: 23.3, dropOffRate: 38.2, description: 'Subscribed to 6-Month or 1-Year Plan' },
];

export const signupVelocity7Days = [
  { day: 'Wed (Aug 20)', signups: 3, conversions: 1 },
  { day: 'Thu (Aug 21)', signups: 5, conversions: 2 },
  { day: 'Fri (Aug 22)', signups: 4, conversions: 1 },
  { day: 'Sat (Aug 23)', signups: 6, conversions: 3 },
  { day: 'Sun (Aug 24)', signups: 4, conversions: 2 },
  { day: 'Mon (Aug 25)', signups: 7, conversions: 4 },
  { day: 'Tue (Aug 26)', signups: 8, conversions: 5 },
];

export const platformGMVTrend = [
  { month: 'Sep 2025', gmvINR: 1200000, orders: 110, aov: 10900 },
  { month: 'Oct 2025', gmvINR: 2800000, orders: 240, aov: 11666 },
  { month: 'Nov 2025', gmvINR: 6400000, orders: 490, aov: 13060 },
  { month: 'Dec 2025', gmvINR: 9200000, orders: 680, aov: 13529 },
  { month: 'Jan 2026', gmvINR: 8100000, orders: 590, aov: 13728 },
  { month: 'Feb 2026', gmvINR: 11500000, orders: 780, aov: 14743 },
  { month: 'Mar 2026', gmvINR: 14800000, orders: 940, aov: 15744 },
  { month: 'Apr 2026', gmvINR: 18200000, orders: 1120, aov: 16250 },
  { month: 'May 2026', gmvINR: 22400000, orders: 1350, aov: 16592 },
  { month: 'Jun 2026', gmvINR: 27100000, orders: 1580, aov: 17151 },
  { month: 'Jul 2026', gmvINR: 34500000, orders: 1920, aov: 17968 },
  { month: 'Aug 2026', gmvINR: 42800000, orders: 2310, aov: 18528 },
];
