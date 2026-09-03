/**
 * Initial Seed Data for GO JULEX (0% Platform Fee D2C Commerce SaaS)
 * Currency: Indian Rupees (INR ₹)
 */

export const GOJULEX_SAAS_PLANS = [
  {
    id: 'plan-6mo',
    name: 'Starter D2C Tier',
    duration: '6 Months',
    months: 6,
    priceINR: 4999,
    effectiveMonthlyINR: 833,
    platformFee: '0%',
    badge: 'Popular for Emerging Artisans',
    description: 'Perfect for independent artisans and boutique creators launching their direct-to-consumer store with 0% sales commission.',
    features: [
      '0% Platform & Transaction Fees (Keep 100% of revenue)',
      'Unlimited Product Listings & Rich Media Galleries',
      'Direct-to-Consumer Custom Storefront & Subdomain',
      'Instant UPI, QR, Card & Bank Escrow Integration',
      'Real-Time Order Fulfillment & Tracking Dashboard',
      'Customer Reviews & Privilege Voucher Engine',
      'Standard Courier & Shipping Rate Calculator',
      'Standard Email & Community Support'
    ],
    isPopular: false
  },
  {
    id: 'plan-1yr',
    name: 'Growth Merchant Tier',
    duration: '1 Year (Annual)',
    months: 12,
    priceINR: 8999,
    effectiveMonthlyINR: 750,
    platformFee: '0%',
    badge: 'Best Value • 0% Commission',
    savingsBadge: 'Save ₹1,000 vs Semi-Annual',
    description: 'Ideal for scaling independent brands and established craft studios seeking maximum margins and full brand control.',
    features: [
      '0% Platform & Transaction Fees (Keep 100% of revenue)',
      'Everything in Starter Tier + Unlimited Products',
      'Custom Domain Connection (yourbrand.com)',
      'Priority Pan-India Courier API Sync & Waybill Generation',
      'Advanced Sales & Revenue Retention Analytics',
      'Automated Inventory Low-Stock Alerts',
      'Custom Promotional Campaign & Discount Engine',
      'Dedicated Merchant Success Concierge (24/7 Support)'
    ],
    isPopular: true
  },
  {
    id: 'plan-2yr',
    name: 'Artisan Enterprise Tier',
    duration: '2 Years (Biennial)',
    months: 24,
    priceINR: 14999,
    effectiveMonthlyINR: 625,
    platformFee: '0%',
    badge: 'Maximum ROI for Scaling D2C',
    savingsBadge: 'Save ₹3,000 Extra',
    description: 'For high-volume artisan guilds, premium designer houses, and multi-category D2C sellers demanding maximum operational leverage.',
    features: [
      '0% Platform & Transaction Fees Forever',
      'Multi-Brand & Multi-Store Management Console',
      'White-Glove VIP Armored Courier Logistics Setup',
      'Omnichannel Inventory & POS Synchronization',
      'Custom API & Webhook Access for ERP / WMS',
      'Exclusive Featured Creator Spotlight on Go Julex Homepage',
      'Dedicated Senior Account Manager & SLA Guarantee'
    ],
    isPopular: false
  }
];

export const LUXURY_BRANDS = [
  'Aether Studio',
  'Kashmir Loom & Leather',
  'Saffron Heritage Jewels',
  'Atelier Vesper Audio',
  'Nordic Craft Living',
  'Urban Khadi Apparel',
  'Kyoto Minimalist Ceramics',
  'Solstice Fine Fragrances'
];

export const WATCH_MOVEMENTS = [
  'Generational Master Craftsmanship',
  'Hand-Turned Solid Wood & Joinery',
  'Handloom Pit Loom Silk & Organic Weave',
  'High-Beat Automatic Horology',
  'Hand-Thrown Wood-Fired Stoneware',
  'Artisan Small-Batch Botanical Distillation'
];

export const WATCH_CATEGORIES = [
  'Artisan Leather & Goods',
  'Boutique Timepieces & Jewels',
  'Sustainable Apparel',
  'Studio Audio & Tech',
  'Handcrafted Living & Decor'
];

