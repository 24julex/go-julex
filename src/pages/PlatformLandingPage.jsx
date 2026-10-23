import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ============================================================================
// GO JULEX PLATFORM LANDING — exact-UI port of the attached "Luminous Amber"
// redesign. Fixed glass header, live storefront simulator (4 preset stores ×
// dual/desktop/mobile viewports), template studio, DNS guide, claim bar and
// glass footer. Every CTA routes into the real auth flows (/admin/login).
// ============================================================================

const Mat = ({ children, className = '' }) => <span className={`lp-mat ${className}`}>{children}</span>;

const STORES = {
  botanicals: {
    label: 'Solstice Botanicals', icon: '🌿', domain: 'www.solstice-botanicals.in',
    logoText: 'SB', title: 'Solstice Botanicals & Wellness', tagline: 'Artisanal Fine Herbal Apothecary',
    bannerPill: 'Seasonal Small-Batch Harvest',
    bannerTitle: 'Pure Royal Kashmiri Saffron & Cold-Pressed Botanical Elixir',
    bannerDesc: 'Handpicked single-estate wellness botanicals with 100% transparency. Directly packed at source with no middleman margins.',
    bannerBtn: 'Shop Harvest 2025', bagCount: '2 Items', bagTotal: '₹3,450',
    mobBanner: '1-Tap WhatsApp Checkout Enabled',
    products: [
      { cat: 'Harvest Reserve', name: 'Golden Saffron Elixir 50ml', desc: 'Pure Mogra saffron strands infused with sweet almond & vetiver extract.', price: '₹1,890', oldPrice: '₹2,400', badge: 'FREE SHIPPING', img: '/theme-images/organic-1.webp' },
      { cat: 'Vedic Restorative', name: 'Nilgiri Herbal Face Oil', desc: 'Wildcrafted cold-pressed botanical drops for daily skin rejuvenation.', price: '₹1,560', oldPrice: '', badge: 'BESTSELLER', img: '/theme-images/tea-2.jpg' },
      { cat: 'Artisan Keepsake', name: 'Botanical Brass Vanity Set', desc: 'Carved solid brass handcrafted box for storing rare salts.', price: '₹2,490', oldPrice: '', badge: 'LOW STOCK', img: '/theme-images/craft-1.webp' }
    ]
  },
  jewels: {
    label: 'Aura Heritage Jewels', icon: '✨', domain: 'www.auraheritage-jewels.in',
    logoText: 'AH', title: 'Aura Heritage Jewels Atelier', tagline: 'Handcrafted Polki & 22k Temple Gold',
    bannerPill: 'Bridal Atelier 2025 Release',
    bannerTitle: 'Handcrafted Royal Polki & Emerald Temple Heritage Sets',
    bannerDesc: 'Bespoke heirlooms meticulously crafted by generational master karigars in Jaipur & Bikaner.',
    bannerBtn: 'Explore Bridal Collection', bagCount: '1 Heirloom', bagTotal: '₹14,850',
    mobBanner: 'Direct WhatsApp Concierge & Custom Sizing',
    products: [
      { cat: 'Temple Jewellery', name: 'Imperial Polki Choker Necklace', desc: 'Uncut real emerald and ruby cabochon setting on micro-engraved 22k gold foil.', price: '₹12,400', oldPrice: '₹15,000', badge: 'ATELIER', img: '/theme-images/jewelry-1.jpg' },
      { cat: 'Bridal Release', name: 'Maharani Emerald Jhumkas', desc: 'Studded polki jhumkas with cascade pearls and temple pillars.', price: '₹8,950', oldPrice: '', badge: 'NEW', img: '/theme-images/jewelry-2.jpg' },
      { cat: 'Heirloom', name: 'Royal Kundan Bangle Pair', desc: 'Hand-set kundan on lac core with meenakari enamel interiors.', price: '₹6,200', oldPrice: '', badge: 'LOW STOCK', img: '/theme-images/jewelry-3.jpg' }
    ]
  },
  pantry: {
    label: 'Vedic Pantry', icon: '🌾', domain: 'www.vedic-pantry.in',
    logoText: 'VP', title: 'Vedic Pantry & Ancient Grains', tagline: 'Single-Origin Millets & Cold-Pressed Oils',
    bannerPill: 'Farm-Direct Harvest 2025',
    bannerTitle: 'Heirloom Millets, Forest Honey & Wood-Pressed Oils',
    bannerDesc: 'Sourced directly from 27 partner farms across the Western Ghats with full traceability.',
    bannerBtn: 'Shop Farm Harvest', bagCount: '3 Items', bagTotal: '₹1,180',
    mobBanner: '1-Tap WhatsApp Checkout Enabled',
    products: [
      { cat: 'Ancient Grains', name: 'Barnyard Millet 1kg', desc: 'Unpolished, gluten-free barnyard millet with low glycemic index.', price: '₹240', oldPrice: '₹310', badge: 'FARM DIRECT', img: '/theme-images/tea-1.jpg' },
      { cat: 'Forest Harvest', name: 'Wild Jamun Honey 350g', desc: 'Raw, unfiltered single-flora honey from Satpura forest hives.', price: '₹520', oldPrice: '', badge: 'BESTSELLER', img: '/theme-images/tea-3.jpg' },
      { cat: 'Wood-Pressed', name: 'Cold-Pressed Groundnut Oil 1L', desc: 'Traditional wooden ghani pressed, unrefined and chemical free.', price: '₹420', oldPrice: '', badge: 'NEW', img: '/theme-images/tea-4.jpg' }
    ]
  },
  couture: {
    label: 'Haute Couture', icon: '👗', domain: 'www.maison-couture.in',
    logoText: 'MC', title: 'Maison Élevé Couture House', tagline: 'Made-to-Measure Luxury Atelier',
    bannerPill: 'Runway Series 2025',
    bannerTitle: 'Made-to-Measure Silk Gowns & Handloom Couture',
    bannerDesc: 'Limited seasonal drops, hand-finished by master tailors with natural silk and Khadi fabrics.',
    bannerBtn: 'Book A Fitting', bagCount: '1 Piece', bagTotal: '₹22,900',
    mobBanner: 'Private Styling Concierge on WhatsApp',
    products: [
      { cat: 'Runway Series', name: 'Ivory Chanderi Silk Gown', desc: 'Handloom chanderi with zari border and bias-cut drape.', price: '₹14,800', oldPrice: '₹18,000', badge: 'RUNWAY', img: '/theme-images/fashion-1.png' },
      { cat: 'Atelier Made', name: 'Khadiwrap Trench Coat', desc: 'Double-twist khadi trench with corozo buttons.', price: '₹8,400', oldPrice: '', badge: 'ATELIER', img: '/theme-images/fashion-2.jpg' },
      { cat: 'Occasion', name: 'Rose Raw-Silk Lehenga', desc: 'Minimal handloom lehenga with gota hand embroidery.', price: '₹12,600', oldPrice: '', badge: 'MADE TO ORDER', img: '/theme-images/fashion-3.jpg' }
    ]
  }
};
const STORE_KEYS = Object.keys(STORES);

