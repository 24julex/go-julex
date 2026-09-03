/**
 * Go Julex - Universal Multi-Tenant E-Commerce SaaS Platform
 * Multi-Vertical Merchant Mock Dataset
 * Verticals Supported: Jewelry, Shoes, Clothes, Millets & Organic Foods, Gift Shops, Toy Shops
 */

export const DEMO_STORES = [
  {
    id: 'store_luxestudio',
    name: 'luxe studio',
    vertical: 'clothes',
    categoryLabel: 'Fashion & Designer Apparel',
    subdomain: 'luxestudio.gojulex.com',
    customDomain: 'luxestudio.in',
    status: 'active',
    tier: '6-Month Direct Launch (0% Fee)',
    planPrice: 18000,
    planInterval: '6 Months',
    planStatus: 'Paid',
    renewalDate: '2027-03-01',
    trialDaysRemaining: 0,
    currency: 'INR',
    city: 'Chennai, Tamil Nadu',
    ownerName: 'Luxe Studio Owner',
    ownerEmail: 'luxestudio@merchant.com',
    ownerPhone: '+91 98765 43210',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is2FAEnabled: true,
    gstin: '33AABCL1234A1Z5',
    address: '128 Heritage Avenue, Studio Lane, Chennai - 600001',
    logo: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'store_abisjewel',
    name: "ABI's JEWELRY STORE",
    vertical: 'jewelry',
    categoryLabel: 'Fine Jewelry & Luxury',
    subdomain: 'abisjewel.gojulex.com',
    customDomain: 'abisjewel.in',
    status: 'active',
    tier: '6-Month Direct Launch (0% Fee)',
    planPrice: 18000,
    planInterval: '6 Months',
    planStatus: 'Paid',
    renewalDate: '2027-03-01',
    trialDaysRemaining: 0,
    currency: 'INR',
    city: 'Chennai, Tamil Nadu',
    ownerName: 'Abinaya',
    ownerEmail: 'abisjewel@merchant.com',
    ownerPhone: '+91 98765 43210',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is2FAEnabled: true,
    gstin: '33AABCU9603R1ZX',
    address: '402, Anna Salai, Chennai, Tamil Nadu - 600002',
    logo: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'store_bookstore',
    name: 'Book Haven Store',
    vertical: 'books',
    categoryLabel: 'Books & Literature',
    subdomain: 'bookstore.gojulex.com',
    customDomain: 'bookstore.in',
    status: 'active',
    tier: '6-Month Direct Launch (0% Fee)',
    planPrice: 18000,
    planInterval: '6 Months',
    planStatus: 'Paid',
    renewalDate: '2027-03-01',
    trialDaysRemaining: 0,
    currency: 'INR',
    city: 'Chennai, Tamil Nadu',
    ownerName: 'Abinaya',
    ownerEmail: 'bookstore@merchant.com',
    ownerPhone: '+91 98765 43210',
    ownerAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
    is2FAEnabled: true,
    gstin: '33AABCB5678A1Z9',
    address: '56, Gandhi Nagar, Chennai, Tamil Nadu - 600020',
    logo: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'store_ramstshirt',
    name: "RAM'S T-SHIRT STORE",
    vertical: 'clothes',
    categoryLabel: 'Premium T-Shirts & Apparel',
    subdomain: 'ramstshirt.gojulex.com',
    customDomain: 'ramstshirt.in',
    status: 'active',
    tier: '6-Month Direct Launch (0% Fee)',
    planPrice: 18000,
    planInterval: '6 Months',
    planStatus: 'Paid',
    renewalDate: '2027-03-01',
    trialDaysRemaining: 0,
    currency: 'INR',
    city: 'Chennai, Tamil Nadu',
    ownerName: 'Ram',
    ownerEmail: 'ramstshirt@merchant.com',
    ownerPhone: '+91 98765 43210',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is2FAEnabled: true,
    gstin: '33AABCR1234T1Z8',
    address: '128 Heritage Avenue, Studio Lane, Chennai, Tamil Nadu - 600001',
    logo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80'
  }
];