export const PRESET_WATCH_IMAGES = [
  {
    name: 'Full-Grain Artisan Leather Weekender',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Aether Chrono Minimalist Automatic Watch',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Handcrafted Heritage Royal Silk Kurta',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Atelier Vesper Solid Walnut Audiophile Speakers',
    url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Saffron Heritage Polki Diamond Solitaire Pendant',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Kyoto Wabi-Sabi Hand-Thrown Ceramic Tea Set',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Nordic Cast Iron & Oak Tabletop Lamp',
    url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Solstice Botanical Extrait de Parfum (100ml)',
    url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Heritage Full-Grain Leather Weekender Duffel',
    brand: 'Kashmir Loom & Leather',
    category: 'Artisan Leather & Goods',
    price: 18500,
    discountPercent: 10,
    stock: 12,
    sku: 'KLL-DUFFEL-01',
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    description: 'Handcrafted by generational master tanners using vegetable-tanned full-grain leather, solid brass hardware, and heavy-duty YKK Excella zippers. Built for lifelong journeys with 0% platform markup direct from the maker.',
    specs: {
      Material: '100% Vegetable-Tanned Full-Grain Leather',
      Hardware: 'Hand-Forged Solid Antique Brass',
      Capacity: '45 Litres (Cabin-Friendly Dimensions)',
      Lining: 'Heavyweight Water-Resistant Cotton Canvas',
      Origin: 'Srinagar Craft Guild, India',
      Warranty: 'Lifetime Craftsmanship Guarantee'
    },
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: [
      {
        id: 'rev-001',
        authorName: 'Vikramaditya Roy',
        rating: 5,
        comment: 'Outstanding quality and rich patina. Buying direct from the Kashmir workshop saved me thousands compared to luxury retail brands.',
        createdAt: '2026-08-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'prod-002',
    name: 'Aether Chrono Minimalist Automatic Sapphire Watch',
    brand: 'Aether Studio',
    category: 'Boutique Timepieces & Jewels',
    price: 42000,
    discountPercent: 15,
    stock: 8,
    sku: 'AET-AUTO-40',
    rating: 4.8,
    reviewsCount: 29,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    description: 'Independent boutique horology powered by a high-beat automatic movement with 42-hour power reserve, double-domed anti-reflective sapphire crystal, and 316L medical-grade steel.',
    specs: {
      Movement: 'Calibre AET-2824 Hi-Beat Automatic (28,800 vph)',
      Case: '316L Brushed Medical Stainless Steel (40mm)',
      Crystal: 'Double-Domed AR-Coated Sapphire',
      Strap: 'Hand-Stitched Horween Chromexcel Leather',
      WaterResistance: '100 Metres (10 ATM)',
      PowerReserve: '42 Hours'
    },
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: []
  },
  {
    id: 'prod-003',
    name: 'Vesper Acoustic Walnut Studio Monitors (Pair)',
    brand: 'Atelier Vesper Audio',
    category: 'Studio Audio & Tech',
    price: 34999,
    discountPercent: 0,
    stock: 5,
    sku: 'VSP-MONITOR-02',
    rating: 5.0,
    reviewsCount: 19,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    description: 'Handcrafted solid American walnut bookshelf monitors tuned for reference clarity. Features custom silk-dome tweeters, Kevlar bass drivers, and class-D audiophile amplification with Bluetooth 5.2 aptX-HD.',
    specs: {
      Cabinet: 'Solid American Walnut with CNC Acoustical Bracing',
      Amplifier: '120W RMS Dual Class-D Discrete Amp',
      Drivers: '5.25" Woven Kevlar Woofer + 1" Silk Dome Tweeter',
      FrequencyResponse: '45Hz - 22,000Hz (±2dB Reference Tuned)',
      Connectivity: 'Optical, RCA Line, USB-C DAC & aptX-HD Bluetooth',
      Craftsmanship: 'Hand-Oiled Satin Finish in Bengaluru Studio'
    },
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: []
  },
  {
    id: 'prod-004',
    name: 'Saffron Heritage Polki Solitaire Choker Necklace',
    brand: 'Saffron Heritage Jewels',
    category: 'Boutique Timepieces & Jewels',
    price: 125000,
    discountPercent: 12,
    stock: 3,
    sku: 'SHJ-POLKI-09',
    rating: 5.0,
    reviewsCount: 14,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    description: 'Hand-set uncut Polki diamonds and Zambian emerald beads set in hallmarked 18K gold foil bezel. Handcrafted by Jaipur master karigars under our 0% markup direct artisan program.',
    specs: {
      Purity: '18K Hallmarked Yellow Gold (BIS Certified)',
      Gemstones: 'Natural Uncut Polki Diamonds & AAA Zambian Emeralds',
      Setting: 'Traditional Jadau Foil Setting',
      Weight: '42.5 Grams Gross Weight',
      Origin: 'Johari Bazaar Atelier, Jaipur',
      Packaging: 'Hand-Carved Velvet Luxury Treasure Box'
    },
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: []
  },
  {
    id: 'prod-005',
    name: 'Mulberry Silk Handwoven Jamdani Kurta & Trousers',
    brand: 'Urban Khadi Apparel',
    category: 'Sustainable Apparel',
    price: 14500,
    discountPercent: 10,
    stock: 15,
    sku: 'UKH-JAM-03',
    rating: 4.7,
    reviewsCount: 31,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    description: 'Woven on traditional pit looms in Bengal using 100% handspun organic Mulberry silk and natural plant dyes. Breathable, feather-light, and tailored for modern celebrations.',
    specs: {
      Weave: 'Authentic 100-Count Handloom Jamdani Weave',
      Fabric: '100% Certified Organic Mulberry Silk',
      Dyeing: 'Natural Indigo & Madder Root Botanical Dyes',
      Fit: 'Contemporary Relaxed Luxury Silhouette',
      Care: 'Gentle Dry Clean Only',
      ArtisanCommunity: 'Phulia Weavers Collective, West Bengal'
    },
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: []
  },
  {
    id: 'prod-006',
    name: 'Kyoto Wabi-Sabi Stoneware Gongfu Tea Set',
    brand: 'Kyoto Minimalist Ceramics',
    category: 'Handcrafted Living & Decor',
    price: 8900,
    discountPercent: 0,
    stock: 9,
    sku: 'KYT-TEA-07',
    rating: 4.9,
    reviewsCount: 22,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    description: 'Wood-fired stoneware tea ceremony ensemble including a side-handle teapot, four matching tasting cups, and a carved black walnut drain tray. Each piece carries organic kiln variations.',
    specs: {
      Clay: 'Coarse Mineral-Rich Stoneware Clay',
      Firing: 'Anagama Wood Kiln Fired at 1,300°C for 72 Hours',
      Glaze: 'Natural Wood Ash & Iron Oxide Reactive Glaze',
      Includes: '1x 220ml Kyusu Teapot + 4x 50ml Cups + 1x Walnut Tray',
      FoodSafety: '100% Lead-Free & Microwave Safe',
      Studio: 'Kyoto Artisan Workshop & Clay Studio'
    },
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: []
  },
  {
    id: 'prod-007',
    name: 'Solstice Santal & Cardamom Extrait de Parfum (100ml)',
    brand: 'Solstice Fine Fragrances',
    category: 'Handcrafted Living & Decor',
    price: 9500,
    discountPercent: 15,
    stock: 20,
    sku: 'SOL-PERF-01',
    rating: 5.0,
    reviewsCount: 56,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    description: 'A 30% concentration extrait crafted with Mysore sandalwood oil, Malabar green cardamom, smoked vetiver, and atlas cedarwood. Blended and aged in small batches for 6 months.',
    specs: {
      Concentration: 'Extrait de Parfum (30% Pure Fragrance Oil)',
      TopNotes: 'Wild Malabar Cardamom, Pink Peppercorn, Bergamot',
      HeartNotes: 'Smoked Amber, Orris Root, Tuscan Leather',
      BaseNotes: 'Mysore Sandalwood, Haitian Vetiver, Oakmoss',
      Maceration: '6-Month Cellar Aging in Dark Oak Vats',
      Bottle: 'Heavy Weighted French Glass with Magnetic Cap'
    },
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: []
  },
  {
    id: 'prod-008',
    name: 'Nordic Brass & Smoked Oak Minimalist Tabletop Lamp',
    brand: 'Nordic Craft Living',
    category: 'Handcrafted Living & Decor',
    price: 16800,
    discountPercent: 10,
    stock: 7,
    sku: 'NCL-LAMP-04',
    rating: 4.8,
    reviewsCount: 18,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    description: 'Spun solid brass dome paired with a lathe-turned smoked European oak base. Features warm dim-to-warm LED integration with touch brass capacitive dimmer.',
    specs: {
      Materials: 'Spun Solid Brass & Smoked European Oak Wood',
      LightSource: 'Integrated Dim-to-Warm LED (2200K - 2700K)',
      Control: '3-Step Capacitive Touch Brass Sensor',
      Power: 'USB-C Braided Fabric Cable with Dual 12W Adapter',
      Dimensions: 'Height: 34cm | Shade Diameter: 24cm',
      Designer: 'Studio Nordic, Copenhagen & Pondicherry'
    },
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    reviews: []
  }
];

export const INITIAL_COUPONS = [
  {
    id: 'coup-001',
    code: 'GOJULEX10',
    description: 'Welcome to Go Julex: 10% Direct-from-Maker Privilege',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 15000,
    isActive: true
  },
  {
    id: 'coup-002',
    code: 'FREESHIP',
    description: 'Complimentary Insured Express Delivery across India',
    discountType: 'FIXED',
    discountValue: 1500,
    minOrderAmount: 5000,
    maxDiscountAmount: null,
    isActive: true
  },
  {
    id: 'coup-003',
    code: 'ARTISAN5000',
    description: 'Flat ₹5,000 Off on Handcrafted Orders over ₹50,000',
    discountType: 'FIXED',
    discountValue: 5000,
    minOrderAmount: 50000,
    maxDiscountAmount: null,
    isActive: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-98210',
    orderNumber: 'GJ-98210-EXP',
    customerName: 'Aarav Sharma',
    customerEmail: 'customer@luxury.com',
    customerPhone: '+91 98450 12345',
    date: '2026-08-24T14:20:00Z',
    status: 'Dispatched',
    totalAmount: 18500,
    deliveryMethod: 'Express Insured Courier',
    paymentMethod: 'Instant UPI (Zero Platform Fee)',
    trackingNumber: 'GJ-IN-98210-BLUEDART',
    items: [
      {
        id: 'prod-001',
        name: 'Heritage Full-Grain Leather Weekender Duffel',
        brand: 'Kashmir Loom & Leather',
        price: 18500,
        discountPercent: 10,
        finalPrice: 16650,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    shippingAddress: {
      fullName: 'Aarav Sharma',
      street: '42, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560038',
      country: 'India'
    }
  }
];
