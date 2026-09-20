/**
 * Go Julex - Multi-Tenant E-Commerce SaaS for Jewelry Brands
 * Realistic Merchant Mock Dataset
 */

export const CURRENT_MERCHANT_STORE = {
  id: 'store-saffron-01',
  name: 'Saffron Heritage Jewels',
  subdomain: 'saffronjewels.gojulex.com',
  customDomain: 'saffronjewels.com',
  status: 'active', // 'active' | 'trial'
  trialDaysRemaining: 24,
  tier: 'Growth 1-Yr Plan',
  platformFeePercent: 0, // 0% Platform Fee
  currency: 'INR',
  ownerName: 'Super Admin',
  ownerEmail: 'admin@gojulex.com',
  ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  is2FAEnabled: true,
  establishedYear: 2018,
  city: 'Jaipur, Rajasthan'
};

export const MERCHANT_STORES_LIST = [
  {
    id: 'store-saffron-01',
    name: 'Saffron Heritage Jewels',
    subdomain: 'saffronjewels.gojulex.com',
    tier: 'Growth 1-Yr Plan (0% Fee)',
    active: true
  },
  {
    id: 'store-aura-02',
    name: 'Aura Polki Studio',
    subdomain: 'aurapolki.gojulex.com',
    tier: 'Starter 6-Mo Plan (0% Fee)',
    active: false
  },
  {
    id: 'store-vedic-03',
    name: 'Vedic Silver & Sacred Gems',
    subdomain: 'vedicsilver.gojulex.com',
    tier: 'Artisan Enterprise (0% Fee)',
    active: false
  }
];

export const MOCK_JEWELRY_KPIS = {
  todaySalesINR: 84500,
  todaySalesChangePercent: 14.2, // +14.2% from yesterday
  yesterdaySalesINR: 74000,
  totalOrdersCount: 38,
  unfulfilledOrdersCount: 4, // 4 pending fulfillment
  lowStockItemsCount: 3, // quantity <= 2
  totalCustomersCount: 428,
  newCustomersCount: 18,
  returningCustomersCount: 410,
  monthlyRevenueINR: 3485000, // ₹34,85,000
  retainedProfitINR: 3485000, // 100% Retained
  feesSavedINR: 627300 // Saved vs 18% legacy marketplace fee
};

export const MOCK_SALES_CHANNELS = [
  {
    id: 'channel-web',
    name: 'Online Storefront',
    type: 'online_store',
    status: 'connected',
    statusLabel: 'Live & Accepting Orders',
    urlOrHandle: 'saffronjewels.gojulex.com',
    lastSynced: 'Just now',
    features: [
      'Custom Domain Connected (saffronjewels.com)',
      '0% Platform Fee Gateway Active',
      'Instant UPI, Cards & NetBanking'
    ],
    badgeColor: 'emerald'
  },
  {
    id: 'channel-whatsapp',
    name: 'WhatsApp Business',
    type: 'whatsapp',
    status: 'connected',
    statusLabel: 'Automated Catalog Active',
    urlOrHandle: '+91 98201 88440',
    lastSynced: '5 mins ago',
    features: [
      'AI Interactive Product Catalog',
      'One-Click WhatsApp UPI Payment Link',
      'Instant Order Confirmation Dispatch'
    ],
    badgeColor: 'emerald'
  },
  {
    id: 'channel-meta',
    name: 'Instagram / Facebook Shop',
    type: 'meta_shop',
    status: 'connected',
    statusLabel: 'Catalog Synced via Meta API',
    urlOrHandle: '@saffronheritagejewels',
    lastSynced: '12 mins ago',
    features: [
      '48 SKUs Live on Instagram Product Tags',
      'Direct-to-Storefront Instant Checkout',
      'Real-Time Inventory Auto-Sync'
    ],
    badgeColor: 'sky'
  }
];