const Nav = ({ onStart }) => (
  <header className="fixed top-0 left-0 right-0 w-full z-50 px-4 sm:px-8 py-3.5">
    <div className="max-w-7xl mx-auto lp-glass-card rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl lp-gold-btn text-white font-black text-sm flex items-center justify-center">GJ</span>
          <span className="font-black text-lg sm:text-xl tracking-tight text-[#1F1608]" style={{ fontFamily: 'Outfit, sans-serif' }}>Gojulex</span>
        </Link>
        <div className="hidden xl:flex flex-col border-l border-[#B87309]/20 pl-3">
          <span className="text-[10px] tracking-wider uppercase font-bold text-[#B87309]">Bigger Ideas • Brighter Businesses Together</span>
          <span className="text-[11px] font-semibold text-[#3C2607]/80">For Growing Brands & Modern Store Owners</span>
        </div>
      </div>
      <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
        <a className="font-semibold text-sm text-[#4E391A] hover:text-[#B87309] transition-colors flex items-center gap-1" href="#pricing-plans">
          <span>Transparent Pricing</span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D88914]/15 text-[#B87309]">0% Fee</span>
        </a>
        <a className="font-semibold text-sm text-[#4E391A] hover:text-[#B87309] transition-colors" href="#simulation-stage">Store Showcase</a>
        <a className="font-semibold text-sm text-[#4E391A] hover:text-[#B87309] transition-colors" href="#template-studio">Platform Features</a>
        <a className="font-semibold text-sm text-[#4E391A] hover:text-[#B87309] transition-colors" href="#dns-guide">Custom Domains</a>
        <a className="font-semibold text-sm text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5 bg-green-50/80 px-2.5 py-1 rounded-full border border-green-200" href="https://wa.me/919940415353" target="_blank" rel="noreferrer">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>WhatsApp Help</span>
        </a>
      </nav>
      <div className="flex items-center gap-3">
        <button onClick={onStart} className="lp-gold-btn text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full flex items-center gap-2 whitespace-nowrap shadow-md cursor-pointer">
          <span>Start Store Today</span>
          <Mat className="text-[17px]">arrow_forward</Mat>
        </button>
        <a className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#FDF3E1] border border-[#D88914]/30 text-[#3C2607] hover:bg-[#D88914]/20 transition-colors" href="tel:9940415353" title="Call Us Directly">
          <Mat className="text-[18px]">call</Mat>
        </a>
      </div>
    </div>
  </header>
);