export const INITIAL_PRODUCTS_BY_STORE = {
  store_ramstshirt: [
    {
      id: 'prod_ram_white_tshirt',
      name: 'WHITE T-SHIRT (240 GSM Heavyweight Cotton)',
      brand: "RAM'S T-SHIRT STORE",
      category: 'Fashion & Apparel',
      productType: 'T-Shirts & Polos',
      price: 2499,
      sellingPriceINR: 2200,
      comparePriceINR: 2499,
      discountPercent: 12,
      stock: 10,
      stockQuantity: 10,
      status: 'Available',
      sku: 'RAM-TEE-WHT-01',
      description: 'Crafted from 100% Super-Combed Pima Cotton with high-density ribbed crew collar. Pre-shrunk, bio-washed, and tailored with an effortless contemporary oversized drape.',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
      ],
      hasVariants: false,
      optionSets: [],
      availableSizes: [],
      availableColors: [],
      specs: {
        Fabric: '100% Super-Combed Compact Cotton',
        Weight: '240 GSM Heavyweight Knit',
        Fit: 'Relaxed Drop-Shoulder Oversized Silhouette',
        Care: 'Machine wash cold inside out. Tumble dry low.'
      }
    }
  ],
  store_bookstore: [],
  store_abisjewel: [],
  store_luxestudio: []
};
INITIAL_PRODUCTS_BY_STORE['ramstshirt'] = INITIAL_PRODUCTS_BY_STORE.store_ramstshirt;
INITIAL_PRODUCTS_BY_STORE['ramstshirtstore'] = INITIAL_PRODUCTS_BY_STORE.store_ramstshirt;

export const INITIAL_ORDERS_BY_STORE = {
  store_ramstshirt: [],
  store_abisjewel: [],
  store_luxestudio: [],
  store_bookstore: []
};

export const INITIAL_CUSTOMERS_BY_STORE = {
  store_ramstshirt: [],
  store_abisjewel: [],
  store_luxestudio: [],
  store_bookstore: []
};

export const INITIAL_DISCOUNTS = [];

export const SALES_CHANNELS_CONFIG = [
  {
    id: 'channel_web',
    name: 'Online Storefront',
    type: 'online_store',
    status: 'connected',
    statusLabel: 'Live & Accepting Orders',
    urlOrHandle: 'aurajewels.in',
    lastSynced: 'Live Sync',
    icon: 'Globe',
    features: [
      'Custom Domain Connected (aurajewels.in)',
      '0% Platform Fee Payment Gateway',
      'Instant UPI, Cards & NetBanking'
    ]
  },
  {
    id: 'channel_whatsapp',
    name: 'WhatsApp Business',
    type: 'whatsapp',
    status: 'connected',
    statusLabel: '1-Click Checkout Active',
    urlOrHandle: '+91 98201 54321',
    lastSynced: '2 mins ago',
    icon: 'MessageSquare',
    features: [
      'Interactive Product Catalog & Cart',
      'WhatsApp UPI Direct Payment Link',
      'Automated Order Tracking Dispatch'
    ]
  },
  {
    id: 'channel_instagram',
    name: 'Instagram & Facebook Shop',
    type: 'instagram',
    status: 'connected',
    statusLabel: 'Meta Catalog API Synced',
    urlOrHandle: '@aurajewels_official',
    lastSynced: '15 mins ago',
    icon: 'Instagram',
    features: [
      'Direct Product Tagging in Reels & Posts',
      'Meta Commerce Manager Real-time Stock Sync'
    ]
  },
  {
    id: 'channel_pos',
    name: 'In-Store POS & QR Counter',
    type: 'pos',
    status: 'connected',
    statusLabel: 'Counter Checkout Ready',
    urlOrHandle: 'Jaipur Flagship Counter 1',
    lastSynced: 'Just now',
    icon: 'Store',
    features: [
      'Dynamic UPI QR Standee Generator',
      'Thermal Receipt & Invoice Printing'
    ]
  }
];