export const MOCK_RECENT_ORDERS = [
  {
    id: 'ord-8821',
    orderNumber: 'GJ-ORD-8821',
    channel: 'whatsapp',
    customerName: 'Pooja Kashyap',
    customerPhone: '+91 98450 99120',
    customerEmail: 'pooja.kashyap@gmail.com',
    productSummary: 'Temple Gold Choker with Ruby & Emerald Cabochons (22K Yellow Gold)',
    items: [
      {
        productId: 'jw-001',
        name: 'Temple Gold Choker with Ruby & Emerald Cabochons',
        sku: 'TEM-CHK-22K',
        karatOrMetal: '22K Hallmarked Gold',
        quantity: 1,
        priceINR: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80'
      }
    ],
    totalQuantity: 1,
    totalAmountINR: 45000,
    paymentStatus: 'paid',
    fulfillmentStatus: 'processing',
    createdAt: '2026-08-26T09:42:00Z',
    shippingCity: 'Bengaluru, Karnataka'
  },
  {
    id: 'ord-8820',
    orderNumber: 'GJ-ORD-8820',
    channel: 'web',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+91 98200 44321',
    customerEmail: 'ananya.deshmukh@luxury.in',
    productSummary: 'Kundan Bridal 22K Gold Plated Choker & Maang Tikka Set',
    items: [
      {
        productId: 'jw-002',
        name: 'Kundan Bridal 22K Gold Plated Choker & Maang Tikka Set',
        sku: 'KUN-SET-ROYAL',
        karatOrMetal: '22K Gold Foil & Uncut Gemstones',
        quantity: 1,
        priceINR: 125000,
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80'
      }
    ],
    totalQuantity: 1,
    totalAmountINR: 125000,
    paymentStatus: 'paid',
    fulfillmentStatus: 'dispatched',
    createdAt: '2026-08-26T08:15:00Z',
    shippingCity: 'Mumbai, Maharashtra'
  },
  {
    id: 'ord-8819',
    orderNumber: 'GJ-ORD-8819',
    channel: 'instagram',
    customerName: 'Meera Nambiar',
    customerPhone: '+91 94470 12389',
    customerEmail: 'meera.nambiar@yahoo.co.in',
    productSummary: 'Silver Oxidized Tribal Peacock Jhumkas (92.5 Sterling Silver)',
    items: [
      {
        productId: 'jw-003',
        name: 'Silver Oxidized Tribal Peacock Jhumkas',
        sku: 'SLV-JHM-925',
        karatOrMetal: '92.5 Sterling Silver',
        quantity: 2,
        priceINR: 3400,
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=300&q=80'
      }
    ],
    totalQuantity: 2,
    totalAmountINR: 6800,
    paymentStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    createdAt: '2026-08-25T19:30:00Z',
    shippingCity: 'Kochi, Kerala'
  },
  {
    id: 'ord-8818',
    orderNumber: 'GJ-ORD-8818',
    channel: 'whatsapp',
    customerName: 'Rajesh Mittal',
    customerPhone: '+91 98110 55670',
    customerEmail: 'rajesh.mittal@delhicap.com',
    productSummary: 'Uncut Polki Diamond Layered Royal Haar (18K Gold)',
    items: [
      {
        productId: 'jw-004',
        name: 'Uncut Polki Diamond Layered Royal Haar',
        sku: 'POL-HAR-18K',
        karatOrMetal: '18K Yellow Gold & Certified Polki',
        quantity: 1,
        priceINR: 82000,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80'
      }
    ],
    totalQuantity: 1,
    totalAmountINR: 82000,
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    createdAt: '2026-08-25T16:05:00Z',
    shippingCity: 'New Delhi, NCR'
  },
  {
    id: 'ord-8817',
    orderNumber: 'GJ-ORD-8817',
    channel: 'web',
    customerName: 'Sunita Rao',
    customerPhone: '+91 98490 33410',
    customerEmail: 'sunita.rao@hyderabadtech.com',
    productSummary: 'Handcrafted Meenakari Enamel Chandbali Earrings',
    items: [
      {
        productId: 'jw-005',
        name: 'Handcrafted Meenakari Enamel Chandbali Earrings',
        sku: 'MEE-CHN-EAR',
        karatOrMetal: '22K Gold Plated Brass & Enamel',
        quantity: 1,
        priceINR: 14500,
        imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80'
      }
    ],
    totalQuantity: 1,
    totalAmountINR: 14500,
    paymentStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    createdAt: '2026-08-25T11:20:00Z',
    shippingCity: 'Hyderabad, Telangana'
  }
];

export const MOCK_LOW_STOCK_ITEMS = [
  {
    id: 'jw-low-01',
    name: '22K Temple Lakshmi Kasu Mala Necklace',
    sku: 'TEM-KASU-22K',
    category: 'Temple Necklaces',
    priceINR: 88000,
    quantityCount: 1,
    threshold: 2,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'jw-low-02',
    name: '925 Sterling Silver Antique Kada Bangle',
    sku: 'SLV-KAD-925',
    category: 'Silver Bangles',
    priceINR: 9500,
    quantityCount: 2,
    threshold: 2,
    imageUrl: 'https://images.unsplash.com/photo-1611591475152-478311382490?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'jw-low-03',
    name: 'Uncut Diamond Jadau Traditional Nath',
    sku: 'JAD-NATH-09',
    category: 'Bridal Jewels',
    priceINR: 28000,
    quantityCount: 1,
    threshold: 2,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_ONBOARDING_CHECKLIST = [
  {
    id: 'task-1',
    title: 'Add your first 5 jewelry creations',
    description: 'Upload high-resolution photography, hallmarking certifications, karat purity, and live INR pricing.',
    completed: false,
    actionLabel: 'Add Next Product',
    actionHref: '/admin/products',
    progress: {
      current: 4,
      target: 5,
      unit: 'pieces'
    }
  },
  {
    id: 'task-2',
    title: 'Configure Payment Gateway (Razorpay / PhonePe)',
    description: 'Enable instant UPI zero-fee settlements, debit/credit cards, and automated escrow payouts.',
    completed: true,
    actionLabel: 'Settings',
    actionHref: '/admin'
  },
  {
    id: 'task-3',
    title: 'Set up Custom Brand Domain (e.g. saffronjewels.com)',
    description: 'Map your official domain name with complimentary SSL certificates generated automatically by Go Julex.',
    completed: false,
    actionLabel: 'Connect Domain',
    actionHref: '/admin'
  },
  {
    id: 'task-4',
    title: 'Connect WhatsApp Business Catalog & Webhook',
    description: 'Enable automated product catalog browsing and instant 1-click UPI checkout links inside WhatsApp chats.',
    completed: true,
    actionLabel: 'Manage Webhooks',
    actionHref: '/admin'
  }
];