const StoreSurface = ({ store, compact }) => (
  <div className="bg-white">
    {/* header */}
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 py-3 border-b border-slate-200 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl lp-gold-btn text-white font-black text-sm flex items-center justify-center">{store.logoText}</div>
        <div>
          <div className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight tracking-tight">{store.title}</div>
          <div className="text-[10px] font-bold text-[#8C5202] uppercase tracking-wider">{store.tagline}</div>
        </div>
      </div>
      {!compact && (
        <div className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-700">
          <span className="text-[#B87309] font-extrabold">Featured</span>
          <span className="hover:text-[#B87309] cursor-pointer">Collections</span>
          <span className="hover:text-[#B87309] cursor-pointer">Origin Story</span>
          <span className="flex items-center gap-1 text-emerald-700"><Mat className="text-[14px]">chat</Mat> WhatsApp Order</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 bg-[#FFF6E3] border border-[#D88914]/30 rounded-xl px-2.5 py-1.5">
        <Mat className="text-[15px] text-[#B87309]">shopping_bag</Mat>
        <div className="leading-none text-left">
          <div className="text-[9px] font-bold text-slate-500">{store.bagCount}</div>
          <div className="text-[11px] font-black text-slate-900">{store.bagTotal}</div>
        </div>
      </div>
    </div>
    {/* banner */}
    <div className="px-5 py-5 bg-gradient-to-br from-[#FFF9ED] to-[#FDF3E1]">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-[#D88914]/25 text-[10px] font-extrabold text-[#3C2607] uppercase tracking-wider mb-2.5">
        <Mat className="text-[13px] text-[#D88914]">auto_awesome</Mat> {store.bannerPill}
      </div>
      <div className={`font-black text-slate-900 leading-tight tracking-tight ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}>{store.bannerTitle}</div>
      <p className={`text-slate-600 font-medium mt-1.5 ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>{store.bannerDesc}</p>
      <div className="flex items-center gap-2 mt-3">
        <button className="lp-gold-btn text-white text-[11px] font-black px-4 py-2 rounded-xl">{store.bannerBtn}</button>
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700"><Mat className="text-[14px]">verified</Mat> 0% Commission Store</span>
      </div>
    </div>
    {/* products */}
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-black text-slate-900 uppercase tracking-wider">Featured Products</div>
        <div className="text-[10px] font-bold text-[#B87309]">View All →</div>
      </div>
      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {store.products.map((p) => (
          <div key={p.name} className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-lg transition-shadow">
            <div className="relative">
              <img src={p.img} alt={p.name} className="w-full aspect-square object-cover" loading="lazy" />
              {p.badge && <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">{p.badge}</span>}
            </div>
            <div className="p-2.5">
              <div className="text-[9px] font-extrabold text-[#B87309] uppercase tracking-wider">{p.cat}</div>
              <div className="text-[11px] font-black text-slate-900 leading-snug mt-0.5">{p.name}</div>
              <p className="text-[9px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{p.desc}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs font-black text-slate-900">{p.price}</span>
                {p.oldPrice && <span className="text-[10px] text-slate-400 line-through">{p.oldPrice}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* footer strip */}
    <div className="px-5 py-3 border-t border-slate-200 bg-[#FFF9ED] flex items-center justify-between">
      <span className="text-[10px] font-bold text-[#3C2607]">Powered by <span className="font-black text-[#B87309]">Gojulex</span> • 0% Commission</span>
      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700"><Mat className="text-[13px]">lock</Mat> SSL Secured</span>
    </div>
  </div>
);

export const PlatformLandingPage = () => {
  const navigate = useNavigate();
  const [storeKey, setStoreKey] = useState('botanicals');
  const [view, setView] = useState('dual');
  const [domain, setDomain] = useState('www.solstice-botanicals.in');
  const [claim, setClaim] = useState('');
  const [claimed, setClaimed] = useState(false);
  const store = STORES[storeKey];

  const switchStore = (k) => { setStoreKey(k); setDomain(STORES[k].domain); };
  const cycle = (d) => {
    const i = STORE_KEYS.indexOf(storeKey);
    const next = STORE_KEYS[(i + d + STORE_KEYS.length) % STORE_KEYS.length];
    switchStore(next);
  };
  const start = () => navigate('/admin/login');

  return (
    <div className="bg-gradient-to-b from-[#FFF9ED] via-[#FDF3E1] to-[#FAF0DD] text-[#2C2112] font-sans antialiased selection:bg-[#F5A623]/30 min-h-screen relative overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* glowing orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#FFE3A8]/60 via-[#FDD383]/40 to-transparent blur-3xl" />
        <div className="absolute top-[28%] -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-[#F6BA47]/30 via-[#FFE8B8]/40 to-transparent blur-3xl" />
        <div className="absolute bottom-[-200px] left-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#F5A623]/25 via-[#FFE8B8]/30 to-transparent blur-3xl" />
      </div>

      <Nav onStart={start} />

      <main className="relative z-10 pt-28 sm:pt-32 pb-16 flex flex-col w-full">
        {/* HERO + SIMULATOR CONSOLE */}
        <section className="relative px-4 sm:px-8 py-6 sm:py-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#D88914]/30 shadow-sm backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 -ml-5" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3C2607]">LIVE STOREFRONT SIMULATOR • MULTI-CLIENT SLIDER</span>
              <span className="text-amber-300">|</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1"><Mat className="text-[15px]">verified</Mat> 0% Commission Guaranteed</span>
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-[#4E391A] bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-amber-200/60 backdrop-blur-md">
              <span className="flex items-center gap-1 text-emerald-700"><Mat className="text-[16px]">speed</Mat> 99/100 Core Web Vitals</span>
              <span className="text-amber-200">|</span>
              <span className="flex items-center gap-1 text-[#B87309]"><Mat className="text-[16px]">bolt</Mat> Sub-200ms Global Edge</span>
              <span className="text-amber-200">|</span>
              <span className="flex items-center gap-1 text-[#3C2607] font-bold"><Mat className="text-[16px] text-green-600">call</Mat> 99404 15353</span>
            </div>
          </div>

          <div className="max-w-4xl space-y-3 mb-8">
            <h1 className="text-3xl sm:text-5xl font-black text-[#1F1608] tracking-tight leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Experience Your Brand Storefront <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#B87309] via-[#D88914] to-[#A56303] bg-clip-text text-transparent">Across Every Screen in High Definition</span>
            </h1>
            <p className="text-base sm:text-lg text-[#5C4524] max-w-3xl leading-relaxed font-medium">
              Preview how your independent boutique renders with crystal-clear contrast, lightning instant WhatsApp 1-tap ordering, auto-issued SSL, and zero commissions. Slide across distinct live store themes below:
            </p>
          </div>

          {/* console */}
          <div className="lp-glass-card rounded-3xl p-4 sm:p-6 shadow-xl relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/95 p-2 rounded-2xl border border-[#D88914]/30">
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 whitespace-nowrap">
                  <Mat className="text-[17px] text-emerald-600">lock</Mat> HTTPS Secured
                </div>
                <div className="flex-1 flex items-center gap-1 px-2">
                  <span className="text-xs font-bold text-[#8C7654]">https://</span>
                  <input value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full bg-transparent text-sm sm:text-base font-extrabold text-[#111827] focus:outline-none py-1 border-0" placeholder="yourstore.com" type="text" />
                </div>
                <div className="flex items-center gap-1 px-2 text-xs font-bold text-[#B87309] whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Edge DNS Live
                </div>
              </div>
              <div className="lg:col-span-7 flex flex-wrap items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#735A36] tracking-wider mr-1 hidden sm:flex">
                  <Mat className="text-[18px] text-[#D88914]">store</Mat> Select Preset Store:
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STORE_KEYS.map((k) => (
                    <button key={k} onClick={() => switchStore(k)} className={`lp-store-btn px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${storeKey === k ? 'lp-store-btn-active' : 'bg-white hover:bg-amber-50 text-[#3B2912] border border-amber-200/80 shadow-xs'}`}>
                      <span>{STORES[k].icon}</span> {STORES[k].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#D88914]/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-[#FFF6E3] px-3 py-1 rounded-xl border border-[#D88914]/30">
                  <button onClick={() => cycle(-1)} aria-label="Previous Storefront" className="w-6 h-6 rounded-lg bg-white text-[#3C2607] hover:bg-[#D88914] hover:text-white transition-colors flex items-center justify-center shadow-xs cursor-pointer"><Mat className="text-[15px]">arrow_back</Mat></button>
                  <div className="text-xs font-extrabold text-[#1F1608] flex items-center gap-1.5">
                    <span className="text-[#B87309] font-bold">Simulating:</span>
                    <span className="text-emerald-900 font-extrabold underline decoration-[#D88914]">{store.label}</span>
                  </div>
                  <button onClick={() => cycle(1)} aria-label="Next Storefront" className="w-6 h-6 rounded-lg bg-white text-[#3C2607] hover:bg-[#D88914] hover:text-white transition-colors flex items-center justify-center shadow-xs cursor-pointer"><Mat className="text-[15px]">arrow_forward</Mat></button>
                </div>
                <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-[#735A36]">(Click arrows or tabs to switch live storefront theme)</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#735A36] uppercase tracking-wider hidden sm:inline">Viewport:</span>
                <div className="inline-flex p-1 bg-white/90 rounded-xl border border-amber-200/70 shadow-xs">
                  {([['dual', 'view_quilt', 'Dual Screen'], ['desktop', 'laptop_mac', 'Desktop iMac'], ['mobile', 'phone_iphone', 'iPhone 16 Pro']].map(([m, icon, label]) => (
                    <button key={m} onClick={() => setView(m)} className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${view === m ? 'bg-[#FAF0DD] text-[#2C2112] shadow-xs' : 'text-[#685233] hover:text-[#1F1608]'}`}>
                      <Mat className="text-[16px]">{icon}</Mat> {label}
                    </button>
                  )))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEVICE STAGE */}
        <section id="simulation-stage" className="relative px-4 sm:px-8 py-4 max-w-7xl mx-auto w-full">
          <div className="relative">
            <div className="lp-float-chip absolute -top-5 right-6 sm:right-12 z-30 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Mat className="text-[18px]">payments</Mat></div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Direct Merchant Settlement</div>
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">₹1,50,000 Sales = ₹0 Gojulex Fee <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">100% Retained</span></div>
              </div>
            </div>
            <div className="lp-float-chip lp-float-chip-rev absolute -bottom-5 left-4 sm:left-12 z-30 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center"><Mat className="text-[18px]">chat</Mat></div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fast 1-Tap Checkout</div>
                <div className="text-xs font-black text-slate-900">Pre-filled WhatsApp Cart • Zero Cart Drops</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* desktop frame */}
              {(view === 'dual' || view === 'desktop') && (
                <div className={`w-full transition-all ${view === 'dual' ? 'lg:col-span-8' : 'lg:col-span-12 max-w-5xl mx-auto'}`}>
                  <div className="bg-gradient-to-b from-[#1F1912] to-[#120E0A] p-3 sm:p-4 rounded-[28px] border-4 border-[#3D3222] relative overflow-hidden" style={{ boxShadow: '0 30px 70px -15px rgba(216,137,20,0.28), 0 15px 35px -5px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.95)' }}>
                    <div className="flex items-center justify-between px-3 py-2 bg-[#2D2318] rounded-2xl mb-3 text-xs text-[#E5D2BA] border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#FF5F56]" /><span className="w-3 h-3 rounded-full bg-[#FFBD2E]" /><span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-[#140F0A] px-4 py-1.5 rounded-xl flex-1 max-w-md mx-3 border border-amber-900/40">
                        <Mat className="text-[14px] text-emerald-400">lock</Mat>
                        <span className="font-mono text-xs font-bold text-white tracking-wide truncate">https://{domain}</span>
                        <span className="bg-[#D88914] text-white text-[9px] font-black px-1.5 py-0.5 rounded">0% COMM</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#CBB499]">
                        <Mat className="text-[16px]">share</Mat><Mat className="text-[16px] text-emerald-400">verified</Mat>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl overflow-hidden max-h-[560px] overflow-y-auto border border-slate-200">
                      <StoreSurface store={store} compact={false} />
                    </div>
                  </div>
                </div>
              )}
              {/* mobile frame */}
              {(view === 'dual' || view === 'mobile') && (
                <div className={`w-full flex ${view === 'dual' ? 'lg:col-span-4 justify-center lg:justify-end' : 'justify-center'}`}>
                  <div className="w-[300px] bg-gradient-to-b from-[#1F1912] to-[#120E0A] p-2.5 rounded-[38px] border-4 border-[#3D3222]" style={{ boxShadow: '0 30px 70px -15px rgba(216,137,20,0.28), 0 15px 35px -5px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.95)' }}>
                    <div className="bg-[#2D2318] rounded-t-[30px] px-6 py-1.5 flex justify-center">
                      <div className="w-16 h-4 bg-[#140F0A] rounded-full" />
                    </div>
                    <div className="bg-[#140F0A] mx-2 mb-1.5 px-3 py-1 rounded-lg flex items-center justify-center gap-1.5">
                      <Mat className="text-[12px] text-emerald-400">lock</Mat>
                      <span className="font-mono text-[9px] font-bold text-white truncate">{domain}</span>
                    </div>
                    <div className="bg-white rounded-b-[28px] overflow-hidden max-h-[520px] overflow-y-auto border-x border-slate-200">
                      <div className="bg-emerald-600 text-white text-center text-[10px] font-extrabold py-1.5 px-2 flex items-center justify-center gap-1">
                        <Mat className="text-[13px]">chat</Mat> {store.mobBanner}
                      </div>
                      <StoreSurface store={store} compact />
                    </div>
                    <div className="flex justify-center pt-2 pb-1">
                      <div className="w-24 h-1 bg-[#3D3222] rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TEMPLATE STUDIO */}
        <section id="template-studio" className="relative px-4 sm:px-8 py-12 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D88914]/15 text-[#3C2607] text-xs font-extrabold uppercase tracking-wider mb-2">
                <Mat className="text-[16px] text-[#B87309]">palette</Mat> Designer Template Studio
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F1608] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Architectural Storefront Themes</h2>
              <p className="text-sm text-[#5C4524] font-medium mt-1">Engineered for high conversion, tactile aesthetics, and frictionless mobile checkouts. Switch anytime with zero lock-in.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8C7654]">All themes include:</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">0% Comm.</span>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#3B2912] border border-amber-200 text-xs font-bold">Free Custom Domain</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Sovereign Glass', desc: 'Filled glassmorphic cards, luminous amber accents, and editorial typography. Perfect for luxury wellness & beauty.', active: true, tags: ['Frosted Grids', 'WhatsApp Cart', 'Razorpay Direct'] },
              { name: 'Editorial Heritage', desc: 'Serif-led magazine grids and museum captions for fine jewelry and heirloom craft stores.', active: false, tags: ['Museum Captions', 'Dual Gallery', 'Concierge'] },
              { name: 'Bazaar Pop', desc: 'Rounded bubble navigation with playful staggered grids for gifting, toys, and streetwear drops.', active: false, tags: ['Bubble Nav', 'Stagger Grid', '1-Tap Buy'] },
              { name: 'Brutalist Atelier', desc: 'Heavy black type, thick rules, and raw cropped frames for high-fashion drops and drops.', active: false, tags: ['Heavy Type', 'Raw Frames', 'Dark Mode'] }
            ].map((t) => (
              <div key={t.name} className={`${t.active ? 'lp-glass-card-popular border-2 border-[#D88914]' : 'lp-glass-card'} rounded-3xl p-5 flex flex-col justify-between relative group hover:-translate-y-1 transition-transform`}>
                {t.active && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D88914] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Mat className="text-[13px]">check_circle</Mat> Active Preview
                  </div>
                )}
                <div className="space-y-4 pt-2">
                  <div className="h-40 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FAF0DC] p-3 flex flex-col justify-between border border-[#D88914]/25 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="w-3 h-3 rounded-full bg-[#D88914]" />
                      <span className="text-[9px] font-bold text-[#3C2607] uppercase">{t.name}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-3/4 h-3 rounded bg-amber-400/30" /><div className="w-1/2 h-2 rounded bg-amber-300/20" />
                      <div className="grid grid-cols-3 gap-1 pt-1">
                        <div className="h-10 rounded bg-white/90 shadow-xs" /><div className="h-10 rounded bg-white/90 shadow-xs" /><div className="h-10 rounded bg-white/90 shadow-xs" />
                      </div>
                    </div>
                    <div className="text-right text-[10px] font-black text-emerald-700">Speed 99/100</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900">{t.name}</div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => <span key={tag} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md text-slate-700 border border-slate-200">{tag}</span>)}
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-[#D88914]/20 flex items-center justify-between">
                  <span className="text-xs font-black text-[#3C2607]">{t.active ? 'Current Theme' : 'Included Free'}</span>
                  <button disabled={t.active} onClick={start} className={`${t.active ? 'bg-white text-[#3C2607] border border-[#D88914]/40 cursor-default' : 'lp-gold-btn text-white'} text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${t.active ? '' : 'cursor-pointer'}`}>
                    {t.active ? 'Active Now' : 'Use Theme'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DNS GUIDE */}
        <section id="dns-guide" className="relative px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full">
          <div className="lp-glass-card rounded-3xl p-6 sm:p-10 border border-white/90">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  <Mat className="text-[16px]">dns</Mat> Instant DNS Verification
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Connect Your Custom Domain In 3 Simple Clicks</h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">Keep 100% of your sovereign brand identity. No clunky redirection. Automated Let&apos;s Encrypt wildcard certificates renewed automatically.</p>
                <div className="space-y-3 pt-2">
                  {[
                    ['Enter Your Registered Domain Name', 'Use any registrar: GoDaddy, Namecheap, Google, or Cloudflare.'],
                    ['Add Our Single CNAME / A-Record', 'Point @ or www to edge.gojulex.shop'],
                    ['Automatic SSL In Under 5 Minutes', 'Certificates issue instantly — no waiting, no manual steps.']
                  ].map(([t, d], i) => (
                    <div key={t} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full lp-gold-btn text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{t}</div>
                        <div className="text-[11px] text-slate-600">{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-gradient-to-b from-[#1F1912] to-[#120E0A] p-3 rounded-3xl border-4 border-[#3D3222]" style={{ boxShadow: '0 30px 70px -15px rgba(216,137,20,0.28)' }}>
                  <div className="bg-[#140F0A] rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-emerald-300 overflow-x-auto">
                    <div className="text-slate-500"># Your DNS panel</div>
                    <div><span className="text-white">TYPE</span>   <span className="text-white">HOST</span>      <span className="text-white">VALUE</span></div>
                    <div className="text-amber-300">CNAME    www         edge.gojulex.shop</div>
                    <div className="text-amber-300">A        @           82.112.237.145</div>
                    <div className="text-slate-500"># SSL issues automatically after propagation ✓</div>
                    <div className="mt-3 text-emerald-400 flex items-center gap-1.5"><Mat className="text-[14px]">verified</Mat> https://{domain} — Live</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING / CLAIM */}
        <section id="pricing-plans" className="relative px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full">
          <div className="lp-glass-card-popular rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-[#D88914]/30 shadow-sm">
                <Mat className="text-[#D88914] text-[18px]">verified</Mat>
                <span className="text-xs font-black text-[#1F1608]">Instant Setup • No Coding Required • Zero Platform Fee</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Ready to Launch Your Sovereign Storefront in Minutes?</h2>
              <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium">Claim your brand store handle today. Start selling with WhatsApp 1-tap ordering and keep 100% of every rupee you earn.</p>
              <form
                onSubmit={(e) => { e.preventDefault(); setClaimed(true); setTimeout(() => navigate('/admin/login'), 1200); }}
                className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-[#D88914]/30 flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 flex items-center gap-2 px-3">
                  <span className="font-mono text-xs font-black text-[#3C2607]">gojulex.shop/</span>
                  <input value={claim} onChange={(e) => setClaim(e.target.value)} className="w-full text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none placeholder-slate-400 py-2 border-0 bg-transparent" placeholder="mybrandname" required type="text" />
                </div>
                <button type="submit" className="lp-gold-btn text-white text-xs sm:text-sm font-black px-6 py-3 rounded-xl shadow-md whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer">
                  <span>Claim &amp; Launch</span><Mat className="text-[18px]">arrow_forward</Mat>
                </button>
              </form>
              {claimed && (
                <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-black shadow-xl border border-emerald-400 flex items-center gap-2">
                  <Mat className="text-[20px] text-emerald-600">check_circle</Mat>
                  Store handle reserved! Opening setup…
                </div>
              )}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
                <a href="https://wa.me/919940415353" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-emerald-300 text-slate-900 hover:text-emerald-700 shadow-xs">
                  <Mat className="text-emerald-600 text-[20px]">chat</Mat> Direct WhatsApp: <strong>99404 15353</strong>
                </a>
                <span className="text-amber-300">•</span>
                <span className="flex items-center gap-1.5 text-slate-800 font-semibold"><Mat className="text-[#D88914] text-[18px]">support</Mat> Personal 1-on-1 Onboarding Included</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="lp-glass-card rounded-3xl p-6 sm:p-10 border border-white/95 shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl lp-gold-btn text-white font-black flex items-center justify-center">GJ</span>
                <span className="font-black text-xl text-[#1F1608]" style={{ fontFamily: 'Outfit, sans-serif' }}>Gojulex</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6A522E] max-w-sm leading-relaxed font-medium">Bigger Ideas • Brighter Businesses Together. Next-generation multi-tenant eCommerce infrastructure for growing brands, luxury ateliers, and independent makers.</p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-[#B87309]">
                <span className="lp-glass-pill px-2.5 py-1 rounded-full border border-amber-200">0% Platform Commission</span>
                <span className="lp-glass-pill px-2.5 py-1 rounded-full border border-amber-200">Instant Setup</span>
                <span className="lp-glass-pill px-2.5 py-1 rounded-full border border-amber-200">Personal Support</span>
              </div>
            </div>
            <div className="md:col-span-3 space-y-2">
              <div className="text-xs font-black text-[#2A1D0D] uppercase tracking-wider mb-2">Transparent Plans</div>
              <ul className="text-xs space-y-1.5 font-bold text-[#66502E]">
                <li><Link className="hover:text-[#B87309]" to="/plans">Starter Plan (₹999 /mo)</Link></li>
                <li><Link className="hover:text-[#B87309]" to="/plans">Business Plan (₹1,999 /mo)</Link></li>
                <li><Link className="hover:text-[#B87309]" to="/plans">Pro Enterprise (₹3,499 /mo)</Link></li>
                <li><a className="hover:text-[#B87309]" href="#dns-guide">Custom Domain DNS Guide</a></li>
              </ul>
            </div>
            <div className="md:col-span-4 lp-glass-pill p-4 rounded-2xl border border-amber-200/80 space-y-2.5">
              <div className="text-xs font-black text-[#3C2607] uppercase tracking-wider">Direct Assistance</div>
              <div className="flex items-center gap-2 text-sm font-black text-[#2A1E0D]"><Mat className="text-green-600 text-[20px]">chat</Mat> WhatsApp: 99404 15353</div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#6E542D]"><Mat className="text-[#B87309] text-[18px]">mail</Mat> support@gojulex.shop</div>
              <a href="https://wa.me/919940415353" target="_blank" rel="noreferrer" className="block w-full py-2 px-3 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm">Chat on WhatsApp Now</a>
            </div>
          </div>
          <div className="pt-6 border-t border-[#B87309]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A623B] font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-bold"><Mat className="text-[16px] text-[#B87309]">lock</Mat> 256-Bit SSL Encrypted</span>
              <span className="flex items-center gap-1 font-bold"><Mat className="text-[16px] text-[#B87309]">payments</Mat> UPI &amp; Cards Accepted</span>
            </div>
            <span>© {new Date().getFullYear()} Gojulex Technologies. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlatformLandingPage;
