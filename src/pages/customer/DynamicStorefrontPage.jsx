import { JuxInlineEditor, applyJuxInlineStyles, applyJuxConfig } from '../../components/customer/JuxInlineEditor';
import { StoreCustomerAuthModal } from '../../components/customer/StoreCustomerAuthModal';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ArrowRight,
  Star,
  CheckCircle2,
  Shield,
  ShieldCheck,
  Compass,
  Layout,
  Volume2,
  MessageSquare,
  HelpCircle,
  Globe,
  Truck,
  RotateCcw,
  Sparkles,
  Heart,
  ExternalLink,
  ChevronRight,
  Tag,
  Gift,
  Mail,
  Zap,
  SlidersHorizontal,
  Plus,
  Minus,
  Check,
  Film,
  User,
  ShoppingBasket,
  Trash2,
  X,
  Phone,
  MessageCircle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { DEMO_STORES, INITIAL_PRODUCTS_BY_STORE } from '../../data/multiVerticalMockData';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { HARMONIOUS_THEME_PRESETS } from '../admin/channels/AdminThemeBuilder';
import { THEME_META , buildThemeSectionsForApply} from '../../data/themeRegistry';
import { formatCurrency, calculateDiscount } from '../../utils/formatters';

export const DynamicStorefrontPage = () => {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItemsCount
  } = useCart();

  const cleanSubdomain = (subdomain || 'luxestudio').toLowerCase().replace(/\.go\.julex\.shop$/, '').replace(/\.gojulex\.com$/, '');

  // 1. Identify Store / Tenant Profile (check custom profiles first)
  const savedProfile = (() => {
    try {
      const raw = localStorage.getItem(`gojulex_store_profile_${cleanSubdomain}`) ||
                  localStorage.getItem(`gojulex_store_profile_store_${cleanSubdomain}`) ||
                  localStorage.getItem(`gojulex_store_profile_default`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  })();

  const matchedStore = savedProfile || DEMO_STORES.find(
    (s) =>
      s.subdomain?.toLowerCase().includes(cleanSubdomain) ||
      s.id?.toLowerCase().includes(cleanSubdomain) ||
      s.name?.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanSubdomain.replace(/[^a-z0-9]/g, ''))
  ) || {
    id: 'store_' + cleanSubdomain,
    name: cleanSubdomain.charAt(0).toUpperCase() + cleanSubdomain.slice(1) + ' Store',
    subdomain: cleanSubdomain + '.gojulex.com',
    categoryLabel: 'Bespoke D2C Store',
    customDomain: `${cleanSubdomain}.in`
  };

  // The store as the PUBLIC sees it: published backend facts win over
  // local profiles so contact rows reflect the merchant's saved data.
  const liveStore = { ...matchedStore, ...(publishedStore || {}) };

  const [isBagDrawerOpen, setIsBagDrawerOpen] = useState(false);
  // Published store facts from the backend (name, whatsapp, instagram…)
  const [publishedStore, setPublishedStore] = useState(null);
  // Olive & Linen template: working storefront search
  const [isOliveSearchOpen, setIsOliveSearchOpen] = useState(false);
  const [oliveSearchQuery, setOliveSearchQuery] = useState('');
  // Rose Bloom Beauty template: working category filter
  const [bloomCategory, setBloomCategory] = useState('All');
  // Camel Editorial Fashion template: working category filter
  const [camelCategory, setCamelCategory] = useState('All');
  const [newsletterDone, setNewsletterDone] = useState(false);
  // Real newsletter subscription — persists via POST /store/subscribe
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const handleStoreSubscribe = async (e) => {
    e.preventDefault();
    if (newsletterBusy) return;
    setNewsletterError('');
    const email = String(newsletterEmail || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterBusy(true);
    try {
      const res = await api.storeSubscribe(cleanSubdomain, email);
      if (res?.success) {
        setNewsletterDone(true);
        setNewsletterEmail('');
      } else {
        setNewsletterError(res?.message || 'Could not subscribe right now. Please try again.');
      }
    } catch (err) {
      setNewsletterError('Cannot reach the server. Please try again.');
    } finally {
      setNewsletterBusy(false);
    }
  };
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('checkout');
  const [activeCustomer, setActiveCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem(`gojulex_customer_${cleanSubdomain}`) ||
                    localStorage.getItem('gojulex_store_customer_active');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Strict Multi-Tenant Cart Isolation: Only items belonging to THIS store
  const storeCartItems = cartItems.filter((item) => {
    if (!item) return false;
    if (item.storeSubdomain) {
      return item.storeSubdomain.toLowerCase() === cleanSubdomain.toLowerCase();
    }
    if (item.tenantId) {
      return String(item.tenantId).toLowerCase().includes(cleanSubdomain.toLowerCase());
    }
    // If brand matches store name
    if (item.brand && matchedStore.name && item.brand.toLowerCase() === matchedStore.name.toLowerCase()) {
      return true;
    }
    // Fallback: If item id contains store subdomain
    return String(item.id).toLowerCase().includes(cleanSubdomain.toLowerCase());
  });

  const totalStoreItemsCount = storeCartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const storeSubtotal = storeCartItems.reduce((acc, item) => acc + Number(item.finalPrice || item.sellingPriceINR || item.price || 0) * (item.quantity || 1), 0);

  // 2. Load Saved or Default Theme Configuration
  const [searchParams] = useSearchParams();
  const previewPresetId = searchParams.get('theme'); // live-preview override (?theme=preset_id)
  // Canva-style in-template editing, enabled inside the merchant Visual Customizer iframe
  const isJulexEditMode = searchParams.get('julex_edit') === '1';
  const isJulexDraftPreview = searchParams.get('julex_draft') === '1';
  // §19: unpublished stores are never publicly accessible. The merchant can
  // still preview privately via the customizer (julex_edit) or a preview token.
  const [storeNotLive, setStoreNotLive] = useState(null); // null=checking, true=blocked, false=ok
  useEffect(() => {
    let cancelled = false;
    const ownerPreview = isJulexEditMode || isJulexDraftPreview;
    if (ownerPreview) { setStoreNotLive(false); return; undefined; }
    api.storePublicStatus ? api.storePublicStatus(cleanSubdomain)
      .then((res) => { if (!cancelled) setStoreNotLive(!(res?.success && res.data?.published)); })
      .catch(() => { if (!cancelled) setStoreNotLive(false); })
      : setStoreNotLive(false);
    return () => { cancelled = true; };
  }, [cleanSubdomain, isJulexEditMode, isJulexDraftPreview]);
  const [themeConfig, setThemeConfig] = useState(() => {
    let savedStyles = null;
    let savedSections = null;
    try {
      const saved = localStorage.getItem(`gojulex_store_theme_${matchedStore.id}`) ||
                    localStorage.getItem(`gojulex_store_theme_store_${cleanSubdomain}`) ||
                    localStorage.getItem(`gojulex_store_theme_${cleanSubdomain}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        savedStyles = parsed.styles || null;
        if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          savedSections = parsed.sections;
          // No preview override → render exactly what the store saved
          if (!previewPresetId) return parsed;
        }
      }
    } catch (e) {}

    // Live preview (?theme=): render the PREVIEWED theme itself — its palette
    // AND its default content (the exact sections "Apply Theme" installs).
    // Keeping the store's saved sections here made previews of one theme show
    // another theme's content (e.g. "Aura" preview showing Sage text).
    if (previewPresetId) {
      const previewPreset = HARMONIOUS_THEME_PRESETS.find((p) => p.id === previewPresetId);
      if (previewPreset) {
        savedStyles = previewPreset;
        try {
          const previewSections = buildThemeSectionsForApply(previewPresetId, matchedStore);
          if (Array.isArray(previewSections) && previewSections.length > 0) {
            return { styles: { ...previewPreset }, sections: previewSections };
          }
        } catch (e) {}
        savedSections = null;
      }
    }

    // Default to Aura Soft Peach / preset matching vertical. Saved sections
    // (kept for live previews) take precedence over the built-in defaults.
    const defaultPreset = savedStyles || HARMONIOUS_THEME_PRESETS[0];
    if (savedSections && !previewPresetId) {
      return {
        styles: { ...defaultPreset },
        sections: savedSections
      };
    }
    return {
      styles: {
        ...defaultPreset
      },
      sections: [
        {
          id: 'sec_announcement',
          type: 'announcement',
          name: 'Announcement Bar',
          enabled: true,
          data: {
            text: `✨ Free Express Delivery on All Orders at ${matchedStore.name} • 100% Certified Authentic`,
            linkText: 'Explore Catalog',
            linkUrl: '#products'
          }
        },
        {
          id: 'sec_header',
          type: 'header',
          name: 'Navigation Header',
          enabled: true,
          data: {
            logoText: matchedStore.name,
            logoImg: '',
            tagline: matchedStore.categoryLabel || 'Direct D2C Boutique',
            navLink1: 'Creations',
            navLink2: 'Featured',
            navLink3: 'Our Craft'
          }
        },
        {
          id: 'sec_hero',
          type: 'hero',
          name: 'Hero Banner',
          enabled: true,
          data: {
            badgeText: '✨ Pure D2C Craftsmanship',
            headline: `Bespoke Creations at ${matchedStore.name}`,
            subtext: 'Direct from master artisans with 0% platform commission markup. Authentic craftsmanship delivered to your doorstep.',
            ctaText: 'Explore Catalog',
            secondaryCtaText: 'Our Craft',
            imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80'
          }
        },
        {
          id: 'sec_featured_ribbon',
          type: 'featured_ribbon',
          name: 'Featured Collection Ribbon',
          enabled: true,
          data: {
            badge: 'Limited Edition Batches',
            title: 'Curated Store Highlights',
            subtitle: 'Handcrafted with meticulous precision. Verified provenance.'
          }
        },
        {
          id: 'sec_products',
          type: 'product_grid',
          name: 'Featured Collection Grid',
          enabled: true,
          data: {
            title: 'Store Catalog Highlights',
            columns: 3,
            showPrice: true,
            buttonLabel: 'Add to Bag'
          }
        },
        {
          id: 'sec_promo',
          type: 'promo_banner',
          name: 'Promotional Banner',
          enabled: true,
          data: {
            badge: '⚡ Special Welcome Offer',
            headline: 'Get 10% Off Your First Direct Studio Order',
            couponCode: 'WELCOME10',
            subtext: 'Use code at checkout to claim instant 10% discount.'
          }
        },
        {
          id: 'sec_video_reels',
          type: 'video_reels',
          name: 'Behind The Scenes Reels',
          enabled: true,
          data: {
            title: 'Artisan Workshop Reels',
            subtitle: 'Watch master craftsmen forge every piece with uncompromising devotion.'
          }
        },
        {
          id: 'sec_testimonials',
          type: 'testimonials',
          name: 'Customer Testimonials',
          enabled: true,
          data: {
            rating: '★★★★★ 4.9/5 from 1,400+ Verified Buyers',
            title: 'Craftsmanship Revered by Connoisseurs',
            quote: 'Exceptional craftsmanship and swift delivery. Knowing that 100% of my payment supports the studio maker directly makes the purchase even more special.',
            author: 'Priya Sharma',
            badge: 'Verified Buyer, Mumbai'
          }
        },
{
          id: 'sec_story',
          type: 'story',
          name: 'About Us',
          enabled: true,
          data: {
            title: `Our Story`,
            text: `${matchedStore.name} sells direct — no middlemen, no marketplace commissions. Every piece is crafted in limited runs and shipped straight from our studio to you.`
          }
        },
                {
          id: 'sec_footer',
          type: 'footer',
          name: 'Footer',
          enabled: true,
          data: {
            tagline: `Official storefront for ${matchedStore.name}. Powered by Go Julex 0% platform fee commerce cloud.`,
            copyrightText: `© ${new Date().getFullYear()} ${matchedStore.name}. All rights reserved.`
          }
        }
      ]
    };
  });

  const { styles, sections } = themeConfig;

  // Load custom products for this specific store (Strict Multi-Tenant Isolation)
  const localStoreProducts = (() => {
    try {
      // 1. Direct custom key checks strictly for this subdomain/store in localStorage
      const directKeys = [
        `gojulex_store_products_${matchedStore.id}`,
        `gojulex_store_products_store_${cleanSubdomain}`,
        `gojulex_store_products_${cleanSubdomain}`
      ];
      for (const k of directKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }

      // 2. Check merchant products dictionary strictly for this store's ID/subdomain
      const merchantProdsRaw = localStorage.getItem('gojulex_merchant_products');
      if (merchantProdsRaw) {
        const allByStore = JSON.parse(merchantProdsRaw);
        const directList = allByStore[matchedStore.id] ||
                           allByStore[`store_${cleanSubdomain}`] ||
                           allByStore[cleanSubdomain];
        if (Array.isArray(directList) && directList.length > 0) return directList;
      }

      // 3. Check INITIAL_PRODUCTS_BY_STORE (Real initial biography books for Book Haven Store)
      const initialFromData = INITIAL_PRODUCTS_BY_STORE[matchedStore.id] ||
                              INITIAL_PRODUCTS_BY_STORE[`store_${cleanSubdomain}`] ||
                              INITIAL_PRODUCTS_BY_STORE[cleanSubdomain];
      if (Array.isArray(initialFromData)) {
        return initialFromData;
      }
    } catch (e) {}

    return [];
  })();

  // Live database catalog for this store — stock here reflects real orders
  // (the backend deducts stock on checkout), so it takes priority over
  // localStorage copies and static mock data.
  const [liveStoreProducts, setLiveStoreProducts] = useState([]);
  useEffect(() => {
    let cancelled = false;
    const tenantId = matchedStore.id || `store_${cleanSubdomain}`;
    const loadLive = () => {
      api.products.getAll({ tenantId })
        .then(res => {
          if (!cancelled && res?.success && Array.isArray(res.data) && res.data.length > 0) {
            setLiveStoreProducts(res.data);
          }
        })
        .catch(() => {});
    };
    loadLive();
    // Refresh live stock when the user returns to the storefront (e.g. after checkout)
    window.addEventListener('focus', loadLive);
    return () => { cancelled = true; window.removeEventListener('focus', loadLive); };
  }, [matchedStore.id, cleanSubdomain]);

  const isPreviewMode = Boolean(previewPresetId) || searchParams.get('preview') === '1';
  const activePresetId = previewPresetId || styles?.presetId || themeConfig.styles?.presetId;
  const activeThemeMeta = THEME_META[activePresetId] || THEME_META[`preset_${activePresetId?.replace('preset_', '')}`] || THEME_META.preset_soft_peach;

  const storeProducts = (isPreviewMode && activeThemeMeta?.products?.length > 0)
    ? activeThemeMeta.products
    : (liveStoreProducts.length > 0 ? liveStoreProducts : localStoreProducts);

  const [addedItemNotice, setAddedItemNotice] = useState(null);

  // Dynamic Variant & Specification Selection Modal State
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [selectedOptionValues, setSelectedOptionValues] = useState({});
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Helper to extract exact option sets for a product
  const getProductOptionSets = (prod) => {
    if (!prod) return [];
    if (prod.hasVariants === false) return [];
    if (Array.isArray(prod.optionSets) && prod.optionSets.length > 0) {
      return prod.optionSets.filter(os => Array.isArray(os.values) && os.values.length > 0);
    }
    if (prod.hasVariants) {
      const sets = [];
      if (Array.isArray(prod.availableSizes) && prod.availableSizes.length > 0) {
        sets.push({ id: 'opt_size', name: 'Size', values: prod.availableSizes });
      }
      if (Array.isArray(prod.availableColors) && prod.availableColors.length > 0) {
        sets.push({ id: 'opt_color', name: 'Color', values: prod.availableColors });
      }
      if (Array.isArray(prod.availableFormats) && prod.availableFormats.length > 0) {
        sets.push({ id: 'opt_format', name: 'Edition / Format', values: prod.availableFormats });
      }
      return sets;
    }
    return [];
  };

  // Smooth Scroll for Anchors (#featured, #story, #products, #faq, #reels, etc.)
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  // Load the PUBLISHED theme config from the backend so every visitor
  // sees the store exactly as the merchant designed it (localStorage is
  // only a local draft fallback).
  useEffect(() => {
    let cancelled = false;
    api.themes.getPublicConfig(cleanSubdomain)
      .then((res) => {
        if (cancelled || !res?.success || !res?.data) return;
        // Theme live-preview / customizer draft own the screen — never let
        // the store's saved config overwrite them.
        if (previewPresetId || isJulexDraftPreview) return;
        const cfg = res.data;
        // Published store facts (contact/footer) from the database — merge
        // over any stale local profile so every visitor sees real data
        if (cfg.store) {
          setPublishedStore(cfg.store);
        }
        // Only accept a fully valid section list — a malformed/partial publish
        // must never take the live storefront down.
        const validSections = Array.isArray(cfg.sections)
          && cfg.sections.length > 0
          && cfg.sections.every((s) => s && typeof s.type === 'string' && s.data && typeof s.data === 'object');
        setThemeConfig((prev) => ({
          styles: cfg.styles && Object.keys(cfg.styles).length > 0 ? cfg.styles : prev.styles,
          sections: validSections ? cfg.sections : prev.sections,
          presetId: cfg.presetId || prev.presetId
        }));
        // Published customisations (inline styles + floating boxes) show for
        // EVERY visitor — apply the backend config once sections have rendered.
        if (!cancelled) setTimeout(() => applyJuxConfig(cfg), 400);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [cleanSubdomain]);

  // Merchant's LOCAL DRAFT styling applies only inside the Visual Customizer —
  // the public store renders strictly the PUBLISHED backend config.
  useEffect(() => {
    if (isJulexEditMode && matchedStore?.id) applyJuxInlineStyles(matchedStore.id, cleanSubdomain);
  }, [isJulexEditMode, matchedStore?.id, cleanSubdomain]);

  // Visual Customizer draft: the builder streams its CURRENT sections/styles
  // into this preview — the preview never keeps an independent copy.
  useEffect(() => {
    if (!isJulexDraftPreview) return;
    const onMsg = (e) => {
      const d = e.data;
      if (!d || d.type !== 'julex-draft-theme') return;
      const valid = Array.isArray(d.sections) && d.sections.length > 0 && d.sections.every((x) => x && x.type && x.data && typeof x.data === 'object');
      // Expose the live draft so the inline editor always SAVES the freshest
      // sections/styles (never a stale localStorage copy).
      window.__juxLiveDraft = { sections: valid ? d.sections : null, styles: d.styles || null, at: Date.now() };
      setThemeConfig((prev) => ({
        styles: d.styles && Object.keys(d.styles).length > 0 ? d.styles : prev.styles,
        sections: valid ? d.sections : prev.sections,
        presetId: (d.styles && d.styles.layoutStyle) || prev.presetId
      }));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [isJulexDraftPreview]);



  // Exact variant match for the selected options — merchant-defined
  // per-variant prices (e.g. 100g ₹50 / 250g ₹100 / 500g ₹180) win over
  // the base product price. Works for ANY category (sizes, weights, volumes).
  const findVariantFor = (product, selectedValues) => {
    if (!product || !Array.isArray(product.variantMatrix) || product.variantMatrix.length === 0) return null;
    const sets = getProductOptionSets(product);
    const title = sets.map((os) => `${os.name}: ${selectedValues[os.name]}`).join(' / ');
    return product.variantMatrix.find((v) => v && v.title === title && Number(v.price) > 0) || null;
  };

  const handleQuickAdd = (product) => {
    const isOutOfStock = (Number(product.stockQuantity ?? product.stock ?? 0) <= 0) || product.status === 'No' || product.status === false || product.available === false;
    if (isOutOfStock) {
      return;
    }

    const optionSets = getProductOptionSets(product);
    if (optionSets.length === 0) {
      // 1-Click Instant Add if no variant options
      const storeScopedItem = {
        ...product,
        storeSubdomain: cleanSubdomain,
        tenantId: matchedStore.id,
        storeName: matchedStore.name
      };
      addToCart(storeScopedItem, 1);
      setAddedItemNotice(product.name);
      setIsBagDrawerOpen(true);
      setTimeout(() => setAddedItemNotice(null), 3500);
      return;
    }

    // Open Dynamic Option Sets Modal
    const initialChoices = {};
    optionSets.forEach(os => {
      initialChoices[os.name] = os.values[0];
    });
    setSelectedOptionValues(initialChoices);
    setSelectedProductForVariant(product);
    setSelectedQuantity(1);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProductForVariant) return;

    const variantEntries = Object.entries(selectedOptionValues);
    const variantLabel = variantEntries.length > 0
      ? variantEntries.map(([k, v]) => `${k}: ${v}`).join(' • ')
      : '';

    const exactVariant = findVariantFor(selectedProductForVariant, selectedOptionValues);
    const variantPrice = exactVariant ? Number(exactVariant.price) : null;

    const storeScopedItem = {
      ...selectedProductForVariant,
      variant: variantLabel,
      selectedOptions: selectedOptionValues,
      // The selected variant's own price becomes the item price everywhere
      // (cart totals, checkout, order data) when the merchant defined one.
      ...(variantPrice !== null ? {
        price: variantPrice,
        sellingPriceINR: variantPrice,
        finalPrice: variantPrice,
        // The variant owns pricing now — the base product's compare-at price
        // must not leak into subtotal/savings math.
        comparePriceINR: Number(exactVariant.compareAtPrice) > variantPrice ? Number(exactVariant.compareAtPrice) : variantPrice,
        comparePrice: Number(exactVariant.compareAtPrice) > variantPrice ? Number(exactVariant.compareAtPrice) : variantPrice,
        discountPercent: Number(exactVariant.compareAtPrice) > variantPrice ? Math.round((1 - variantPrice / Number(exactVariant.compareAtPrice)) * 100) : 0,
        variantSku: exactVariant.sku || selectedProductForVariant.sku
      } : {}),
      storeSubdomain: cleanSubdomain,
      tenantId: matchedStore.id,
      storeName: matchedStore.name
    };

    addToCart(storeScopedItem, selectedQuantity);
    setAddedItemNotice(`${selectedProductForVariant.name}${variantLabel ? ` (${variantLabel})` : ''}`);
    setSelectedProductForVariant(null);
    setIsBagDrawerOpen(true);
    setTimeout(() => setAddedItemNotice(null), 3500);
  };

  if (storeNotLive === true) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#FFF9F6' }}>
        <div className="max-w-md text-center space-y-4 p-8 bg-white rounded-3xl border border-[#FBCBCB] shadow-sm">
          <p className="text-4xl">🛍️</p>
          <h1 className="font-serif text-2xl font-black text-[#0F172A]">This store isn't live yet</h1>
          <p className="text-sm text-[#475569]">The store owner is still setting things up. Please check back soon!</p>
          <a href="https://go.julex.shop" className="inline-block px-5 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold transition">Explore Go Julex</a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen selection:bg-[#FFE4E6] selection:text-[#881337]"
      style={{
        backgroundColor: styles?.backgroundColor || '#FFF9F6',
        color: styles?.textColor || '#1E293B',
        fontFamily: styles?.bodyFont || 'Inter',
        fontSize: `${styles?.baseFontSize || 15}px`
      }}
    >
      {/* Toast Notification */}
      {addedItemNotice && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="px-5 py-3 rounded-2xl bg-[#9F1239] text-white shadow-2xl flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Added "{addedItemNotice}" to your bag!</span>
            <Link to="/cart" className="underline font-black ml-2 text-white">
              View Bag →
            </Link>
          </div>
        </div>
      )}

      {/* Interactive Dynamic Option Sets & Specification Modal */}
      {selectedProductForVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#FBCBCB] overflow-hidden text-[#0F172A] space-y-5 p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <img
                  src={
                    (selectedProductForVariant.images && selectedProductForVariant.images[0]) ||
                    selectedProductForVariant.imageUrl ||
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={selectedProductForVariant.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#FBCBCB] bg-stone-50 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {selectedProductForVariant.category || matchedStore.categoryLabel}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-[#0F172A] leading-snug line-clamp-1 mt-1">
                    {selectedProductForVariant.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono font-bold text-base text-[#9F1239]">
                      ₹{(() => {
                        const v = findVariantFor(selectedProductForVariant, selectedOptionValues);
                        return Number(v ? v.price : (selectedProductForVariant.sellingPriceINR || selectedProductForVariant.price || 0)).toLocaleString('en-IN');
                      })()}
                    </span>
                    {selectedProductForVariant.discountPercent > 0 && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {selectedProductForVariant.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProductForVariant(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Option Sets (Exact Merchant-Created Options Only) */}
            <div className="space-y-4">
              {getProductOptionSets(selectedProductForVariant).map((optionSet) => {
                const currentVal = selectedOptionValues[optionSet.name] || optionSet.values[0];
                return (
                  <div key={optionSet.id || optionSet.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#9F1239]" /> Select {optionSet.name}
                      </label>
                      <span className="text-[11px] text-[#9F1239] font-bold">Selected: {currentVal}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {optionSet.values.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSelectedOptionValues(prev => ({ ...prev, [optionSet.name]: val }))}
                          className={`px-4 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                            currentVal === val
                              ? 'bg-[#9F1239] text-white border-[#9F1239] shadow-sm transform scale-105'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-[#9F1239] hover:bg-rose-50/50'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Specifications Highlights */}
            {selectedProductForVariant.specs && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Craft Specifications:
                </span>
                {Object.entries(selectedProductForVariant.specs)
                  .filter(([k, v]) => v !== null && v !== undefined && typeof v !== 'object')
                  .map(([k, v]) => (
                    <p key={k} className="text-stone-600 text-[11px]">
                      <strong className="text-stone-800">{k}:</strong> {String(v)}
                    </p>
                  ))}
              </div>
            )}

            {/* Quantity Stepper & Add to Bag Action */}
            <div className="flex items-center gap-4 pt-2 border-t border-black/5">
              <div className="flex items-center border border-stone-300 rounded-2xl bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="p-2 rounded-xl hover:bg-white text-stone-700 transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 font-mono font-bold text-sm text-stone-900">{selectedQuantity}</span>
                <button
                  type="button"
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="p-2 rounded-xl hover:bg-white text-stone-700 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Confirm & Add {selectedQuantity} to Bag • ₹{(() => {
                    const v = findVariantFor(selectedProductForVariant, selectedOptionValues);
                    return (Number(v ? v.price : (selectedProductForVariant.sellingPriceINR || selectedProductForVariant.price || 0)) * selectedQuantity).toLocaleString('en-IN');
                  })()}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Sections Loop with Template-Specific Layout Architectures */}
      {(() => {
      const __enabled = sections.filter(s => s.enabled);
      const __rendered = __enabled.map((section) => {
        const layoutStyle = styles?.layoutStyle || HARMONIOUS_THEME_PRESETS.find(p => p.id === styles?.presetId || p.id === themeConfig.presetId)?.layoutStyle || 'haute_atelier';

        // ----------------------------------------------------
        // 1. ANNOUNCEMENT BAR (4 Layout Variants)
        // ----------------------------------------------------
        if (section.type === 'announcement') {
          const bg = section.data.overrideBg || styles?.announcementBg || '#FAD4C0';
          const text = section.data.overrideText || styles?.announcementText || '#4A281E';

          if (layoutStyle === 'olive_linen') {
            return (
              <div
                key={section.id}
                className="py-2.5 px-4 text-center text-[12px] tracking-wide flex items-center justify-center gap-2"
                style={{ backgroundColor: '#3B4A2F', color: '#F5F3EE' }}
              >
                <span className="opacity-70">✦</span>
                <span>{section.data.text || 'Complimentary shipping on all orders — direct from our studio'}</span>
                {section.data.linkText && (
                  <a href={section.data.linkUrl || '#products'} className="underline underline-offset-2 hover:opacity-80">
                    {section.data.linkText}
                  </a>
                )}
              </div>
            );
          }

          if (layoutStyle === 'modern_editorial') {
            return (
              <div
                key={section.id}
                className="py-2 px-4 text-center text-[11px] font-mono uppercase font-bold tracking-widest flex items-center justify-between border-b border-black/10 overflow-hidden"
                style={{ backgroundColor: bg, color: text }}
              >
                <div className="flex items-center gap-6 animate-pulse whitespace-nowrap mx-auto">
                  <span>⚡ {section.data.text || 'EDITORIAL RELEASE • ZERO PLATFORM COMMISSION • INSTANT DISPATCH'}</span>
                  <span>//</span>
                  <span>{section.data.text || '100% DIRECT FROM CREATOR'}</span>
                  {section.data.linkText && (
                    <a href={section.data.linkUrl || '#products'} className="underline font-black ml-2">
                      [{section.data.linkText}]
                    </a>
                  )}
                </div>
              </div>
            );
          }

          if (layoutStyle === 'organic_artisan') {
            return (
              <div
                key={section.id}
                className="py-2.5 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 border-b border-black/5"
                style={{ backgroundColor: bg, color: text }}
              >
                <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-bold">🌱 Natural Craft</span>
                <span>{section.data.text}</span>
                {section.data.linkText && (
                  <a href={section.data.linkUrl || '#products'} className="font-bold underline ml-1 hover:opacity-80">
                    {section.data.linkText} →
                  </a>
                )}
              </div>
            );
          }

          if (layoutStyle === 'neo_tech') {
            return (
              <div
                key={section.id}
                className="py-2 px-4 text-center text-xs font-mono flex items-center justify-center gap-3 border-b border-white/10"
                style={{ backgroundColor: bg, color: text }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="font-bold tracking-wider">[STATUS: ONLINE]</span>
                <span>{section.data.text}</span>
              </div>
            );
          }

          if (layoutStyle === 'markly_luxe') {
            return (
              <div
                key={section.id}
                className="py-2 px-4 text-center text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-3"
                style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
              >
                <span>{section.data.text}</span>
                {section.data.linkText && (
                  <a href={section.data.linkUrl || '#products'} className="underline underline-offset-4 hover:opacity-70 transition">
                    {section.data.linkText}
                  </a>
                )}
              </div>
            );
          }

          if (layoutStyle === 'parfum_botanical') {
            const olive = styles?.accentColor || '#A3B449';
            return (
              <div key={section.id}>
                {/* Theme motion keyframes (shared by all Parfum sections) */}
                <style>{`
                  @keyframes parfum-kenburns { 0% { transform: scale(1); } 100% { transform: scale(1.12); } }
                  @keyframes parfum-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                  @keyframes parfum-float { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-6px) rotate(-2deg); } }
                  @keyframes parfum-fadeup { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
                <div
                  className="py-2 px-4 text-center text-[11px] uppercase tracking-[0.22em] font-semibold flex items-center justify-center gap-4"
                  style={{ backgroundColor: olive, color: '#FFFFFF' }}
                >
                  <span className="hidden sm:inline opacity-60">✕</span>
                  <span>{section.data.text}</span>
                  {section.data.linkText && (
                    <a href={section.data.linkUrl || '#products'} className="underline underline-offset-4 hover:opacity-80 transition">
                      {section.data.linkText}
                    </a>
                  )}
                  <span className="hidden sm:inline opacity-60">✕</span>
                </div>
              </div>
            );
          }

          if (layoutStyle === 'editorial_zine') {
            const sage = styles?.accentColor || '#8FBF7F';
            const ink = styles?.headingColor || '#141414';
            const cream = '#F5F2EC';
            return (
              <div key={section.id} style={{ backgroundColor: styles?.backgroundColor || '#E8E4DB' }} className="pt-5 pb-2 px-4">
                <div
                  className="max-w-3xl mx-auto py-2.5 px-6 text-center text-[11px] font-semibold tracking-[0.14em] uppercase flex items-center justify-center gap-3 rounded-full shadow-lg"
                  style={{ backgroundColor: ink, color: cream }}
                >
                  <span style={{ color: sage }}>✦</span>
                  <span>{section.data.text}</span>
                  {section.data.linkText && (
                    <a href={section.data.linkUrl || '#products'} className="underline underline-offset-4 font-bold hover:opacity-80" style={{ color: sage }}>
                      {section.data.linkText}
                    </a>
                  )}
                  <span style={{ color: sage }}>✦</span>
                </div>
              </div>
            );
          }

          if (layoutStyle === 'quiet_luxe') {
            return (
              <div key={section.id}>
                <div
                  className="py-2.5 px-4 text-center text-[12.5px] flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: '#4F5B3E', color: '#F1EDE3' }}
                >
                  <span style={{ color: '#E3B23C' }}>✦</span>
                  <span>{section.data.text}</span>
                  {section.data.linkText && (
                    <a href={section.data.linkUrl || '#products'} className="underline underline-offset-2 hover:opacity-70 transition">
                      {section.data.linkText}
                    </a>
                  )}
                </div>
                {/* Color-block band: moss / rust / mustard / sage */}
                <div className="flex h-1.5">
                  <div className="flex-1" style={{ backgroundColor: '#4F5B3E' }} />
                  <div className="flex-1" style={{ backgroundColor: '#9C5A34' }} />
                  <div className="flex-1" style={{ backgroundColor: '#E3B23C' }} />
                  <div className="flex-1" style={{ backgroundColor: '#7C8B6F' }} />
                </div>
              </div>
            );
          }

          if (layoutStyle === 'editorial_boutique') {
            return (
              <div
                key={section.id}
                className="py-2.5 px-4 text-center text-[10px] uppercase font-semibold tracking-[0.3em] flex items-center justify-center gap-3"
                style={{ backgroundColor: bg, color: text }}
              >
                <span className="w-8 h-px inline-block" style={{ backgroundColor: styles?.accentColor || '#B4552D' }} />
                <span>{section.data.text}</span>
                {section.data.linkText && (
                  <a href={section.data.linkUrl || '#products'} className="underline underline-offset-4 font-semibold hover:opacity-70 transition">
                    {section.data.linkText}
                  </a>
                )}
                <span className="w-8 h-px inline-block" style={{ backgroundColor: styles?.accentColor || '#B4552D' }} />
              </div>
            );
          }

          if (layoutStyle === 'playful_pop') {
            return (
              <div
                key={section.id}
                className="py-2.5 px-4 text-center text-[11px] font-black tracking-wider uppercase flex items-center justify-center gap-2 overflow-hidden"
                style={{ backgroundColor: '#FFC700', color: '#111111' }}
              >
                <span style={{ color: '#FF8FC5' }}>★</span>
                <span>{section.data.text}</span>
                <span style={{ color: '#7DE3C3' }}>★</span>
                {section.data.linkText && (
                  <a
                    href={section.data.linkUrl || '#products'}
                    className="ml-1 px-3 py-0.5 rounded-full font-black text-white hover:brightness-95 transition"
                    style={{ backgroundColor: '#B8A7FF' }}
                  >
                    {section.data.linkText} →
                  </a>
                )}
              </div>
            );
          }

          // Default: haute_atelier
          return (
            <div
              key={section.id}
              className="py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b border-black/5"
              style={{ backgroundColor: bg, color: text }}
            >
              <span>✨ {section.data.text}</span>
              {section.data.linkText && (
                <a
                  href={section.data.linkUrl || '#products'}
                  className="font-bold underline ml-1.5 hover:opacity-80 transition"
                >
                  {section.data.linkText} →
                </a>
              )}
            </div>
          );
        }

        // ----------------------------------------------------
        // 2. NAVIGATION HEADER (4 Layout Variants)
        // ----------------------------------------------------
        if (section.type === 'header') {
          const displayLogoText = (isPreviewMode && activeThemeMeta?.brandName) || section.data.logoText || matchedStore.name;
          const displayTagline = (isPreviewMode && activeThemeMeta?.tagline) || section.data.tagline || matchedStore.categoryLabel;

          if (layoutStyle === 'camel_edit') {
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition"
                style={{ backgroundColor: '#FCFAF7F5', borderColor: '#E9E2D9' }}
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
                  <h1
                    className="text-xl sm:text-2xl leading-none whitespace-nowrap uppercase tracking-[0.12em]"
                    style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}
                  >
                    {displayLogoText}
                  </h1>
                  <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium" style={{ color: '#4A423B' }}>
                    <a href="#categories" className="hover:text-black transition">Categories</a>
                    <a href="#offer" className="hover:text-black transition">Offer</a>
                    <a href="#best-sellers" className="hover:text-black transition">Best Sellers</a>
                    <a href="#about" className="hover:text-black transition">About & Contact</a>
                  </nav>
                  <div className="flex items-center gap-4" style={{ color: '#111111' }}>
                    <button
                      onClick={() => { setIsOliveSearchOpen(!isOliveSearchOpen); setOliveSearchQuery(''); }}
                      className="hover:opacity-70 transition cursor-pointer"
                      aria-label="Search products"
                    >
                      <Search className="w-[18px] h-[18px] stroke-[1.5]" />
                    </button>
                    <button onClick={() => setIsCustomerAuthOpen(true)} className="flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer">
                      <User className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">{activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}</span>
                    </button>
                    <button onClick={() => setIsBagDrawerOpen(true)} className="relative flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer">
                      <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">Bag</span>
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-[10px] font-semibold text-white flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
                        {totalStoreItemsCount}
                      </span>
                    </button>
                  </div>
                </div>

                {isOliveSearchOpen && (
                  <div className="border-t" style={{ borderColor: '#E9E2D9', backgroundColor: '#FCFAF7' }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
                      <input
                        autoFocus
                        value={oliveSearchQuery}
                        onChange={(e) => setOliveSearchQuery(e.target.value)}
                        placeholder="Search blazers, denim, sneakers..."
                        className="w-full px-4 py-2.5 rounded-full text-sm outline-none border"
                        style={{ borderColor: '#111111', backgroundColor: '#FFFFFF', color: '#111111' }}
                      />
                      {oliveSearchQuery.trim().length > 0 && (() => {
                        const pool = (isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts;
                        const q = oliveSearchQuery.trim().toLowerCase();
                        const results = pool.filter((pr) => String(pr.name || '').toLowerCase().includes(q) || String(pr.category || '').toLowerCase().includes(q)).slice(0, 6);
                        if (results.length === 0) return <p className="text-sm" style={{ color: '#4A423B' }}>Nothing matches “{oliveSearchQuery}”.</p>;
                        return (
                          <ul className="divide-y" style={{ borderColor: '#E9E2D9' }}>
                            {results.map((pr) => {
                              const thumb = (pr.images && pr.images[0]) || pr.imageUrl || pr.image || '/theme-images/fashion-1.png';
                              const priceVal = Number(pr.sellingPriceINR || pr.price || 0);
                              return (
                                <li key={pr.id}>
                                  <button
                                    onClick={() => { setIsOliveSearchOpen(false); setCamelCategory(String(pr.category || 'All')); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                                    className="w-full flex items-center gap-3 py-2.5 text-left hover:opacity-75 transition cursor-pointer"
                                  >
                                    <img src={thumb} alt={pr.name} className="w-11 h-14 object-cover rounded-md" />
                                    <span className="flex-1">
                                      <span className="block text-sm font-medium" style={{ color: '#111111' }}>{pr.name}</span>
                                      <span className="block text-xs" style={{ color: '#4A423B' }}>{pr.category || 'Collection'} · ₹{priceVal.toLocaleString('en-IN')}</span>
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </header>
            );
          }

          if (layoutStyle === 'bloom_beauty') {
            const wine = '#8E4356';
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition"
                style={{ backgroundColor: '#FFFFFFF5', borderColor: '#F0DBDD' }}
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
                  <h1
                    className="text-2xl leading-none whitespace-nowrap"
                    style={{ color: '#3A1B2A', fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700, fontStyle: 'italic' }}
                  >
                    {displayLogoText}
                  </h1>

                  <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium" style={{ color: '#6B4A55' }}>
                    <a href="#products" className="hover:text-[#8E4356] transition">Shop</a>
                    <a href="#categories" className="hover:text-[#8E4356] transition">Categories</a>
                    <a href="#offer" className="hover:text-[#8E4356] transition">Offers</a>
                    <a href="#about" className="hover:text-[#8E4356] transition">About Us</a>
                  </nav>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => { setIsOliveSearchOpen(!isOliveSearchOpen); setOliveSearchQuery(''); }}
                      className="flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: wine }}
                      aria-label="Search products"
                    >
                      <Search className="w-[18px] h-[18px] stroke-[1.5]" />
                    </button>
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: wine }}
                    >
                      <User className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">{activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}</span>
                    </button>
                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="relative flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: wine }}
                    >
                      <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">Bag</span>
                      <span
                        className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                        style={{ backgroundColor: wine }}
                      >
                        {totalStoreItemsCount}
                      </span>
                    </button>
                  </div>
                </div>

                {isOliveSearchOpen && (
                  <div className="border-t" style={{ borderColor: '#F0DBDD', backgroundColor: '#FDF8F6' }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
                      <input
                        autoFocus
                        value={oliveSearchQuery}
                        onChange={(e) => setOliveSearchQuery(e.target.value)}
                        placeholder="Search lip tints, serums, fragrances..."
                        className="w-full px-4 py-2.5 rounded-full text-sm outline-none border"
                        style={{ borderColor: wine, backgroundColor: '#FFFFFF', color: '#3A1B2A' }}
                      />
                      {oliveSearchQuery.trim().length > 0 && (() => {
                        const pool = (isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts;
                        const q = oliveSearchQuery.trim().toLowerCase();
                        const results = pool.filter((pr) => String(pr.name || '').toLowerCase().includes(q) || String(pr.category || '').toLowerCase().includes(q)).slice(0, 6);
                        if (results.length === 0) return <p className="text-sm" style={{ color: '#6B4A55' }}>No products match “{oliveSearchQuery}”.</p>;
                        return (
                          <ul className="divide-y" style={{ borderColor: '#F0DBDD' }}>
                            {results.map((pr) => {
                              const thumb = (pr.images && pr.images[0]) || pr.imageUrl || pr.image || '/theme-images/beauty-1.jpeg';
                              const priceVal = Number(pr.sellingPriceINR || pr.price || 0);
                              return (
                                <li key={pr.id}>
                                  <button
                                    onClick={() => { setIsOliveSearchOpen(false); setBloomCategory(String(pr.category || 'All')); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                                    className="w-full flex items-center gap-3 py-2.5 text-left hover:opacity-75 transition cursor-pointer"
                                  >
                                    <img src={thumb} alt={pr.name} className="w-11 h-14 object-cover rounded-lg" />
                                    <span className="flex-1">
                                      <span className="block text-sm font-medium" style={{ color: '#3A1B2A' }}>{pr.name}</span>
                                      <span className="block text-xs" style={{ color: '#6B4A55' }}>{pr.category || 'Collection'} · ₹{priceVal.toLocaleString('en-IN')}</span>
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </header>
            );
          }

          if (layoutStyle === 'olive_linen') {
            const ink = '#232A1D';
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition"
                style={{ backgroundColor: `${styles?.headerBg || '#F5F3EE'}F2`, borderColor: '#E3E0D6' }}
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
                  <h1
                    className="text-[22px] sm:text-2xl leading-none whitespace-nowrap uppercase"
                    style={{ color: ink, fontFamily: styles?.headingFont || 'Fraunces', fontWeight: 600, letterSpacing: '0.08em' }}
                  >
                    {displayLogoText}
                  </h1>

                  <nav className="hidden md:flex items-center gap-8">
                    <a href="#products" className="text-[14px] border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor || '#4A5240' }}>
                      {section.data.navLink1 || 'Shop'}
                    </a>
                    <a href="#story" className="text-[14px] border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor || '#4A5240' }}>
                      {section.data.navLink2 || 'About'}
                    </a>
                    <a href="#footer" className="text-[14px] border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor || '#4A5240' }}>
                      {section.data.navLink3 || 'Contact'}
                    </a>
                  </nav>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => { setIsOliveSearchOpen(!isOliveSearchOpen); setOliveSearchQuery(''); }}
                      className="flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: ink }}
                      aria-label="Search products"
                    >
                      <Search className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: ink }}
                    >
                      <User className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">{activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}</span>
                    </button>
                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="relative flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: ink }}
                    >
                      <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">Bag</span>
                      <span
                        className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                        style={{ backgroundColor: '#3B4A2F' }}
                      >
                        {totalStoreItemsCount}
                      </span>
                    </button>
                  </div>
                </div>

                {isOliveSearchOpen && (
                  <div className="border-t" style={{ borderColor: '#E3E0D6', backgroundColor: '#F5F3EE' }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
                      <input
                        autoFocus
                        value={oliveSearchQuery}
                        onChange={(e) => setOliveSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full px-4 py-2.5 rounded-md text-sm outline-none border"
                        style={{ borderColor: '#3B4A2F', backgroundColor: '#FFFFFF', color: '#232A1D' }}
                      />
                      {oliveSearchQuery.trim().length > 0 && (() => {
                        const pool = (isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts;
                        const q = oliveSearchQuery.trim().toLowerCase();
                        const results = pool.filter((pr) => String(pr.name || '').toLowerCase().includes(q) || String(pr.category || '').toLowerCase().includes(q)).slice(0, 6);
                        if (results.length === 0) return <p className="text-sm" style={{ color: '#4A5240' }}>No products match “{oliveSearchQuery}”.</p>;
                        return (
                          <ul className="divide-y" style={{ borderColor: '#E3E0D6' }}>
                            {results.map((pr) => {
                              const thumb = (pr.images && pr.images[0]) || pr.imageUrl || pr.image || '/theme-images/beige-1.jpg';
                              const priceVal = Number(pr.sellingPriceINR || pr.price || 0);
                              return (
                                <li key={pr.id}>
                                  <button
                                    onClick={() => { setIsOliveSearchOpen(false); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                                    className="w-full flex items-center gap-3 py-2.5 text-left hover:opacity-75 transition cursor-pointer"
                                  >
                                    <img src={thumb} alt={pr.name} className="w-11 h-14 object-cover rounded-sm" style={{ borderColor: '#E3E0D6' }} />
                                    <span className="flex-1">
                                      <span className="block text-sm font-medium" style={{ color: '#232A1D' }}>{pr.name}</span>
                                      <span className="block text-xs" style={{ color: '#4A5240' }}>{pr.category || 'Collection'} · ₹{priceVal.toLocaleString('en-IN')}</span>
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </header>
            );
          }

          if (layoutStyle === 'modern_editorial') {
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition"
                style={{ backgroundColor: `${styles?.headerBg || '#FFFFFF'}F0`, borderColor: 'rgba(0,0,0,0.1)' }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <h1
                      className="font-black text-xl sm:text-2xl uppercase tracking-widest leading-none font-mono"
                      style={{ color: styles?.headingColor || '#000000' }}
                    >
                      {displayLogoText}
                    </h1>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-black text-white rounded-none uppercase">
                      D2C Edition
                    </span>
                  </div>

                  <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase font-bold tracking-wider">
                    <a href="#products" className="hover:underline" style={{ color: styles?.textColor }}>
                      {section.data.navLink1 || 'Catalog'}
                    </a>
                    <a href="#featured" className="hover:underline" style={{ color: styles?.textColor }}>
                      {section.data.navLink2 || 'Highlights'}
                    </a>
                    <a href="#story" className="hover:underline" style={{ color: styles?.textColor }}>
                      {section.data.navLink3 || 'Manifesto'}
                    </a>
                  </nav>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="px-3 py-1.5 text-xs font-mono font-bold border border-black bg-white hover:bg-black hover:text-white transition cursor-pointer"
                    >
                      {activeCustomer ? `[${activeCustomer.name.split(' ')[0]}]` : '[ACCOUNT]'}
                    </button>
                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="px-4 py-2 text-xs font-mono font-black text-white bg-black hover:bg-zinc-800 transition cursor-pointer flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>BAG ({totalStoreItemsCount})</span>
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'organic_artisan') {
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition"
                style={{ backgroundColor: `${styles?.headerBg || '#FFFFFF'}E6`, borderColor: styles?.accentColor + '30' }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: styles?.accentColor + '20', color: styles?.accentColor }}>
                      🌱
                    </span>
                    <div>
                      <h1
                        className="font-bold text-lg sm:text-xl tracking-tight leading-none font-serif"
                        style={{ color: styles?.headingColor }}
                      >
                        {section.data.logoText || matchedStore.name}
                      </h1>
                      <span className="text-[10px] opacity-75 font-medium block mt-0.5">
                        {section.data.tagline || '100% Organic & Handcrafted'}
                      </span>
                    </div>
                  </div>

                  <nav className="hidden md:flex items-center gap-2 p-1.5 rounded-full bg-black/5 text-xs font-medium">
                    <a href="#products" className="px-4 py-1.5 rounded-full hover:bg-white transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink1 || 'Harvest'}
                    </a>
                    <a href="#featured" className="px-4 py-1.5 rounded-full hover:bg-white transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink2 || 'Provenance'}
                    </a>
                    <a href="#story" className="px-4 py-1.5 rounded-full hover:bg-white transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink3 || 'Artisan Story'}
                    </a>
                  </nav>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-full border bg-white transition cursor-pointer"
                      style={{ borderColor: styles?.accentColor + '40', color: styles?.headingColor }}
                    >
                      {activeCustomer ? `Hi, ${activeCustomer.name.split(' ')[0]}` : 'Sign In'}
                    </button>

                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-full shadow-sm transition transform active:scale-95 cursor-pointer"
                      style={{ backgroundColor: styles?.accentColor }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Artisanal Bag ({totalStoreItemsCount})</span>
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'neo_tech') {
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-xl transition bg-[#121212]/90 border-white/10"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono text-amber-400 font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <h1 className="font-bold text-base sm:text-lg tracking-wider font-mono text-white">
                        {section.data.logoText || matchedStore.name}
                      </h1>
                      <span className="text-[9px] font-mono text-amber-400 block tracking-widest">0% FEE PLATFORM ENGINE</span>
                    </div>
                  </div>

                  <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider text-slate-300">
                    <a href="#products" className="hover:text-amber-400 transition">// CATALOG</a>
                    <a href="#featured" className="hover:text-amber-400 transition">// HIGHLIGHTS</a>
                    <a href="#story" className="hover:text-amber-400 transition">// ENGINE SPECS</a>
                  </nav>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="px-3 py-1.5 text-xs font-mono text-slate-200 bg-white/5 border border-white/15 rounded-xl hover:bg-white/10 transition cursor-pointer"
                    >
                      {activeCustomer ? `USER: ${activeCustomer.name.split(' ')[0]}` : 'ACCESS LOGIN'}
                    </button>

                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-black rounded-xl transition shadow-lg transform active:scale-95 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>BAG ({totalStoreItemsCount})</span>
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'markly_luxe') {
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 bg-white border-b border-[#E6E6E6] transition"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                  <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#111111]" style={{ fontFamily: styles?.headingFont || 'Inter' }}>
                    {section.data.logoText || matchedStore.name}
                  </h1>

                  <nav className="hidden md:flex items-center gap-10 text-[13px] font-medium text-[#3D3D3D]">
                    <a href="#products" className="hover:text-[#111111] border-b border-transparent hover:border-[#111111] pb-0.5 transition">{section.data.navLink1 || 'Shop'}</a>
                    <a href="#featured" className="hover:text-[#111111] border-b border-transparent hover:border-[#111111] pb-0.5 transition">{section.data.navLink2 || 'Journal'}</a>
                    <a href="#story" className="hover:text-[#111111] border-b border-transparent hover:border-[#111111] pb-0.5 transition">{section.data.navLink3 || 'About'}</a>
                  </nav>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="px-4 py-2 text-[12px] font-semibold border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition cursor-pointer"
                    >
                      {activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}
                    </button>
                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="px-4 py-2 text-[12px] font-semibold bg-[#111111] text-white hover:bg-[#A35A2B] transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Bag ({totalStoreItemsCount})
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'parfum_botanical') {
            const olive = styles?.accentColor || '#A3B449';
            return (
              <header key={section.id} style={{ backgroundColor: styles?.backgroundColor || '#FCE4EC' }} className="pt-4 pb-3 px-4">
                {/* Floating white pill navigation */}
                <div className="max-w-4xl mx-auto bg-white rounded-full shadow-lg flex items-center justify-between gap-4 pl-6 pr-2 py-2">
                  <nav className="hidden md:flex items-center gap-6 text-[12px] uppercase tracking-[0.14em] font-medium text-[#4A4A4A]">
                    <a href="#products" className="hover:text-[#A3B449] transition">{section.data.navLink1 || 'Shop'}</a>
                    <a href="#featured" className="hover:text-[#A3B449] transition">{section.data.navLink2 || 'Collections'}</a>
                  </nav>

                  <h1
                    className="text-xl sm:text-2xl italic leading-none mx-auto md:mx-0"
                    style={{ color: styles?.headingColor || '#1E1E1E', fontFamily: styles?.headingFont || 'Playfair Display' }}
                  >
                    {displayLogoText}
                  </h1>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="px-4 py-2 text-[12px] font-semibold rounded-full border border-[#E9D5DC] text-[#4A4A4A] hover:border-[#A3B449] hover:text-[#A3B449] transition cursor-pointer"
                    >
                      {activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}
                    </button>
                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="px-4 py-2 text-[12px] font-bold rounded-full text-white hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
                      style={{ backgroundColor: olive }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Bag ({totalStoreItemsCount})
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'editorial_zine') {
            const sage = styles?.accentColor || '#8FBF7F';
            const ink = styles?.headingColor || '#141414';
            const cream = '#F5F2EC';
            return (
              <header key={section.id} style={{ backgroundColor: styles?.backgroundColor || '#E8E4DB' }} className="pt-4 pb-3 px-4">
                {/* Floating black pill navigation */}
                <div
                  className="max-w-4xl mx-auto rounded-full shadow-xl flex items-center justify-between gap-4 pl-7 pr-2 py-2"
                  style={{ backgroundColor: ink }}
                >
                  <h1
                    className="text-lg sm:text-xl italic leading-none whitespace-nowrap"
                    style={{ color: cream, fontFamily: styles?.headingFont || 'Fraunces' }}
                  >
                    {displayLogoText}
                  </h1>

                  <nav className="hidden md:flex items-center gap-7 text-[12px] uppercase tracking-[0.14em] font-medium" style={{ color: cream }}>
                    <a href="#products" className="hover:text-[#8FBF7F] transition">{section.data.navLink1 || 'Shop'}</a>
                    <a href="#featured" className="hover:text-[#8FBF7F] transition">{section.data.navLink2 || 'Bestsellers'}</a>
                    <a href="#story" className="hover:text-[#8FBF7F] transition">{section.data.navLink3 || 'Journal'}</a>
                  </nav>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="px-4 py-2 text-[12px] font-semibold rounded-full transition cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: '#A08D7B', color: cream }}
                    >
                      {activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}
                    </button>
                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="px-4 py-2 text-[12px] font-bold rounded-full transition cursor-pointer hover:opacity-90 flex items-center gap-1.5"
                      style={{ backgroundColor: sage, color: ink }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Bag ({totalStoreItemsCount})
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'quiet_luxe') {
            const ink = styles?.headingColor || '#23221D';
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition"
                style={{ backgroundColor: `${styles?.headerBg || '#F1EDE3'}F2`, borderColor: '#C7BEA8' }}
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
                  <h1
                    className="text-2xl sm:text-[26px] leading-none whitespace-nowrap"
                    style={{ color: ink, fontFamily: styles?.headingFont || 'Fraunces', fontWeight: 560, letterSpacing: '0.02em' }}
                  >
                    {displayLogoText}
                  </h1>

                  <nav className="hidden md:flex items-center gap-8">
                    <a href="#products" className="text-[14.5px] border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink1 || 'Shop'}
                    </a>
                    <a href="#featured" className="text-[14.5px] border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink2 || 'New Arrivals'}
                    </a>
                    <a href="#story" className="text-[14.5px] border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink3 || 'Journal'}
                    </a>
                  </nav>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: ink }}
                    >
                      <User className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">{activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}</span>
                    </button>

                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="relative flex items-center gap-1.5 text-[13.5px] hover:opacity-70 transition cursor-pointer"
                      style={{ color: ink }}
                    >
                      <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                      <span className="hidden sm:inline">Bag</span>
                      <span
                        className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                        style={{ backgroundColor: styles?.accentColor || '#4F5B3E' }}
                      >
                        {totalStoreItemsCount}
                      </span>
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'editorial_boutique') {
            const accent = styles?.accentColor || '#B4552D';
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition"
                style={{ backgroundColor: `${styles?.headerBg || '#F8F4ED'}F2`, borderColor: '#E3D9CA' }}
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-4 flex items-center justify-between gap-4">
                  <div>
                    <h1
                      className="text-xl sm:text-2xl leading-none tracking-tight"
                      style={{ color: styles?.headingColor || '#3E2E20', fontFamily: styles?.headingFont || 'Playfair Display' }}
                    >
                      {displayLogoText}
                    </h1>
                    <span className="text-[9px] uppercase tracking-[0.35em] block mt-1.5" style={{ color: accent }}>
                      {section.data.tagline || matchedStore.categoryLabel}
                    </span>
                  </div>

                  <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.18em] font-semibold">
                    <a href="#products" className="border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink1 || 'Collection'}
                    </a>
                    <a href="#featured" className="border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink2 || 'Editorial'}
                    </a>
                    <a href="#story" className="border-b border-transparent hover:border-current pb-0.5 transition" style={{ color: styles?.textColor }}>
                      {section.data.navLink3 || 'Maison'}
                    </a>
                  </nav>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold border transition hover:bg-black/[0.03] cursor-pointer"
                      style={{ borderColor: styles?.headingColor || '#3E2E20', color: styles?.headingColor || '#3E2E20' }}
                    >
                      {activeCustomer ? activeCustomer.name.split(' ')[0] : 'Account'}
                    </button>

                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold text-white transition hover:opacity-90 cursor-pointer flex items-center gap-2"
                      style={{ backgroundColor: accent }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Bag ({totalStoreItemsCount})</span>
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          if (layoutStyle === 'playful_pop') {
            return (
              <header
                key={section.id}
                className="sticky top-0 z-40 border-b backdrop-blur-md transition shadow-xs"
                style={{ backgroundColor: `${styles?.headerBg || '#FFFFFF'}F2`, borderColor: '#F7DCE4' }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-black shadow-sm -rotate-6"
                      style={{ backgroundColor: styles?.accentColor || '#FFC700', fontFamily: styles?.headingFont || 'Archivo Black' }}
                    >
                      {(section.data.logoText || matchedStore.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <h1
                      className="text-lg sm:text-xl uppercase tracking-tight leading-none"
                      style={{ color: styles?.headingColor || '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}
                    >
                      {displayLogoText}
                    </h1>
                  </div>

                  <nav className="hidden md:flex items-center gap-7 text-xs font-bold tracking-wider uppercase">
                    <a href="#products" className="hover:-rotate-2 transition inline-block" style={{ color: styles?.textColor }}>
                      {section.data.navLink1 || 'Shop'}
                    </a>
                    <a href="#featured" className="hover:-rotate-2 transition inline-block" style={{ color: styles?.textColor }}>
                      {section.data.navLink2 || 'New In'}
                    </a>
                    <a href="#story" className="hover:-rotate-2 transition inline-block" style={{ color: styles?.textColor }}>
                      {section.data.navLink3 || 'About'}
                    </a>
                  </nav>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsCustomerAuthOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border-2 border-black bg-white hover:bg-black hover:text-white transition cursor-pointer"
                      style={{ color: styles?.headingColor || '#111111' }}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{activeCustomer ? `Hi, ${activeCustomer.name.split(' ')[0]}` : 'Sign In'}</span>
                    </button>

                    <button
                      onClick={() => setIsBagDrawerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-black rounded-full text-black shadow-md transition transform hover:-rotate-2 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: styles?.accentColor || '#FFC700' }}
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      <span>Bag ({totalStoreItemsCount})</span>
                    </button>
                  </div>
                </div>
              </header>
            );
          }

          // Default: haute_atelier
          return (
            <header
              key={section.id}
              className="sticky top-0 z-40 border-b backdrop-blur-md transition shadow-xs"
              style={{
                backgroundColor: `${styles?.headerBg || '#FFFFFF'}E6`,
                borderColor: '#FFE4E6'
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {section.data.logoImg ? (
                    <img src={section.data.logoImg} alt={section.data.logoText} className="h-9 object-contain rounded-lg" />
                  ) : (
                    <div>
                      <h1
                        className="font-bold text-lg sm:text-xl tracking-tight leading-none"
                        style={{ color: styles?.headingColor || '#0F172A', fontFamily: styles?.headingFont || 'Playfair Display' }}
                      >
                        {displayLogoText}
                      </h1>
                      <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                        {section.data.tagline || matchedStore.categoryLabel}
                      </span>
                    </div>
                  )}
                </div>

                <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wider">
                  <a href="#products" className="hover:opacity-80 transition" style={{ color: styles?.textColor }}>
                    {section.data.navLink1 || 'Creations'}
                  </a>
                  <a href="#featured" className="hover:opacity-80 transition" style={{ color: styles?.textColor }}>
                    {section.data.navLink2 || 'Why 0% Fee'}
                  </a>
                  <a href="#story" className="hover:opacity-80 transition" style={{ color: styles?.textColor }}>
                    {section.data.navLink3 || 'About Studio'}
                  </a>
                </nav>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsCustomerAuthOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-2xl border border-[#FBCBCB] bg-white hover:bg-[#fedddd] text-[#881337] transition cursor-pointer shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-[#9F1239]" />
                    <span>{activeCustomer ? `Hi, ${activeCustomer.name.split(' ')[0]}` : 'Sign In / Account'}</span>
                  </button>

                  <button
                    onClick={() => setIsBagDrawerOpen(true)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white shadow-xs transition transform active:scale-95 ${
                      styles?.buttonRadius || 'rounded-2xl'
                    }`}
                    style={{ backgroundColor: styles?.accentColor || '#9F1239' }}
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>Bag ({totalStoreItemsCount})</span>
                  </button>
                </div>
              </div>
            </header>
          );
        }

        // ----------------------------------------------------
        // 3. HERO BANNER (4 Distinct UI Layout Variants)
        // ----------------------------------------------------
        if (section.type === 'hero') {
          const headlineText = (isPreviewMode && activeThemeMeta?.brandName) ? `${activeThemeMeta.brandName}` : (section.data.headline || section.data.title || `Bespoke Creations at ${matchedStore.name}`);
          const subText = (isPreviewMode && activeThemeMeta?.tagline) || section.data.subtext || section.data.subtitle || 'Direct from master artisans with 0% platform commission markup.';
          const badgeText = (isPreviewMode && activeThemeMeta?.aesthetic) || section.data.badgeText || section.data.badge || '✨ Pure D2C Craftsmanship';
          const ctaBtnText = section.data.ctaText || section.data.primaryBtnText || 'Explore Catalog';
          const heroImg = (isPreviewMode && activeThemeMeta?.heroImage) || section.data.imageUrl || section.data.heroImage || activeThemeMeta?.heroImage || '/theme-images/fashion-2.jpg';

          if (layoutStyle === 'camel_edit') {
            return (
              <section key={section.id} className="relative overflow-hidden" style={{ backgroundColor: '#FCFAF7' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-bold px-3 py-1 border" style={{ color: '#A97C50', borderColor: '#A97C50' }}>
                      {badgeText}
                    </span>
                    <h2
                      className="text-4xl sm:text-5xl lg:text-6xl uppercase leading-[1.02]"
                      style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}
                    >
                      {headlineText}
                    </h2>
                    <p className="text-base sm:text-lg max-w-md" style={{ color: '#4A423B', fontFamily: styles?.bodyFont || 'Work Sans' }}>
                      {subText}
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href="#categories"
                        className="px-8 py-3.5 rounded-full text-sm font-bold text-white transition hover:opacity-85"
                        style={{ backgroundColor: '#111111' }}
                      >
                        {ctaBtnText}
                      </a>
                      <a
                        href="#best-sellers"
                        className="px-8 py-3.5 rounded-full text-sm font-bold border transition hover:opacity-80"
                        style={{ color: '#111111', borderColor: '#111111' }}
                      >
                        Best Sellers
                      </a>
                    </div>
                  </div>
                  <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
                    <img src={heroImg} alt={headlineText} className="w-full h-72 sm:h-96 object-cover rounded-2xl" />
                    <div className="space-y-3 sm:space-y-4">
                      <img src="/theme-images/street-3.jpg" alt="Editorial look" className="w-full h-32 sm:h-44 object-cover rounded-2xl" />
                      <div className="rounded-2xl p-5 text-center flex flex-col justify-center h-32 sm:h-44" style={{ backgroundColor: '#A97C50', color: '#FCFAF7' }}>
                        <p className="text-3xl font-bold" style={{ fontFamily: styles?.headingFont || 'Archivo Black' }}>NEW</p>
                        <p className="text-[11px] uppercase tracking-[0.2em] mt-1">Season Drop 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'bloom_beauty') {
            return (
              <section key={section.id} className="relative overflow-hidden" style={{ backgroundColor: '#F9EDEB' }}>
                <div className="absolute top-20 -left-24 w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none" style={{ backgroundColor: '#F3CFCB' }} />
                <div className="absolute bottom-0 -right-16 w-80 h-80 rounded-full opacity-40 blur-3xl pointer-events-none" style={{ backgroundColor: '#EFD9DC' }} />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div className="space-y-5">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-white" style={{ backgroundColor: '#8E4356' }}>
                      <Sparkles className="w-3.5 h-3.5" /> {badgeText}
                    </span>
                    <h2
                      className="text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08]"
                      style={{ color: '#3A1B2A', fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700 }}
                    >
                      {headlineText}
                    </h2>
                    <p className="text-base sm:text-lg max-w-md" style={{ color: '#6B4A55' }}>
                      {subText}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <a
                        href="#products"
                        className="px-7 py-3 rounded-full text-sm font-semibold text-white shadow-md hover:opacity-90 transition"
                        style={{ backgroundColor: '#8E4356' }}
                      >
                        {ctaBtnText}
                      </a>
                      <a
                        href="#offer"
                        className="px-7 py-3 rounded-full text-sm font-semibold border hover:opacity-80 transition"
                        style={{ color: '#8E4356', borderColor: '#8E4356' }}
                      >
                        View Offers
                      </a>
                    </div>
                    <div className="flex items-center gap-6 pt-4">
                      {[
                        { n: '500+', l: 'Happy Customers' },
                        { n: '100%', l: 'Cruelty Free' },
                        { n: '4.9★', l: 'Avg Rating' },
                      ].map((st) => (
                        <div key={st.l}>
                          <p className="text-xl font-bold" style={{ color: '#8E4356', fontFamily: styles?.headingFont || 'Playfair Display' }}>{st.n}</p>
                          <p className="text-[11px] uppercase tracking-wider" style={{ color: '#6B4A55' }}>{st.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={heroImg}
                      alt={headlineText}
                      className="w-full h-[380px] sm:h-[460px] object-cover rounded-t-[10rem] rounded-b-[2rem] shadow-xl"
                    />
                    <div className="absolute -bottom-5 left-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border" style={{ borderColor: '#F0DBDD' }}>
                      <img src="/theme-images/beauty-2.jpg" alt="Featured product" className="w-10 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#3A1B2A' }}>Rose Quartz Elixir</p>
                        <p className="text-xs font-bold" style={{ color: '#8E4356' }}>₹1,899</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'olive_linen') {
            return (
              <section key={section.id} className="relative overflow-hidden" style={{ backgroundColor: '#F5F3EE' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center space-y-5">
                  <span className="inline-block text-[11px] uppercase tracking-[0.25em] font-semibold px-3 py-1 border" style={{ color: '#3B4A2F', borderColor: '#3B4A2F' }}>
                    {badgeText}
                  </span>
                  <h2
                    className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] max-w-3xl mx-auto"
                    style={{ color: '#232A1D', fontFamily: styles?.headingFont || 'Fraunces', fontWeight: 560 }}
                  >
                    {headlineText}
                  </h2>
                  <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: '#4A5240', fontFamily: styles?.bodyFont || 'Work Sans' }}>
                    {subText}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <a
                      href="#products"
                      className="px-7 py-3 rounded-md text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
                      style={{ backgroundColor: '#3B4A2F' }}
                    >
                      {ctaBtnText}
                    </a>
                    {section.data.secondaryBtnText && (
                      <a
                        href="#story"
                        className="px-7 py-3 rounded-md text-sm font-semibold border hover:opacity-80 transition"
                        style={{ color: '#232A1D', borderColor: '#3B4A2F' }}
                      >
                        {section.data.secondaryBtnText}
                      </a>
                    )}
                  </div>
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
                  <img src={heroImg} alt={headlineText} className="w-full h-[300px] sm:h-[420px] object-cover rounded-sm" />
                </div>
              </section>
            );
          }

          if (layoutStyle === 'modern_editorial') {
            return (
              <section key={section.id} className="relative bg-black text-white py-20 sm:py-32 overflow-hidden border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-8 space-y-6">
                    <span className="px-3 py-1 font-mono text-xs font-bold bg-white text-black uppercase tracking-widest inline-block">
                      [EDITORIAL RELEASE // {matchedStore.name}]
                    </span>
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-mono uppercase tracking-tight leading-[1.05]">
                      {headlineText}
                    </h2>
                    <p className="text-sm sm:text-base font-mono opacity-80 max-w-xl leading-relaxed">
                      {subText}
                    </p>
                    <div className="pt-4 flex flex-wrap items-center gap-4">
                      <a
                        href="#products"
                        className="px-8 py-4 bg-white text-black font-mono font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition"
                      >
                        {ctaBtnText} →
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-4 border-2 border-white p-2">
                    <img src={heroImg} alt="Editorial Hero" className="w-full h-80 sm:h-96 object-cover" />
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'neo_tech') {
            return (
              <section key={section.id} className="bg-[#0B0C10] text-white py-20 sm:py-28 overflow-hidden relative border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      {badgeText}
                    </div>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight leading-tight text-white">
                      {headlineText}
                    </h2>
                    <p className="text-sm sm:text-base font-mono text-slate-300 leading-relaxed max-w-xl">{subText}</p>
                    <div className="pt-4 flex flex-wrap items-center gap-4 font-mono">
                      <a
                        href="#products"
                        className="px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-black shadow-lg hover:brightness-110 transition"
                        style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                      >
                        {ctaBtnText} →
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-2 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/30">
                    <img src={heroImg} alt="Cyber Hero" className="w-full h-80 sm:h-96 object-cover rounded-xl" />
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'markly_luxe') {
            return (
              <section key={section.id} className="grid grid-cols-1 lg:grid-cols-2 min-h-[34rem]">
                {/* Left: editorial copy + newsletter capture */}
                <div className="flex flex-col justify-center gap-6 px-8 sm:px-14 py-14 bg-white">
                  {badgeText && (
                    <span className="text-[11px] uppercase tracking-[0.3em] font-semibold" style={{ color: styles?.accentColor || '#A35A2B' }}>
                      {badgeText}
                    </span>
                  )}
                  <h2
                    className="text-3xl sm:text-5xl leading-[1.12] tracking-tight m-0"
                    style={{ color: styles?.headingColor || '#111111', fontFamily: styles?.headingFont || 'Inter', fontWeight: 600 }}
                  >
                    {headlineText}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed max-w-md m-0" style={{ color: styles?.textColor || '#3D3D3D' }}>
                    {subText}
                  </p>

                  {/* Newsletter capture row (Markly signature) — real signup */}
                  {newsletterDone ? (
                    <p className="text-sm font-bold" style={{ color: '#8E4356' }}>✓ Subscribed! Watch your inbox for early access.</p>
                  ) : (
                    <form
                      onSubmit={handleStoreSubscribe}
                      className="flex w-full max-w-md border border-[#111111]"
                    >
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        aria-label="Email address for newsletter"
                        className="flex-1 px-4 py-3 text-sm outline-none bg-white text-[#111111] placeholder:text-[#9C9C9C]"
                      />
                      <button
                        type="submit"
                        disabled={newsletterBusy}
                        className="px-6 py-3 text-[12px] font-bold uppercase tracking-[0.15em] bg-[#111111] text-white hover:bg-[#A35A2B] transition cursor-pointer disabled:opacity-60"
                      >
                        {newsletterBusy ? 'Subscribing…' : 'Subscribe'}
                      </button>
                    </form>
                  )}
                  {newsletterError && (
                    <p className="text-xs font-semibold text-red-600">{newsletterError}</p>
                  )}

                  <a
                    href="#products"
                    className="text-[13px] font-semibold underline underline-offset-8 decoration-2 hover:opacity-70 transition w-fit"
                    style={{ color: styles?.headingColor || '#111111' }}
                  >
                    {ctaBtnText} →
                  </a>
                </div>

                {/* Right: full-height grayscale photograph */}
                <div className="relative min-h-[24rem] overflow-hidden group">
                  <img
                    src={heroImg}
                    alt="Editorial"
                    className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              </section>
            );
          }

          if (layoutStyle === 'parfum_botanical') {
            const olive = styles?.accentColor || '#A3B449';
            const words = headlineText.split(' ');
            return (
              <section key={section.id} className="relative h-[34rem] sm:h-[40rem] overflow-hidden">
                {/* Full-bleed hero image with slow Ken Burns zoom */}
                <img
                  src={heroImg}
                  alt="Botanical Hero"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ animation: 'parfum-kenburns 18s ease-out forwards' }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(30,30,30,0.30) 0%, rgba(30,30,30,0.12) 45%, rgba(30,30,30,0.55) 100%)' }} />

                {/* Floating botanical stickers */}
                <span
                  className="absolute top-16 left-[10%] w-20 h-20 rounded-full hidden sm:flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[#1E1E1E] shadow-lg select-none"
                  style={{ backgroundColor: '#F4C95D', animation: 'parfum-float 6s ease-in-out infinite' }}
                >
                  100%
                  <br />Natural
                </span>
                <span
                  className="absolute bottom-24 right-[8%] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg hidden sm:block select-none -rotate-3"
                  style={{ backgroundColor: olive, animation: 'parfum-float 7s ease-in-out infinite 1s' }}
                >
                  Cruelty Free ✿
                </span>

                {/* Centered mixed-italic serif headline */}
                <div className="relative h-full flex flex-col items-center justify-center text-center px-6 space-y-6" style={{ animation: 'parfum-fadeup 1s ease-out both' }}>
                  {badgeText && (
                    <span className="text-[11px] uppercase tracking-[0.35em] text-white/90 font-semibold">
                      — {badgeText} —
                    </span>
                  )}
                  <h2
                    className="text-4xl sm:text-6xl lg:text-7xl leading-[1.08] max-w-3xl"
                    style={{ color: '#FFFFFF', fontFamily: styles?.headingFont || 'Playfair Display' }}
                  >
                    {words.map((w, i) =>
                      i % 3 === 2 ? (
                        <em key={i} className="italic font-normal">{w} </em>
                      ) : (
                        <span key={i}>{w} </span>
                      )
                    )}
                  </h2>
                  <p className="text-sm sm:text-base text-white/85 max-w-md leading-relaxed">{subText}</p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <a
                      href="#products"
                      className="px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] font-bold bg-white text-[#1E1E1E] rounded-full shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl"
                    >
                      {ctaBtnText}
                    </a>
                    {section.data.secondaryCtaText && (
                      <a
                        href="#story"
                        className="px-7 py-3 text-[12px] uppercase tracking-[0.2em] font-bold text-white rounded-full border-2 border-white/70 backdrop-blur-sm hover:bg-white/10 transition"
                      >
                        {section.data.secondaryCtaText}
                      </a>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'editorial_zine') {
            const sage = styles?.accentColor || '#8FBF7F';
            const ink = styles?.headingColor || '#141414';
            const taupe = '#A08D7B';
            const pink = '#E8A4B8';
            // Stacked editorial headline: mixed caps + lowercase spacing per the zine reference
            const words = headlineText.split(' ');
            const stacked = words.map((w, i) =>
              i % 3 === 1 ? (
                <span key={i} className="block lowercase italic tracking-tight" style={{ color: taupe }}>{w}</span>
              ) : i % 3 === 2 && words.length > 3 ? (
                <span key={i} className="block" style={{ paddingLeft: '2.5rem', color: ink }}>{w}</span>
              ) : (
                <span key={i} className="block uppercase" style={{ color: ink }}>{w}</span>
              )
            );
            return (
              <section
                key={section.id}
                className="relative overflow-hidden py-10 sm:py-14"
                style={{ backgroundColor: styles?.backgroundColor || '#E8E4DB' }}
              >
                {/* Decorative sparkles */}
                <span className="absolute top-10 left-[8%] text-3xl select-none" style={{ color: pink }}>✦</span>
                <span className="absolute bottom-24 right-[10%] text-2xl select-none" style={{ color: sage }}>✦</span>
                <span className="absolute top-1/3 right-[6%] text-xl select-none" style={{ color: taupe }}>✦</span>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  {/* Left: oversized editorial stack */}
                  <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <span className="w-10 h-px" style={{ backgroundColor: ink }} />
                      <span className="text-[11px] uppercase tracking-[0.3em] font-semibold" style={{ color: taupe }}>
                        {badgeText}
                      </span>
                      <span className="w-10 h-px" style={{ backgroundColor: ink }} />
                    </div>

                    <h2
                      className="text-[13vw] sm:text-6xl lg:text-7xl leading-[0.98] m-0"
                      style={{ fontFamily: styles?.headingFont || 'Fraunces', fontWeight: 450 }}
                    >
                      {stacked}
                    </h2>

                    <div className="flex items-center justify-center lg:justify-start gap-2 text-sm" style={{ color: ink }}>
                      <span>✦</span><span>✦</span><span>✦</span>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0" style={{ color: styles?.textColor || '#4A463E' }}>
                      {subText}
                    </p>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-2">
                      <a
                        href="#products"
                        className="px-8 py-3 text-[13px] uppercase tracking-[0.16em] font-semibold rounded-full transition hover:-translate-y-0.5 shadow-md"
                        style={{ backgroundColor: ink, color: '#F5F2EC' }}
                      >
                        {ctaBtnText}
                      </a>
                      <a
                        href="#story"
                        className="text-[13px] uppercase tracking-[0.14em] font-semibold underline underline-offset-[6px] decoration-2 transition hover:opacity-70"
                        style={{ color: ink, textDecorationColor: sage }}
                      >
                        {section.data.secondaryCtaText || 'Watch Reviews'} →
                      </a>
                    </div>
                  </div>

                  {/* Right: sage arch image block */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div
                      className="relative w-64 sm:w-80 pt-10 pb-6 px-6 rounded-t-[999px] rounded-b-[2rem] shadow-xl overflow-hidden"
                      style={{ backgroundColor: sage }}
                    >
                      <img
                        src={heroImg}
                        alt="Editorial"
                        className="w-full h-72 sm:h-80 object-cover rounded-t-[999px] rounded-b-xl border-4"
                        style={{ borderColor: '#F5F2EC' }}
                      />
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xl select-none" style={{ color: '#F5F2EC' }}>✦</div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'quiet_luxe') {
            const ink = styles?.headingColor || '#23221D';
            const moss = styles?.accentColor || '#4F5B3E';
            return (
              <section
                key={section.id}
                className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] min-h-[560px]"
                style={{ backgroundColor: styles?.surfaceColor || '#E7E1D2' }}
              >
                <div className="flex flex-col justify-center gap-6 p-10 sm:p-16">
                  <span className="text-[13px]" style={{ color: '#3B4530' }}>
                    {badgeText}
                  </span>
                  <h2
                    className="text-4xl sm:text-5xl leading-[1.08] italic max-w-[11ch] m-0"
                    style={{ color: ink, fontFamily: styles?.headingFont || 'Fraunces', fontWeight: 450 }}
                  >
                    {headlineText}
                  </h2>
                  <p
                    className="text-[15.5px] leading-[1.6] max-w-[40ch] m-0"
                    style={{ color: styles?.textColor || '#4B4A41', fontFamily: styles?.bodyFont || 'Work Sans' }}
                  >
                    {subText}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href="#products"
                      className="inline-flex items-center gap-2 px-7 py-3 text-[14px] rounded-sm transition hover:opacity-90"
                      style={{ backgroundColor: ink, color: '#FBFAF6' }}
                    >
                      {ctaBtnText}
                    </a>
                    {section.data.secondaryCtaText && (
                      <a
                        href="#story"
                        className="inline-flex items-center px-6 py-3 text-[14px] rounded-sm border transition hover:text-white"
                        style={{ borderColor: ink, color: ink }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ink; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {section.data.secondaryCtaText}
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative min-h-[24rem]">
                  {/* Sage arch color-block behind the lookbook image */}
                  <div
                    className="absolute inset-x-6 sm:inset-x-12 top-5 bottom-0 rounded-t-[999px] pointer-events-none"
                    style={{ backgroundColor: '#7C8B6F' }}
                  />
                  <img
                    src={heroImg}
                    alt="Lookbook"
                    className="absolute inset-x-2 sm:inset-x-8 top-0 bottom-0 w-auto h-full object-cover rounded-t-[999px] rounded-b-sm"
                    style={{ boxShadow: '0 24px 50px -20px rgba(35,34,29,0.45)' }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 45%)' }}
                  />
                  <div
                    className="absolute bottom-4 left-4 px-4 py-2 text-[12px] italic rounded-sm"
                    style={{ backgroundColor: 'rgba(35,34,29,0.75)', color: '#F1EDE3', fontFamily: styles?.headingFont || 'Fraunces' }}
                  >
                    {matchedStore.name} — {matchedStore.categoryLabel || 'Essentials'}
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'editorial_boutique') {
            const accent = styles?.accentColor || '#B4552D';
            return (
              <section
                key={section.id}
                className="relative overflow-hidden"
                style={{ backgroundColor: styles?.backgroundColor || '#F8F4ED' }}
              >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
                  {/* Left: editorial text column */}
                  <div className="py-16 sm:py-24 lg:pr-16 space-y-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-px" style={{ backgroundColor: accent }} />
                      <span className="text-[10px] uppercase tracking-[0.35em] font-semibold" style={{ color: accent }}>
                        {badgeText}
                      </span>
                    </div>

                    <h2
                      className="text-4xl sm:text-5xl lg:text-6xl leading-[1.12] tracking-tight"
                      style={{ color: styles?.headingColor || '#3E2E20', fontFamily: styles?.headingFont || 'Playfair Display' }}
                    >
                      {headlineText}
                    </h2>

                    <p
                      className="text-sm sm:text-base leading-relaxed max-w-md border-l pl-5"
                      style={{ color: styles?.textColor || '#6B5D4F', borderColor: '#E3D9CA' }}
                    >
                      {subText}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <a
                        href="#products"
                        className="px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-white transition hover:opacity-90 flex items-center gap-2"
                        style={{ backgroundColor: accent }}
                      >
                        {ctaBtnText}
                      </a>
                      {section.data.secondaryCtaText && (
                        <a
                          href="#story"
                          className="px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold border transition hover:bg-black/[0.03]"
                          style={{ borderColor: styles?.headingColor || '#3E2E20', color: styles?.headingColor || '#3E2E20' }}
                        >
                          {section.data.secondaryCtaText}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: full-height lookbook image */}
                  <div className="relative min-h-[26rem] lg:min-h-[36rem]">
                    <img
                      src={heroImg}
                      alt="Editorial Lookbook"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] font-semibold"
                      style={{ backgroundColor: `${styles?.headingColor || '#3E2E20'}E6`, color: '#F8F4ED' }}
                    >
                      <span>{matchedStore.name} — Lookbook</span>
                      <span style={{ color: accent }}>Est. 0% Commission</span>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (layoutStyle === 'playful_pop') {
            const accent = styles?.accentColor || '#FFC700';
            return (
              <section
                key={section.id}
                className="relative overflow-hidden py-16 sm:py-24"
                style={{ backgroundColor: styles?.backgroundColor || '#FFFFFF' }}
              >
                {/* Candy decoration: giant pink disc, mint dots, lilac ring */}
                <div
                  className="absolute -top-28 -right-28 w-[28rem] h-[28rem] rounded-full pointer-events-none"
                  style={{ backgroundColor: '#FF8FC5', opacity: 0.85 }}
                />
                <div
                  className="absolute -top-28 -right-28 w-[28rem] h-[28rem] rounded-full pointer-events-none"
                  style={{ boxShadow: '0 0 0 22px #7DE3C3 inset', opacity: 0.5 }}
                />
                <div className="absolute top-16 left-6 w-28 h-28 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#7DE3C3 2.5px, transparent 2.5px)', backgroundSize: '18px 18px', opacity: 0.7 }}
                />
                <div className="absolute bottom-10 left-[42%] w-16 h-16 rounded-full border-4 pointer-events-none hidden sm:block"
                  style={{ borderColor: '#B8A7FF' }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-7">
                    {badgeText && (
                      <span
                        className="inline-block px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-black shadow-md rotate-[-2deg] transition hover:rotate-0"
                        style={{ backgroundColor: accent, borderRadius: '9999px' }}
                      >
                        ⭐ {badgeText}
                      </span>
                    )}

                    <h2
                      className="text-4xl sm:text-6xl lg:text-7xl uppercase leading-[1.02] tracking-tight"
                      style={{ color: styles?.headingColor || '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}
                    >
                      {headlineText.split(' ').map((word, i) =>
                        i % 4 === 3 ? (
                          <span key={i} className="relative inline-block px-1">
                            <span className="absolute inset-x-0 bottom-1 h-[0.38em] -z-10 rounded-sm" style={{ backgroundColor: ['#FFC700', '#FF8FC5', '#7DE3C3', '#B8A7FF'][Math.floor(i / 4) % 4] }} />
                            <span className="relative">{word}</span>
                          </span>
                        ) : (
                          <span key={i}>{word} </span>
                        )
                      )}
                    </h2>

                    <p
                      className="text-sm sm:text-base leading-relaxed max-w-xl"
                      style={{ color: styles?.textColor || '#3F3F46', fontFamily: styles?.bodyFont || 'Poppins' }}
                    >
                      {subText}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <a
                        href="#products"
                        className="px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_6px_0_rgba(0,0,0,1)] rounded-full transition transform hover:translate-y-[2px] hover:shadow-[0_4px_0_rgba(0,0,0,1)] active:translate-y-[6px] active:shadow-none flex items-center gap-2"
                        style={{ backgroundColor: accent }}
                      >
                        {ctaBtnText} <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </a>

                      {section.data.secondaryCtaText && (
                        <a
                          href="#story"
                          className="px-6 py-3.5 text-xs sm:text-sm font-bold rounded-full border-2 border-black hover:bg-black hover:text-white transition"
                          style={{ color: styles?.headingColor || '#111111' }}
                        >
                          {section.data.secondaryCtaText}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    {/* Rotated polaroid-style image card with sticker */}
                    <div
                      className="relative p-3 bg-white shadow-[0_18px_40px_-12px_rgba(17,17,17,0.25)] border-2 border-black rotate-[2.5deg] hover:rotate-0 transition duration-500"
                      style={{ borderRadius: '1.75rem' }}
                    >
                      <img
                        src={heroImg}
                        alt="Storefront Hero"
                        className="w-full h-80 sm:h-[26rem] object-cover"
                        style={{ borderRadius: '1.4rem' }}
                      />
                      <div
                        className="absolute -top-4 -right-4 w-20 h-20 flex items-center justify-center text-center text-[10px] font-black uppercase leading-tight text-black shadow-lg rotate-[10deg]"
                        style={{ backgroundColor: accent, borderRadius: '9999px' }}
                      >
                        100%
                        <br />Direct
                        <br />D2C
                      </div>
                      <div
                        className="absolute -bottom-4 -left-4 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-black shadow-lg -rotate-3"
                        style={{ backgroundColor: accent }}
                      >
                        {matchedStore.name} ★
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          // Default: haute_atelier
          return (
            <section
              key={section.id}
              className="relative overflow-hidden py-16 sm:py-24"
              style={{ backgroundColor: styles?.surfaceColor || '#FFF3EC' }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                  {badgeText && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                      style={{
                        backgroundColor: `${styles?.accentColor || '#9F1239'}20`,
                        color: styles?.accentColor || '#9F1239'
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> {badgeText}
                    </span>
                  )}

                  <h2
                    className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15]"
                    style={{
                      color: styles?.headingColor || '#0F172A',
                      fontFamily: styles?.headingFont || 'Playfair Display'
                    }}
                  >
                    {headlineText}
                  </h2>

                  <p className="text-sm sm:text-base leading-relaxed max-w-xl opacity-90">
                    {subText}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href="#products"
                      className={`px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 ${
                        styles?.buttonRadius || 'rounded-2xl'
                      }`}
                      style={{ backgroundColor: styles?.accentColor || '#9F1239' }}
                    >
                      {ctaBtnText} <ArrowRight className="w-4 h-4" />
                    </a>

                    {section.data.secondaryCtaText && (
                      <a
                        href="#story"
                        className={`px-5 py-3 text-xs sm:text-sm font-bold border transition hover:bg-black/5 ${
                          styles?.buttonRadius || 'rounded-2xl'
                        }`}
                        style={{
                          borderColor: styles?.accentColor || '#9F1239',
                          color: styles?.headingColor || '#0F172A'
                        }}
                      >
                        {section.data.secondaryCtaText}
                      </a>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div
                    className={`relative overflow-hidden shadow-2xl border ${
                      styles?.buttonRadius || 'rounded-3xl'
                    }`}
                    style={{ borderColor: '#FFE4E6' }}
                  >
                    <img
                      src={heroImg}
                      alt="Storefront Hero"
                      className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition duration-700"
                    />
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold block text-stone-900 font-serif">{matchedStore.name}</span>
                        <span className="text-[10px] text-emerald-800 font-semibold">100% Authentic Guaranteed</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        Free Express Delivery
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ----------------------------------------------------
        // 4. FEATURED RIBBON
        // ----------------------------------------------------
        if (section.type === 'featured_ribbon') {
          // Markly: Journal — 3-col editorial cards from live products
          if (layoutStyle === 'markly_luxe') {
            return (
              <div id="featured" key={section.id} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ backgroundColor: styles?.backgroundColor || '#FFFFFF' }}>
                <div className="flex items-baseline justify-between border-b border-[#E6E6E6] pb-4 mb-8">
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: styles?.headingColor || '#111111', fontFamily: styles?.headingFont || 'Inter' }}>
                    {section.data.title || 'The Journal'}
                  </h3>
                  <a href="#products" className="text-[12px] font-semibold underline underline-offset-4 hover:opacity-70 transition" style={{ color: styles?.headingColor || '#111111' }}>
                    View All →
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {storeProducts.slice(0, 3).map((product) => {
                    const img = (product.images && product.images[0]) || product.imageUrl || product.image || activeThemeMeta?.heroImage || '/theme-images/fashion-2.jpg';
                    return (
                      <Link key={product.id} to={`/product/${product.id}`} className="group block">
                        <div className="overflow-hidden aspect-[4/3] bg-[#F6F6F6]">
                          <img src={img} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition duration-700" />
                        </div>
                        <div className="pt-4 space-y-1.5">
                          <h4 className="text-base font-semibold leading-snug line-clamp-1" style={{ color: styles?.headingColor || '#111111' }}>
                            {product.name}
                          </h4>
                          <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: '#757575' }}>
                            {product.description || section.data.subtitle || 'Notes from the atelier.'}
                          </p>
                          <span className="inline-block text-[12px] font-semibold underline underline-offset-4 group-hover:opacity-60 transition" style={{ color: styles?.accentColor || '#A35A2B' }}>
                            Read More
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Parfum: animated press marquee with mixed-style wordmarks
          if (layoutStyle === 'parfum_botanical') {
            const press = ['VOGUE', 'ELLE', 'Harper\'s BAZAAR', 'GQ', 'COSMOPOLITAN', 'ALLURE'];
            const marks = press.map((p, i) => (
              <span key={i} className="mx-8 text-lg sm:text-xl whitespace-nowrap" style={{
                fontFamily: i % 3 === 0 ? 'Playfair Display' : i % 3 === 1 ? 'Poppins' : 'Work Sans',
                fontWeight: i % 2 === 0 ? 700 : 400,
                fontStyle: i % 3 === 1 ? 'italic' : 'normal',
                letterSpacing: '0.08em',
                color: styles?.headingColor || '#1E1E1E',
                opacity: 0.75
              }}>
                {p} <span style={{ color: styles?.accentColor }}>✿</span>
              </span>
            ));
            return (
              <div id="featured" key={section.id} className="py-10 overflow-hidden" style={{ backgroundColor: styles?.backgroundColor || '#FCE4EC' }}>
                <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#4A4A4A] mb-5">{section.data.subtitle || 'As featured in'}</p>
                <div
                  className="flex w-max"
                  style={{ animation: 'parfum-marquee 28s linear infinite' }}
                  onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
                >
                  <div className="flex items-center">{marks}</div>
                  <div className="flex items-center" aria-hidden="true">{marks}</div>
                </div>
                {section.data.title && (
                  <h3 className="text-center text-xl sm:text-2xl italic mt-8" style={{ fontFamily: styles?.headingFont, color: styles?.headingColor }}>
                    {section.data.title}
                  </h3>
                )}
              </div>
            );
          }

          return (
            <div
              id="featured"
              key={section.id}
              className="py-8 px-4 text-center space-y-2 border-b border-black/5"
              style={{ backgroundColor: styles?.backgroundColor }}
            >
              {section.data.badge && (
                <span
                  className={`px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider inline-block shadow-xs ${
                    layoutStyle === 'organic_artisan' ? 'rounded-full' : layoutStyle === 'modern_editorial' ? 'rounded-none font-mono' : layoutStyle === 'playful_pop' ? 'rounded-full text-black font-black rotate-[-2deg]' : 'rounded-md'
                  }`}
                  style={{ backgroundColor: styles?.accentColor || '#9F1239' }}
                >
                  {section.data.badge}
                </span>
              )}
              <h3
                className="text-xl sm:text-2xl font-bold"
                style={{ fontFamily: styles?.headingFont, color: styles?.headingColor }}
              >
                {section.data.title || 'Curated Store Highlights'}
              </h3>
              <p className="text-xs opacity-80 max-w-lg mx-auto">{section.data.subtitle}</p>
            </div>
          );
        }

        // ----------------------------------------------------
        // 5. PRODUCT GRID (4 Distinct Card & Layout Styles)
        // ----------------------------------------------------
        if (section.type === 'product_grid' || section.type === 'products') {
          if (layoutStyle === 'camel_edit') {
            const cItems = ((isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts)
              .map((pr) => ({ ...pr, stockQuantity: (pr.stockQuantity ?? pr.stock ?? 50) }));
            const cCats = ['All', ...Array.from(new Set(cItems.map((pr) => String(pr.category || 'Collection'))))];
            const catImg = (cat) => {
              const f = cItems.find((pr) => String(pr.category) === cat);
              return (f && ((f.images && f.images[0]) || f.imageUrl || f.image)) || '/theme-images/fashion-2.jpg';
            };
            const cVisible = camelCategory === 'All' ? cItems : cItems.filter((pr) => String(pr.category) === camelCategory);
            return (
              <section id="products" key={section.id} className="py-14" style={{ backgroundColor: '#FCFAF7' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                  <div className="text-center space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#A97C50' }}>Curated For You</span>
                    <h3 className="text-3xl sm:text-4xl uppercase" style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}>
                      {section.data.title || 'Shop By Category'}
                    </h3>
                  </div>

                  {/* CATEGORY CARDS (working filter) */}
                  <div id="categories" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {cCats.filter((c) => c !== 'All').map((cat) => {
                      const active = camelCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCamelCategory(cat)}
                          className={'group relative overflow-hidden rounded-2xl border transition cursor-pointer ' + (active ? 'ring-2 ring-offset-2' : 'hover:opacity-90')}
                          style={{ borderColor: active ? '#111111' : '#E9E2D9' }}
                        >
                          <img src={catImg(cat)} alt={cat} className="w-full h-40 sm:h-48 object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                          <span className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.65), transparent 55%)' }} />
                          <span className="absolute bottom-3 left-4 text-white text-sm font-bold uppercase tracking-wider" style={{ fontFamily: styles?.bodyFont || 'Work Sans' }}>
                            {cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* FILTER CHIPS */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {cCats.map((cat) => {
                      const active = camelCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCamelCategory(cat)}
                          className={'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer border ' + (active ? 'text-white' : 'hover:border-black')}
                          style={{ backgroundColor: active ? '#111111' : 'transparent', borderColor: active ? '#111111' : '#E9E2D9', color: active ? '#FFFFFF' : '#4A423B' }}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* GRID */}
                  {cVisible.length === 0 ? (
                    <p className="text-center text-sm py-8" style={{ color: '#4A423B' }}>
                      No products in “{camelCategory}”. <button onClick={() => setCamelCategory('All')} className="underline cursor-pointer" style={{ color: '#A97C50' }}>View all</button>
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {cVisible.slice(0, section.data.columns || section.data.itemsCount || 6).map((product) => {
                        const priceVal = Number(product.sellingPriceINR || product.price || 0);
                        const oos = Number(product.stockQuantity) <= 0;
                        const img = (product.images && product.images[0]) || product.imageUrl || product.image || '/theme-images/fashion-1.png';
                        return (
                          <div key={product.id} className="group">
                            <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: '#E9E2D9', backgroundColor: '#FFFFFF' }}>
                              {product.tag && (
                                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-full" style={{ backgroundColor: '#111111' }}>
                                  {product.tag}
                                </span>
                              )}
                              <img src={img} alt={product.name} className="w-full h-64 sm:h-80 object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                              <button
                                onClick={() => handleQuickAdd(product)}
                                disabled={oos}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-14 group-hover:translate-y-0 w-[85%] py-2.5 rounded-full text-[13px] font-bold text-white shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#111111' }}
                              >
                                {oos ? 'Sold Out' : 'Add to Bag'}
                              </button>
                            </div>
                            <div className="pt-3 space-y-1 text-center">
                              <p className="text-[11px] uppercase tracking-wider" style={{ color: '#A97C50' }}>{product.category}</p>
                              <h4 className="text-[15px] font-medium leading-snug" style={{ color: '#111111' }}>{product.name}</h4>
                              <p className="text-[14px] font-bold" style={{ color: '#111111' }}>
                                ₹{priceVal.toLocaleString('en-IN')}
                                {Number(product.discountPercent) > 0 && (
                                  <span className="ml-2 text-xs font-normal line-through opacity-50" style={{ color: '#4A423B' }}>
                                    ₹{Math.round(priceVal * (1 + Number(product.discountPercent) / 100)).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          }
          if (layoutStyle === 'bloom_beauty') {
            const allItems = ((isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts)
              .map((pr) => ({ ...pr, stockQuantity: (pr.stockQuantity ?? pr.stock ?? 50) }));
            const categories = ['All', ...Array.from(new Set(allItems.map((pr) => String(pr.category || 'Collection'))))];
            const catThumb = (cat) => {
              const found = allItems.find((pr) => String(pr.category) === cat);
              return (found && ((found.images && found.images[0]) || found.imageUrl || found.image)) || '/theme-images/beauty-1.jpeg';
            };
            const visibleItems = bloomCategory === 'All' ? allItems : allItems.filter((pr) => String(pr.category) === bloomCategory);
            return (
              <section id="products" key={section.id} className="py-14 sm:py-18" style={{ backgroundColor: '#FDF8F6' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                  {/* BEST SELLERS header */}
                  <div className="text-center space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#8E4356' }}>
                      Shop by Category
                    </span>
                    <h3 className="text-3xl sm:text-4xl" style={{ color: '#3A1B2A', fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700 }}>
                      {section.data.title || 'The Full Collection'}
                    </h3>
                    <p className="text-sm max-w-md mx-auto" style={{ color: '#6B4A55' }}>
                      {section.data.subtitle || 'Browse every product by category — handpicked, small-batch, 0% platform commission.'}
                    </p>
                  </div>

                  {/* SHOP BY CATEGORY (working filter) */}
                  <div id="categories" className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    {categories.map((cat) => {
                      const active = bloomCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setBloomCategory(cat)}
                          className="group flex flex-col items-center gap-2 cursor-pointer"
                        >
                          <span
                            className={'block w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition ' + (active ? 'scale-105' : 'opacity-80 hover:opacity-100 hover:scale-105')}
                            style={{ borderColor: active ? '#8E4356' : '#F0DBDD' }}
                          >
                            <img src={cat === 'All' ? '/theme-images/beauty-4.jpg' : catThumb(cat)} alt={cat} className="w-full h-full object-cover" />
                          </span>
                          <span
                            className={'text-[12px] font-semibold transition ' + (active ? '' : 'opacity-70')}
                            style={{ color: active ? '#8E4356' : '#6B4A55' }}
                          >
                            {cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* PRODUCT GRID */}
                  {visibleItems.length === 0 ? (
                    <p className="text-center text-sm py-8" style={{ color: '#6B4A55' }}>
                      No products in “{bloomCategory}”. <button onClick={() => setBloomCategory('All')} className="underline cursor-pointer" style={{ color: '#8E4356' }}>View all</button>
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {visibleItems.slice(0, section.data.columns || section.data.itemsCount || 6).map((product) => {
                        const priceVal = Number(product.sellingPriceINR || product.price || 0);
                        const oos = Number(product.stockQuantity) <= 0;
                        const img = (product.images && product.images[0]) || product.imageUrl || product.image || '/theme-images/beauty-1.jpeg';
                        return (
                          <div key={product.id} className="group">
                            <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: '#F0DBDD', backgroundColor: '#FFFFFF' }}>
                              {product.tag && (
                                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-full" style={{ backgroundColor: '#8E4356' }}>
                                  {product.tag}
                                </span>
                              )}
                              <img
                                src={img}
                                alt={product.name}
                                className="w-full h-64 sm:h-80 object-cover group-hover:scale-[1.04] transition-transform duration-500"
                              />
                              <button
                                onClick={() => handleQuickAdd(product)}
                                disabled={oos}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-14 group-hover:translate-y-0 w-[85%] py-2.5 rounded-full text-[13px] font-semibold text-white shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#8E4356' }}
                              >
                                {oos ? 'Sold Out' : 'Add to Bag'}
                              </button>
                            </div>
                            <div className="pt-3 space-y-1 text-center">
                              <p className="text-[11px] uppercase tracking-wider" style={{ color: '#B08A95' }}>{product.category}</p>
                              <h4 className="text-[15px] font-medium leading-snug" style={{ color: '#3A1B2A' }}>
                                {product.name}
                              </h4>
                              <p className="text-[14px] font-bold" style={{ color: '#8E4356' }}>
                                ₹{priceVal.toLocaleString('en-IN')}
                                {Number(product.discountPercent) > 0 && (
                                  <span className="ml-2 text-xs font-normal line-through opacity-60" style={{ color: '#6B4A55' }}>
                                    ₹{Math.round(priceVal * (1 + Number(product.discountPercent) / 100)).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          }
          if (layoutStyle === 'olive_linen') {
            const items = ((isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts)
              .map((pr) => ({ ...pr, stockQuantity: (pr.stockQuantity ?? pr.stock ?? 50) }));
            return (
              <section id="products" key={section.id} className="py-16 sm:py-20" style={{ backgroundColor: '#F5F3EE' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                  <div className="text-center space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.25em] font-semibold block" style={{ color: '#3B4A2F' }}>
                      Collection
                    </span>
                    <h3 className="text-3xl sm:text-4xl" style={{ color: '#232A1D', fontFamily: styles?.headingFont || 'Fraunces', fontWeight: 560 }}>
                      {section.data.title || 'Shop the Edit'}
                    </h3>
                    <p className="text-sm max-w-md mx-auto" style={{ color: '#4A5240' }}>
                      {section.data.subtitle || 'Considered pieces, made to last — 0% platform commission.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {items.slice(0, section.data.columns || section.data.itemsCount || 6).map((product) => {
                      const priceVal = Number(product.sellingPriceINR || product.price || 0);
                      const img =
                        (product.images && product.images[0]) ||
                        product.imageUrl ||
                        product.image ||
                        '/theme-images/olive-1.jpg';
                      return (
                        <Link
                          key={product.id}
                          to={product.slug ? `/store/${matchedStore.subdomain}/product/${product.slug}` : '#products'}
                          className="group block"
                        >
                          <div className="relative overflow-hidden rounded-sm border" style={{ borderColor: '#E3E0D6', backgroundColor: '#FFFFFF' }}>
                            {product.tag && (
                              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white rounded-sm" style={{ backgroundColor: '#3B4A2F' }}>
                                {product.tag}
                              </span>
                            )}
                            <img
                              src={img}
                              alt={product.name}
                              className="w-full h-64 sm:h-80 object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            />
                          </div>
                          <div className="pt-3 space-y-1.5 text-center">
                            <h4 className="text-[15px] font-medium leading-snug" style={{ color: '#232A1D', fontFamily: styles?.bodyFont || 'Work Sans' }}>
                              {product.name}
                            </h4>
                            <p className="text-[14px] font-semibold" style={{ color: '#3B4A2F' }}>
                              ₹{priceVal.toLocaleString('en-IN')}
                              {Number(product.discountPercent) > 0 && (
                                <span className="ml-2 text-xs font-normal line-through opacity-60" style={{ color: '#4A5240' }}>
                                  ₹{Math.round(priceVal * (1 + Number(product.discountPercent) / 100)).toLocaleString('en-IN')}
                                </span>
                              )}
                            </p>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickAdd(product); }}
                              disabled={(Number(product.stockQuantity ?? product.stock ?? 1) <= 0)}
                              className="mt-1 w-full py-2 rounded-md text-[13px] font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-85"
                              style={{ backgroundColor: '#3B4A2F', color: '#F5F3EE' }}
                            >
                              {(Number(product.stockQuantity ?? product.stock ?? 1) <= 0) ? 'Sold Out' : 'Add to Bag'}
                            </button>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }
          return (
            <section id="products" key={section.id} className="py-16 sm:py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-black/5 pb-4">
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-widest block ${
                        layoutStyle === 'modern_editorial' ? 'font-mono' : ''
                      }`}
                      style={{ color: styles?.accentColor || '#9F1239' }}
                    >
                      {layoutStyle === 'organic_artisan' ? '🌱 Organic Collection' : 'Bespoke Collection'}
                    </span>
                    <h3
                      className="text-2xl sm:text-4xl font-bold tracking-tight mt-1"
                      style={{
                        color: styles?.headingColor || '#0F172A',
                        fontFamily: styles?.headingFont || 'Playfair Display'
                      }}
                    >
                      {section.data.title || 'Store Highlights'}
                    </h3>
                    <p className="text-xs opacity-80 mt-1">{section.data.subtitle || 'Direct artisanal pieces at zero platform commission.'}</p>
                  </div>

                  <Link
                    to={`/store/${cleanSubdomain}/catalog`}
                    className="text-xs font-bold flex items-center gap-1 hover:opacity-80 transition"
                    style={{ color: styles?.accentColor || '#9F1239' }}
                  >
                    Browse Complete Catalog <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Product Grid or Empty State */}
                {storeProducts.length === 0 ? (
                  <div className="py-14 text-center space-y-3 p-8 rounded-3xl bg-white/70 border border-[#FBCBCB] max-w-md mx-auto shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center mx-auto text-[#9F1239]">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <h4
                      className="text-lg font-bold"
                      style={{
                        color: styles?.headingColor || '#0F172A',
                        fontFamily: styles?.headingFont || 'Playfair Display'
                      }}
                    >
                      Store Catalog Empty
                    </h4>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      No products have been added to this store yet. Products uploaded in the Merchant Admin Console will appear here in real time.
                    </p>
                    <Link
                      to="/admin/products/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold transition shadow-xs mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Upload Products in Merchant Admin
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {storeProducts.slice(0, section.data.columns || section.data.itemsCount || 6).map((product, productIdx) => {
                      const priceVal = Number(product.sellingPriceINR || product.price || 0);
                      const isOutOfStock = (Number(product.stockQuantity ?? product.stock ?? 0) <= 0) || product.status === 'No' || product.status === false || product.available === false;
                      const mainImage =
                        (product.images && product.images[0]) ||
                        product.imageUrl ||
                        product.image ||
                        (isPreviewMode && activeThemeMeta?.products?.[0]?.image) ||
                        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';

                      return (
                        <div
                          key={product.id}
                          className={`overflow-hidden border shadow-xs hover:shadow-xl transition duration-300 flex flex-col justify-between group ${
                            layoutStyle === 'modern_editorial'
                              ? 'rounded-none border-black'
                              : layoutStyle === 'organic_artisan'
                              ? 'rounded-3xl border-stone-200'
                              : layoutStyle === 'neo_tech'
                              ? 'rounded-2xl border-white/10 bg-[#1A1A1A] text-white'
                              : layoutStyle === 'playful_pop'
                              ? 'rounded-[1.75rem] border-2 border-black hover:-rotate-1 hover:-translate-y-1'
                              : layoutStyle === 'editorial_boutique'
                              ? 'rounded-none border-[#E3D9CA] hover:border-[#3E2E20] hover:shadow-[0_12px_30px_-15px_rgba(62,46,32,0.35)]'
                              : layoutStyle === 'quiet_luxe'
                              ? 'rounded-sm border-transparent hover:border-[#C7BEA8]'
                              : layoutStyle === 'editorial_zine'
                              ? 'rounded-xl border-transparent'
                              : layoutStyle === 'parfum_botanical'
                              ? 'rounded-2xl border-transparent bg-white shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition duration-500'
                              : layoutStyle === 'markly_luxe'
                              ? 'rounded-none border-transparent hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition duration-500'
                              : (styles?.buttonRadius || 'rounded-3xl')}
                          ${isOutOfStock ? 'opacity-85' : ''}`}
                          style={layoutStyle !== 'neo_tech' ? {
                            backgroundColor: layoutStyle === 'editorial_zine'
                              ? ['#F0EBE2', '#DCE5D2', '#EFE3D9', '#E8E4DB'][productIdx % 4]
                              : styles?.cardSurface || '#FFFFFF',
                            borderColor: layoutStyle === 'modern_editorial' ? '#000000' : layoutStyle === 'playful_pop' ? '#111111' : layoutStyle === 'editorial_boutique' ? '#E3D9CA' : '#FFE4E6'
                          } : {}}
                        >
                          {/* Image Box */}
                          <div>
                            <div className={`relative h-64 sm:h-72 w-full overflow-hidden ${
                              layoutStyle === 'organic_artisan' ? 'rounded-t-3xl' : layoutStyle === 'modern_editorial' ? 'rounded-none' : 'rounded-t-2xl'
                            }`}>
                              <img
                                src={mainImage}
                                alt={product.name}
                                className={`w-full h-full object-cover transition duration-500 ${isOutOfStock ? 'grayscale-25' : 'group-hover:scale-105'}`}
                              />
                              {product.discountPercent > 0 && !isOutOfStock && (
                                <span className={`absolute top-3 left-3 px-2.5 py-0.5 text-white text-[10px] font-bold shadow-md ${
                                  layoutStyle === 'modern_editorial' ? 'rounded-none bg-black font-mono'
                                  : layoutStyle === 'playful_pop' ? 'rounded-full text-black font-black rotate-[-6deg]'
                                  : layoutStyle === 'editorial_boutique' ? 'rounded-none text-[9px] uppercase tracking-[0.15em] px-3 py-1'
                                  : layoutStyle === 'quiet_luxe' ? 'rounded-sm text-[11px] font-medium'
                                  : layoutStyle === 'parfum_botanical' ? 'rounded-none text-[10px] font-extrabold uppercase tracking-[0.15em] -rotate-6'
                                  : layoutStyle === 'markly_luxe' ? 'rounded-none text-[10px] font-bold uppercase tracking-[0.15em]'
                                  : 'rounded-full bg-rose-600'
                                }`}
                                style={layoutStyle === 'playful_pop' ? { backgroundColor: styles?.accentColor || '#FFC700' } : layoutStyle === 'editorial_boutique' ? { backgroundColor: styles?.accentColor || '#B4552D' } : layoutStyle === 'quiet_luxe' ? { backgroundColor: '#9C5A34' } : layoutStyle === 'parfum_botanical' ? { backgroundColor: '#F4C95D', color: '#1E1E1E' } : layoutStyle === 'markly_luxe' ? { backgroundColor: '#111111' } : {}}>
                                  {product.discountPercent}% OFF
                                </span>
                              )}

                              {isOutOfStock ? (
                                <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-900/90 text-white text-[10px] font-bold shadow-md tracking-wider uppercase backdrop-blur-xs font-mono">
                                  Out of Stock
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleQuickAdd(product)}
                                  className={`absolute bottom-3 right-3 p-2.5 text-stone-900 shadow-md transform hover:scale-110 transition active:scale-95 cursor-pointer ${
                                    layoutStyle === 'modern_editorial' ? 'rounded-none bg-black text-white'
                                    : layoutStyle === 'playful_pop' ? 'rounded-full text-black border-2 border-black'
                                    : layoutStyle === 'editorial_boutique' ? 'rounded-none text-white'
                                    : layoutStyle === 'quiet_luxe' ? 'rounded-full text-white'
                                    : layoutStyle === 'editorial_zine' ? 'rounded-full text-white'
                                    : layoutStyle === 'parfum_botanical' ? 'rounded-full text-white'
                                    : layoutStyle === 'markly_luxe' ? 'rounded-none text-white'
                                    : 'rounded-2xl bg-white/90'
                                  }`}
                                  style={layoutStyle === 'playful_pop' ? { backgroundColor: styles?.accentColor || '#FFC700' } : layoutStyle === 'editorial_boutique' ? { backgroundColor: styles?.accentColor || '#B4552D' } : layoutStyle === 'quiet_luxe' ? { backgroundColor: styles?.headingColor || '#23221D' } : layoutStyle === 'editorial_zine' ? { backgroundColor: styles?.headingColor || '#141414' } : layoutStyle === 'parfum_botanical' ? { backgroundColor: styles?.accentColor || '#A3B449' } : layoutStyle === 'markly_luxe' ? { backgroundColor: '#111111' } : {}}
                                  title="Quick Add to Bag"
                                >
                                  <Plus className="w-4 h-4 stroke-[3]" />
                                </button>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                  layoutStyle === 'modern_editorial' ? 'font-mono text-black' : 'text-stone-400'
                                }`}>
                                  {product.category || matchedStore.categoryLabel}
                                </span>
                                {isOutOfStock && (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                              <Link to={`/product/${product.id}`}>
                                <h4
                                  className="font-bold text-sm sm:text-base leading-snug line-clamp-1 hover:opacity-80 transition"
                                  style={{
                                    color: layoutStyle === 'neo_tech' ? '#FFFFFF' : (styles?.headingColor || '#0F172A'),
                                    fontFamily: styles?.headingFont || 'Playfair Display'
                                  }}
                                >
                                  {product.name}
                                </h4>
                              </Link>

                              <p className={`text-xs line-clamp-2 leading-relaxed ${layoutStyle === 'neo_tech' ? 'text-slate-400' : 'text-stone-500'}`}>
                                {product.description || 'Authentic handcrafted piece.'}
                              </p>
                            </div>
                          </div>

                          {/* Pricing & Add to Cart Button */}
                          <div className="p-5 pt-0 flex items-center justify-between border-t border-black/5 mt-2">
                            <div className="pt-2">
                              <span className="text-base sm:text-lg font-bold font-mono" style={{ color: layoutStyle === 'neo_tech' ? '#F5C842' : (styles?.headingColor || '#0F172A') }}>
                                ₹{priceVal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <button
                              disabled={isOutOfStock}
                              onClick={() => !isOutOfStock && handleQuickAdd(product)}
                              className={`mt-2 px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                layoutStyle === 'modern_editorial' ? 'rounded-none font-mono uppercase' : layoutStyle === 'organic_artisan' ? 'rounded-full' : (styles?.buttonRadius || 'rounded-2xl')
                              } ${
                                isOutOfStock
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300 shadow-none'
                                  : layoutStyle === 'playful_pop'
                                  ? 'text-black border-2 border-black font-black uppercase shadow-[0_3px_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[0_2px_0_rgba(0,0,0,1)]'
                                  : 'text-white shadow-xs transform hover:scale-105 active:scale-95 cursor-pointer'
                              }`}
                              style={!isOutOfStock ? { backgroundColor: styles?.accentColor || '#9F1239' } : {}}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{isOutOfStock ? 'Sold Out' : (section.data.buttonLabel || 'Add to Bag')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        }

        // ----------------------------------------------------
        // 6. PROMOTIONAL BANNER
        // ----------------------------------------------------
        if (section.type === 'promo_banner') {
          if (layoutStyle === 'camel_edit') {
            return (
              <section id="offer" key={section.id} className="py-6 sm:py-8" style={{ backgroundColor: '#FCFAF7' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="relative overflow-hidden rounded-3xl grid grid-cols-1 lg:grid-cols-2" style={{ backgroundColor: '#F6EFE8' }}>
                    <div className="p-8 sm:p-12 space-y-4 flex flex-col justify-center">
                      <span className="inline-block w-fit px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] text-white" style={{ backgroundColor: '#A97C50' }}>
                        Season Sale
                      </span>
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl uppercase leading-tight" style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}>
                        {section.data.title || section.data.headline || 'Up To 40% Off Winter Edit'}
                      </h3>
                      <p className="text-sm sm:text-base" style={{ color: '#4A423B' }}>
                        {section.data.subtitle || section.data.text || 'End-of-season reductions across blazers, denim and knitwear. Use code CAMEL40 at checkout.'}
                      </p>
                      <div className="pt-2">
                        <a
                          href="#products"
                          className="inline-block px-8 py-3 rounded-full text-sm font-bold text-white transition hover:opacity-85"
                          style={{ backgroundColor: '#111111' }}
                        >
                          {section.data.ctaText || 'Shop the Sale'}
                        </a>
                      </div>
                    </div>
                    <div className="relative min-h-[240px]">
                      <img
                        src={(isPreviewMode && activeThemeMeta?.bannerImage) || section.data.imageUrl || activeThemeMeta?.bannerImage || '/theme-images/street-2.jpg'}
                        alt="Season sale"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </section>
            );
          }
          if (layoutStyle === 'bloom_beauty') {
            return (
              <section id="offer" key={section.id} className="py-6 sm:py-8" style={{ backgroundColor: '#FDF8F6' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="relative overflow-hidden rounded-3xl px-6 sm:px-12 py-10 sm:py-14 text-center text-white" style={{ background: 'linear-gradient(120deg, #6E3244 0%, #8E4356 55%, #A55A6C 100%)' }}>
                    <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: '#F3CFCB' }} />
                    <div className="absolute -bottom-12 -right-10 w-56 h-56 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: '#F3CFCB' }} />
                    <div className="relative space-y-4">
                      <span className="inline-block px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] bg-white/15 border border-white/30">
                        Limited Time
                      </span>
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700 }}>
                        {section.data.title || section.data.headline || 'Flat 25% Off the Entire Collection'}
                      </h3>
                      <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto">
                        {section.data.subtitle || section.data.text || 'Celebrate clean beauty — every lipstick, serum and masque. Use code BLOOM25 at checkout.'}
                      </p>
                      <div className="pt-2">
                        <a
                          href="#products"
                          className="inline-block px-8 py-3 rounded-full text-sm font-bold transition hover:opacity-90 cursor-pointer"
                          style={{ backgroundColor: '#FFFFFF', color: '#8E4356' }}
                        >
                          {section.data.ctaText || 'Shop the Offer'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }
          // Markly: full-bleed photographic newsletter hero (per reference screenshots)
          if (layoutStyle === 'markly_luxe') {
            return (
              <section key={section.id} className="relative h-[26rem] sm:h-[30rem] overflow-hidden">
                <img
                  src={(isPreviewMode && activeThemeMeta?.bannerImage) || section.data.imageUrl || section.data.heroImage || activeThemeMeta?.bannerImage || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80'}
                  alt="Newsletter"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(17,17,17,0.72) 0%, rgba(17,17,17,0.35) 60%, rgba(17,17,17,0.55) 100%)' }} />
                <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col items-start justify-center gap-5">
                  {section.data.badge && (
                    <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-white/80">
                      {section.data.badge}
                    </span>
                  )}
                  <h3
                    className="text-3xl sm:text-5xl leading-[1.12] tracking-tight text-white max-w-xl m-0"
                    style={{ fontFamily: styles?.headingFont || 'Inter', fontWeight: 600 }}
                  >
                    {section.data.headline || 'Subscribe to our newsletter'}
                  </h3>
                  <p className="text-sm text-white/80 max-w-md leading-relaxed m-0">
                    {section.data.subtext || 'New arrivals, atelier stories and private sales. One email a month.'}
                  </p>
                  {newsletterDone ? (
                    <p className="text-sm font-bold text-white">✓ Subscribed! Watch your inbox for early access.</p>
                  ) : (
                    <form onSubmit={handleStoreSubscribe} className="flex w-full max-w-md">
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        aria-label="Email address for newsletter"
                        className="flex-1 min-w-0 px-4 py-3.5 text-sm outline-none bg-white/95 text-[#111111] placeholder:text-[#9C9C9C] border-2 border-white"
                      />
                      <button
                        type="submit"
                        disabled={newsletterBusy}
                        className="px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] bg-white text-[#111111] hover:bg-[#A35A2B] hover:text-white transition cursor-pointer disabled:opacity-60"
                      >
                        {newsletterBusy ? 'Subscribing…' : 'Subscribe'}
                      </button>
                    </form>
                  )}
                  {newsletterError && (
                    <p className="text-xs font-semibold text-red-300">{newsletterError}</p>
                  )}
                </div>
              </section>
            );
          }

          return (
            <div
              key={section.id}
              className="py-12 px-6 border-y border-black/5 text-center space-y-3 text-white transition"
              style={{ backgroundColor: section.data.overrideBg || styles?.accentColor || '#9F1239' }}
            >
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-widest">
                {section.data.badge || 'Special Promotion'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif">
                {section.data.headline}
              </h3>
              <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-xs font-bold">
                <span>Voucher Code:</span>
                <span className="font-mono px-2.5 py-0.5 rounded-lg bg-white text-[#0F172A] font-black">
                  {section.data.couponCode || 'SAVE10'}
                </span>
              </div>
              <p className="text-xs opacity-90 max-w-sm mx-auto">{section.data.subtext}</p>
            </div>
          );
        }

        // ----------------------------------------------------
        // 7. VIDEO REELS
        // ----------------------------------------------------
        if (section.type === 'video_reels') {
          // Merchant-curated media wall: photos AND videos set from the Theme
          // Builder (Reel 1-3 / reels[]). Falls back to the product grid when
          // the merchant has not configured any media of their own.
          const isVideoSrc = (src) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(String(src)) || String(src).startsWith('data:video/');
          const jxReels = [
            section.data.reel1Img ? { src: section.data.reel1Img, caption: section.data.reel1Caption } : null,
            section.data.reel2Img ? { src: section.data.reel2Img, caption: section.data.reel2Caption } : null,
            section.data.reel3Img ? { src: section.data.reel3Img, caption: section.data.reel3Caption } : null,
            ...(Array.isArray(section.data.reels) ? section.data.reels : [])
          ].filter((r) => r && r.src);
          // Camel Editorial Fashion: reels become a Best Sellers fashion grid
          if (layoutStyle === 'camel_edit') {
            const cReelItems = ((isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts)
              .map((pr) => ({ ...pr, stockQuantity: (pr.stockQuantity ?? pr.stock ?? 50) }));
            if (jxReels.length > 0) {
              return (
                <section id="best-sellers" key={section.id} className="py-14" style={{ backgroundColor: '#F6EFE8' }}>
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="text-center space-y-2">
                      <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#A97C50' }}>Most Wanted</span>
                      <h3 className="text-3xl sm:text-4xl uppercase" style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}>
                        {section.data.title || 'Best Sellers'}
                      </h3>
                      {section.data.subtitle && <p className="text-sm max-w-md mx-auto" style={{ color: '#4A423B' }}>{section.data.subtitle}</p>}
                      {(section.data.socialHandle || section.data.tagText) && (
                        <p className="text-xs font-bold" style={{ color: '#A97C50' }}>📍 {section.data.socialHandle || section.data.tagText}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {jxReels.slice(0, 8).map((r, i) => (
                        <div key={i} className="relative overflow-hidden rounded-2xl border bg-black" style={{ borderColor: '#E9E2D9' }}>
                          <div className="aspect-[9/14] w-full">
                            {isVideoSrc(r.src) ? (
                              <video src={r.src} className="w-full h-full object-cover" autoPlay muted loop playsInline controls={isJulexEditMode} />
                            ) : (
                              <img src={r.src} alt={r.caption || 'Reel'} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            )}
                          </div>
                          {(r.caption || section.data.socialHandle || section.data.tagText) && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <span className="text-white text-[11px] font-bold">{r.caption || section.data.socialHandle || section.data.tagText}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }
            return (
              <section id="best-sellers" key={section.id} className="py-14" style={{ backgroundColor: '#F6EFE8' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#A97C50' }}>Most Wanted</span>
                    <h3 className="text-3xl sm:text-4xl uppercase" style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}>
                      {section.data.title || 'Best Sellers'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {cReelItems.slice(0, section.data.columns || 4).map((product) => {
                      const priceVal = Number(product.sellingPriceINR || product.price || 0);
                      const oos = Number(product.stockQuantity) <= 0;
                      const img = (product.images && product.images[0]) || product.imageUrl || product.image || '/theme-images/fashion-1.png';
                      return (
                        <div key={product.id} className="group">
                          <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: '#E9E2D9', backgroundColor: '#FFFFFF' }}>
                            {product.tag && (
                              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-full" style={{ backgroundColor: '#111111' }}>
                                {product.tag}
                              </span>
                            )}
                            <img src={img} alt={product.name} className="w-full h-64 sm:h-72 object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                            <button
                              onClick={() => handleQuickAdd(product)}
                              disabled={oos}
                              className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-14 group-hover:translate-y-0 w-[85%] py-2.5 rounded-full text-[13px] font-bold text-white shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: '#111111' }}
                            >
                              {oos ? 'Sold Out' : 'Add to Bag'}
                            </button>
                          </div>
                          <div className="pt-3 space-y-1 text-center">
                            <p className="text-[11px] uppercase tracking-wider" style={{ color: '#A97C50' }}>{product.category}</p>
                            <h4 className="text-[14px] font-medium leading-snug" style={{ color: '#111111' }}>{product.name}</h4>
                            <p className="text-[14px] font-bold" style={{ color: '#111111' }}>₹{priceVal.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }
          // Rose Bloom Beauty: reels become a Best Sellers beauty grid
          if (layoutStyle === 'bloom_beauty') {
            const reelItems = ((isPreviewMode && (!storeProducts || storeProducts.length === 0)) ? activeThemeMeta?.products || [] : storeProducts)
              .map((pr) => ({ ...pr, stockQuantity: (pr.stockQuantity ?? pr.stock ?? 50) }));
            if (jxReels.length > 0) {
              return (
                <section id="best-sellers" key={section.id} className="py-14" style={{ backgroundColor: '#FDF8F6' }}>
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="text-center space-y-2">
                      <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#8E4356' }}>Loved by Hundreds</span>
                      <h3 className="text-3xl sm:text-4xl" style={{ color: '#3A1B2A', fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700 }}>
                        {section.data.title || 'Best Sellers'}
                      </h3>
                      {section.data.subtitle && <p className="text-sm max-w-md mx-auto" style={{ color: '#6B4A55' }}>{section.data.subtitle}</p>}
                      {(section.data.socialHandle || section.data.tagText) && (
                        <p className="text-xs font-bold" style={{ color: '#8E4356' }}>📍 {section.data.socialHandle || section.data.tagText}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {jxReels.slice(0, 8).map((r, i) => (
                        <div key={i} className="relative overflow-hidden rounded-2xl border bg-black" style={{ borderColor: '#F0DBDD' }}>
                          <div className="aspect-[9/14] w-full">
                            {isVideoSrc(r.src) ? (
                              <video src={r.src} className="w-full h-full object-cover" autoPlay muted loop playsInline controls={isJulexEditMode} />
                            ) : (
                              <img src={r.src} alt={r.caption || 'Reel'} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            )}
                          </div>
                          {(r.caption || section.data.socialHandle || section.data.tagText) && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <span className="text-white text-[11px] font-bold">{r.caption || section.data.socialHandle || section.data.tagText}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }
            return (
              <section id="best-sellers" key={section.id} className="py-14" style={{ backgroundColor: '#FDF8F6' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#8E4356' }}>Loved by Hundreds</span>
                    <h3 className="text-3xl sm:text-4xl" style={{ color: '#3A1B2A', fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700 }}>
                      {section.data.title || 'Best Sellers'}
                    </h3>
                    <p className="text-sm max-w-md mx-auto" style={{ color: '#6B4A55' }}>
                      {section.data.subtitle || 'The most-loved picks from the Rose Bloom collection.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {reelItems.slice(0, section.data.columns || 4).map((product) => {
                      const priceVal = Number(product.sellingPriceINR || product.price || 0);
                      const oos = Number(product.stockQuantity) <= 0;
                      const img = (product.images && product.images[0]) || product.imageUrl || product.image || '/theme-images/beauty-1.jpeg';
                      return (
                        <div key={product.id} className="group">
                          <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: '#F0DBDD', backgroundColor: '#FFFFFF' }}>
                            {product.tag && (
                              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-full" style={{ backgroundColor: '#8E4356' }}>
                                {product.tag}
                              </span>
                            )}
                            <img src={img} alt={product.name} className="w-full h-64 sm:h-72 object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                            <button
                              onClick={() => handleQuickAdd(product)}
                              disabled={oos}
                              className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-14 group-hover:translate-y-0 w-[85%] py-2.5 rounded-full text-[13px] font-semibold text-white shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: '#8E4356' }}
                            >
                              {oos ? 'Sold Out' : 'Add to Bag'}
                            </button>
                          </div>
                          <div className="pt-3 space-y-1 text-center">
                            <p className="text-[11px] uppercase tracking-wider" style={{ color: '#B08A95' }}>{product.category}</p>
                            <h4 className="text-[14px] font-medium leading-snug" style={{ color: '#3A1B2A' }}>{product.name}</h4>
                            <p className="text-[14px] font-bold" style={{ color: '#8E4356' }}>₹{priceVal.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }
          return (
            <div
              key={section.id}
              className="py-12 px-4 max-w-7xl mx-auto space-y-6"
            >
              <div className="text-center space-y-1">
                <h3
                  className="font-bold text-lg sm:text-xl flex items-center justify-center gap-2"
                  style={{ fontFamily: styles?.headingFont, color: styles?.headingColor }}
                >
                  <Film className="w-5 h-5" style={{ color: styles?.accentColor }} />
                  {section.data.title || 'Artisan Workshop Reels'}
                </h3>
                <p className="text-xs opacity-75">{section.data.subtitle}</p>
                {(section.data.socialHandle || section.data.tagText) && (
                  <p className="text-[11px] font-bold" style={{ color: styles?.accentColor }}>📍 {section.data.socialHandle || section.data.tagText}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(jxReels.length > 0 ? jxReels.slice(0, 6) : [
                  { src: section.data.reel1Img || (isPreviewMode && activeThemeMeta?.products?.[0]?.image) || activeThemeMeta?.heroImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80' },
                  { src: section.data.reel2Img || (isPreviewMode && activeThemeMeta?.products?.[1]?.image) || activeThemeMeta?.storyImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
                  { src: section.data.reel3Img || (isPreviewMode && activeThemeMeta?.products?.[2]?.image) || activeThemeMeta?.bannerImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' }
                ]).map((r, i) => (
                  <div
                    key={i}
                    className="aspect-[9/14] rounded-3xl overflow-hidden relative shadow-md border group bg-black"
                    style={{ borderColor: '#FFE4E6' }}
                  >
                    {isVideoSrc(r.src) ? (
                      <video src={r.src} className="w-full h-full object-cover" autoPlay muted loop playsInline controls={isJulexEditMode} />
                    ) : (
                      <img src={r.src} alt={r.caption || 'Reel'} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    )}
                    {(r.caption || section.data.socialHandle || section.data.tagText) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 pointer-events-none">
                        <span className="text-white text-xs font-bold">{r.caption || section.data.socialHandle || section.data.tagText}</span>
                        {!r.caption && <span className="text-[10px] text-white/80">▶ Watch Studio Reel</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // ----------------------------------------------------
        // 8. TESTIMONIALS
        // ----------------------------------------------------
        if (section.type === 'testimonials') {
          if (layoutStyle === 'camel_edit') {
            const cPillars = section.data.items || [
              { icon: 'truck', title: 'Free Express Shipping', desc: 'Free 2-day delivery on every order above ₹999.' },
              { icon: 'refresh', title: '30-Day Easy Returns', desc: 'Wrong size? Swap or return within 30 days, free.' },
              { icon: 'sparkles', title: 'Certified Authentic', desc: 'Every piece sourced directly from the design house.' },
              { icon: 'heart', title: 'Stylist Support', desc: 'Free 1-on-1 styling help on chat, 7 days a week.' },
            ];
            const cIconMap = { truck: Truck, refresh: RefreshCw, sparkles: Sparkles, heart: Heart };
            return (
              <section key={section.id} className="py-14" style={{ backgroundColor: '#FCFAF7' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#A97C50' }}>The House Promise</span>
                    <h3 className="text-3xl sm:text-4xl uppercase" style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}>
                      {section.data.title || 'What We Provide Our Customers'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {cPillars.map((pl, i) => {
                      const IconComp = cIconMap[String(pl.icon || '').toLowerCase()] || Heart;
                      return (
                        <div key={i} className="rounded-2xl p-6 text-center space-y-3 border bg-white transition hover:shadow-lg" style={{ borderColor: '#E9E2D9' }}>
                          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#F6EFE8', color: '#A97C50' }}>
                            <IconComp className="w-6 h-6" />
                          </div>
                          <h4 className="text-[14px] font-bold uppercase tracking-wide" style={{ color: '#111111' }}>{pl.title}</h4>
                          <p className="text-xs leading-relaxed" style={{ color: '#4A423B' }}>{pl.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }
          if (layoutStyle === 'bloom_beauty') {
            const pillars = section.data.items || [
              { icon: 'truck', title: 'Free Shipping', desc: 'On every order above ₹499, delivered across India.' },
              { icon: 'leaf', title: '100% Vegan', desc: 'Cruelty-free formulas with clean, botanical ingredients.' },
              { icon: 'sparkles', title: 'Dermat Approved', desc: 'Every product is tested and approved by certified dermatologists.' },
              { icon: 'heart', title: 'Easy 15-Day Returns', desc: 'Changed your mind? Return any product, no questions asked.' },
            ];
            const iconMap = { truck: Truck, leaf: Heart, sparkles: Sparkles, heart: Heart };
            return (
              <section key={section.id} className="py-14 sm:py-20" style={{ backgroundColor: '#F9EDEB' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold block" style={{ color: '#8E4356' }}>Why Shop With Us</span>
                    <h3 className="text-3xl sm:text-4xl" style={{ color: '#3A1B2A', fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700 }}>
                      {section.data.title || 'What We Provide To Our Customers'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {pillars.map((pl, i) => {
                      const IconComp = iconMap[String(pl.icon || '').toLowerCase()] || Heart;
                      return (
                        <div key={i} className="rounded-2xl p-6 text-center space-y-3 border bg-white transition hover:shadow-lg" style={{ borderColor: '#F0DBDD' }}>
                          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#F9EDEB', color: '#8E4356' }}>
                            <IconComp className="w-6 h-6" />
                          </div>
                          <h4 className="text-[15px] font-bold" style={{ color: '#3A1B2A' }}>{pl.title}</h4>
                          <p className="text-xs leading-relaxed" style={{ color: '#6B4A55' }}>{pl.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }
          return (
            <section id="story" key={section.id} className="py-16 sm:py-20 border-t border-black/5" style={{ backgroundColor: styles?.surfaceColor }}>
              <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                <p className="font-bold text-sm tracking-wide" style={{ color: styles?.accentColor }}>
                  {section.data.rating || '★★★★★ 4.9/5 Average Rating'}
                </p>
                <h3
                  className="text-2xl sm:text-3xl font-bold font-serif"
                  style={{ color: styles?.headingColor }}
                >
                  {section.data.title || 'Craftsmanship Revered by Connoisseurs'}
                </h3>
                <blockquote className="text-sm sm:text-base italic opacity-90 max-w-2xl mx-auto leading-relaxed">
                  "{section.data.quote || section.data.quote1}"
                </blockquote>
                <p className="text-xs font-bold" style={{ color: styles?.accentColor }}>
                  — {section.data.author || section.data.author1 || 'Verified Patron'}
                </p>
              </div>
            </section>
          );
        }

        // ----------------------------------------------------
        // 4. TRUST BADGES
        // ----------------------------------------------------
        if (section.type === 'badges') {
          return (
            <div
              key={section.id}
              className="py-10 px-4 border-b border-black/5"
              style={{ backgroundColor: styles?.backgroundColor }}
            >
              <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-1.5 shadow-xs text-center">
                  <Truck className="w-6 h-6 mx-auto text-[#9F1239]" />
                  <h4 className="font-bold text-xs sm:text-sm font-serif" style={{ color: styles?.headingColor || '#0F172A' }}>
                    {section.data.badge1Title || 'Free Express Shipping'}
                  </h4>
                  <p className="text-[11px] text-[#475569]">{section.data.badge1Desc || 'Pan-India doorstep delivery with live tracking.'}</p>
                </div>
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-1.5 shadow-xs text-center">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-[#9F1239]" />
                  <h4 className="font-bold text-xs sm:text-sm font-serif" style={{ color: styles?.headingColor || '#0F172A' }}>
                    {section.data.badge2Title || '100% Authentic Guaranteed'}
                  </h4>
                  <p className="text-[11px] text-[#475569]">{section.data.badge2Desc || 'Genuine certified materials & origin.'}</p>
                </div>
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-1.5 shadow-xs text-center">
                  <ShieldCheck className="w-6 h-6 mx-auto text-[#9F1239]" />
                  <h4 className="font-bold text-xs sm:text-sm font-serif" style={{ color: styles?.headingColor || '#0F172A' }}>
                    {section.data.badge3Title || 'Easy 7-Day Returns'}
                  </h4>
                  <p className="text-[11px] text-[#475569]">{section.data.badge3Desc || 'Hassle-free replacement & exchange guarantee.'}</p>
                </div>
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-1.5 shadow-xs text-center">
                  <Sparkles className="w-6 h-6 mx-auto text-[#9F1239]" />
                  <h4 className="font-bold text-xs sm:text-sm font-serif" style={{ color: styles?.headingColor || '#0F172A' }}>
                    {section.data.badge4Title || 'Generational Artistry'}
                  </h4>
                  <p className="text-[11px] text-[#475569]">{section.data.badge4Desc || 'Master artisan craft & bespoke pieces.'}</p>
                </div>
              </div>
            </div>
          );
        }

        // ----------------------------------------------------
        // 5. BRAND STORY & ATELIER
        // ----------------------------------------------------
        if (section.type === 'story') {
          if (layoutStyle === 'camel_edit') {
            const cAboutImg = (isPreviewMode && activeThemeMeta?.storyImage) || section.data.imageUrl || section.data.image || activeThemeMeta?.storyImage || '/theme-images/fashion-5.jpg';
            return (
              <section id="about" key={section.id} className="py-14 sm:py-20" style={{ backgroundColor: '#141414' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* About */}
                  <div className="lg:col-span-7 space-y-5">
                    <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-bold" style={{ color: '#A97C50' }}>About Us</span>
                    <h3 className="text-3xl sm:text-4xl uppercase leading-tight text-white" style={{ fontFamily: styles?.headingFont || 'Archivo Black' }}>
                      {section.data.title || section.data.headline || `Independent Fashion, Direct From ${matchedStore.name}`}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(252,250,247,0.75)' }}>
                      {section.data.text || section.data.story || 'We are an independent fashion house selling direct — no middlemen, no marketplace commissions. Every piece is designed in-house, produced in limited runs, and shipped straight from our studio to your wardrobe.'}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t" style={{ borderColor: 'rgba(252,250,247,0.15)' }}>
                      {[
                        { n: '120+', l: 'Limited Drops' },
                        { n: '50K+', l: 'Wardrobes' },
                        { n: '0%', l: 'Platform Fee' },
                      ].map((st) => (
                        <div key={st.l} className="pt-3">
                          <p className="text-2xl font-bold text-white" style={{ fontFamily: styles?.headingFont || 'Archivo Black' }}>{st.n}</p>
                          <p className="text-[11px] uppercase tracking-wide" style={{ color: 'rgba(252,250,247,0.55)' }}>{st.l}</p>
                        </div>
                      ))}
                    </div>
                    <img src={cAboutImg} alt="Our studio" className="w-full h-56 sm:h-64 object-cover rounded-2xl pt-1" />
                  </div>

                  {/* Contact — working links */}
                  <div className="lg:col-span-5">
                    <div className="rounded-2xl p-6 sm:p-8 space-y-5 h-full" style={{ backgroundColor: '#FCFAF7' }}>
                      <h4 className="text-xl uppercase" style={{ color: '#111111', fontFamily: styles?.headingFont || 'Archivo Black' }}>Get In Touch</h4>
                      <div className="space-y-3 text-sm" style={{ color: '#4A423B' }}>
                        {liveStore.ownerEmail && (
                          <a href={`mailto:${liveStore.ownerEmail}`} className="flex items-start gap-3 hover:text-black transition">
                            <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#A97C50' }} />
                            <span>{liveStore.ownerEmail}</span>
                          </a>
                        )}
                        {(liveStore.whatsappNumber || liveStore.ownerPhone) && (
                          <a href={`tel:+91${String(liveStore.whatsappNumber || liveStore.ownerPhone).replace(/\D/g, '')}`} className="flex items-start gap-3 hover:text-black transition">
                            <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#A97C50' }} />
                            <span>+91 {String(liveStore.whatsappNumber || liveStore.ownerPhone)}</span>
                          </a>
                        )}
                        {(liveStore.whatsappNumber || liveStore.ownerPhone) && (
                          <a href={`https://wa.me/91${String(liveStore.whatsappNumber || liveStore.ownerPhone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-black transition">
                            <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#A97C50' }} />
                            <span>WhatsApp us — replies within minutes</span>
                          </a>
                        )}
                        {section.data.address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#A97C50' }} />
                            <span>{section.data.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t space-y-3" style={{ borderColor: '#E9E2D9' }}>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#111111' }}>Newsletter</p>
                        <p className="text-xs" style={{ color: '#4A423B' }}>Early access to every drop. No spam, ever.</p>
                        {newsletterDone ? (
                          <p className="text-xs font-bold" style={{ color: '#8E4356' }}>✓ Subscribed! Watch your inbox for early access.</p>
                        ) : (
                          <form onSubmit={handleStoreSubscribe} className="flex gap-2">
                            <input
                              type="email"
                              required
                              value={newsletterEmail}
                              onChange={(e) => setNewsletterEmail(e.target.value)}
                              placeholder="your@email.com"
                              aria-label="Email address for newsletter"
                              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none border"
                              style={{ borderColor: '#E9E2D9', color: '#111111' }}
                            />
                            <button type="submit" disabled={newsletterBusy} className="px-5 py-2.5 rounded-full text-xs font-bold text-white cursor-pointer transition hover:opacity-85 disabled:opacity-60" style={{ backgroundColor: '#111111' }}>
                              {newsletterBusy ? 'Joining…' : 'Join'}
                            </button>
                          </form>
                        )}
                        {newsletterError && (
                          <p className="text-[11px] font-semibold text-red-600">{newsletterError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }
          if (layoutStyle === 'bloom_beauty') {
            const aboutImg = (isPreviewMode && activeThemeMeta?.storyImage) || section.data.imageUrl || section.data.image || activeThemeMeta?.storyImage || '/theme-images/beauty-2.jpg';
            return (
              <section id="about" key={section.id} className="py-14 sm:py-20" style={{ backgroundColor: '#481830' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div className="relative">
                    <img src={aboutImg} alt="About our brand" className="w-full h-[340px] sm:h-[420px] object-cover rounded-3xl shadow-2xl" />
                    <div className="absolute -bottom-5 -right-3 sm:right-6 bg-white rounded-2xl shadow-xl px-5 py-4 text-center">
                      <p className="text-2xl font-bold" style={{ color: '#8E4356', fontFamily: styles?.headingFont || 'Playfair Display' }}>10+</p>
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: '#6B4A55' }}>Years of Craft</p>
                    </div>
                  </div>
                  <div className="space-y-5 text-white">
                    <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-bold text-white/70">About Us</span>
                    <h3 className="text-3xl sm:text-4xl leading-tight" style={{ fontFamily: styles?.headingFont || 'Playfair Display', fontWeight: 700 }}>
                      {section.data.title || section.data.headline || `Beauty Made Honest, at ${matchedStore.name}`}
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      {section.data.text || section.data.story || 'We craft small-batch, botanical-first beauty with complete transparency — no hidden fillers, no cruelty, no platform markups. Every rupee you spend goes toward better ingredients, not middlemen.'}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/15">
                      {[
                        { n: '100%', l: 'Vegan Formula' },
                        { n: '500+', l: '5-Star Reviews' },
                        { n: '0%', l: 'Platform Fee' },
                      ].map((st) => (
                        <div key={st.l} className="pt-3">
                          <p className="text-xl font-bold" style={{ fontFamily: styles?.headingFont || 'Playfair Display' }}>{st.n}</p>
                          <p className="text-[11px] text-white/60 uppercase tracking-wide">{st.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          }
          return (
            <section
              id="story"
              key={section.id}
              className="py-16 sm:py-24 border-b border-black/5"
              style={{ backgroundColor: styles?.surfaceColor || '#FFF3EC' }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white tracking-widest uppercase inline-block shadow-xs"
                      style={{ backgroundColor: styles?.accentColor || '#9F1239' }}
                    >
                      {section.data.badge || 'Artisan Philosophy'}
                    </span>
                    <h3
                      className="text-2xl sm:text-4xl font-bold font-serif leading-tight"
                      style={{ color: styles?.headingColor || '#0F172A' }}
                    >
                      {section.data.headline || 'Crafted with Devotion & Integrity'}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-90 text-[#374151]">
                      {section.data.storyText}
                    </p>
                    <div className="pt-4 border-t border-black/10 flex items-center gap-3">
                      <div>
                        <h5 className="font-bold text-sm" style={{ color: styles?.headingColor || '#0F172A' }}>
                          {section.data.founderName || 'Founder & Master Artisan'}
                        </h5>
                        <p className="text-xs opacity-75">{section.data.founderRole || 'Curator, Direct Studio'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-black/10 aspect-[4/3]">
                      <img
                        src={(isPreviewMode && activeThemeMeta?.storyImage) || section.data.imageUrl || activeThemeMeta?.storyImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'}
                        alt="Atelier Story"
                        className="w-full h-full object-cover hover:scale-105 transition duration-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ----------------------------------------------------
        // 6. FAQ ACCORDION
        // ----------------------------------------------------
        if (section.type === 'faq') {
          return (
            <section
              id="faq"
              key={section.id}
              className="py-16 sm:py-20 border-b border-black/5"
              style={{ backgroundColor: styles?.backgroundColor }}
            >
              <div className="max-w-4xl mx-auto px-4 space-y-8">
                <div className="text-center space-y-2">
                  <h3
                    className="text-2xl sm:text-3xl font-bold font-serif"
                    style={{ color: styles?.headingColor || '#0F172A' }}
                  >
                    {section.data.title || 'Frequently Asked Questions'}
                  </h3>
                  <p className="text-xs opacity-75">{section.data.subtitle}</p>
                </div>

                <div className="space-y-3">
                  <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-1.5 shadow-xs">
                    <h5 className="font-bold text-sm text-[#0F172A]">{section.data.q1 || 'How long does shipping take?'}</h5>
                    <p className="text-xs text-[#475569] leading-relaxed">{section.data.a1}</p>
                  </div>
                  <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-1.5 shadow-xs">
                    <h5 className="font-bold text-sm text-[#0F172A]">{section.data.q2 || 'What is the return policy?'}</h5>
                    <p className="text-xs text-[#475569] leading-relaxed">{section.data.a2}</p>
                  </div>
                  <div className="p-5 rounded-3xl bg-white border border-[#FBCBCB] space-y-1.5 shadow-xs">
                    <h5 className="font-bold text-sm text-[#0F172A]">{section.data.q3 || 'Are products authentic?'}</h5>
                    <p className="text-xs text-[#475569] leading-relaxed">{section.data.a3}</p>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ----------------------------------------------------
        // 7. VIP NEWSLETTER
        // ----------------------------------------------------
        if (section.type === 'newsletter') {
          return (
            <section
              key={section.id}
              className="py-16 px-4 border-b border-black/5 text-center space-y-4"
              style={{ backgroundColor: styles?.surfaceColor || '#FFF3EC' }}
            >
              <div className="max-w-xl mx-auto space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-[#9F1239]" />
                <h3
                  className="text-2xl sm:text-3xl font-bold font-serif"
                  style={{ color: styles?.headingColor || '#0F172A' }}
                >
                  {section.data.headline || 'Join the VIP Connoisseur Circle'}
                </h3>
                <p className="text-xs opacity-80">{section.data.subtext}</p>
                <div className="flex items-center gap-2 max-w-md mx-auto pt-2">
                  <input
                    type="email"
                    placeholder={section.data.placeholder || 'Enter your email...'}
                    className="flex-1 px-4 py-3 bg-white border border-[#FBCBCB] rounded-2xl text-xs focus:outline-none focus:border-[#9F1239]"
                  />
                  <button
                    className={`px-5 py-3 text-xs font-bold text-white shadow-xs transition transform hover:scale-105 ${styles?.buttonRadius || 'rounded-2xl'}`}
                    style={{ backgroundColor: styles?.accentColor || '#9F1239' }}
                  >
                    {section.data.buttonText || 'Subscribe'}
                  </button>
                </div>
              </div>
            </section>
          );
        }

        // ----------------------------------------------------
        // 8. INSTAGRAM GALLERY
        // ----------------------------------------------------
        if (section.type === 'instagram_feed') {
          return (
            <div
              key={section.id}
              className="py-12 px-4 max-w-7xl mx-auto space-y-6"
            >
              <div className="text-center space-y-1">
                <h3
                  className="font-bold text-lg sm:text-xl font-serif"
                  style={{ color: styles?.headingColor || '#0F172A' }}
                >
                  {section.data.title || 'Follow Our Instagram'}
                </h3>
                <p className="text-xs font-mono font-bold" style={{ color: styles?.accentColor || '#9F1239' }}>{section.data.handle}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  (isPreviewMode && activeThemeMeta?.products?.[0]?.image) || activeThemeMeta?.heroImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
                  (isPreviewMode && activeThemeMeta?.products?.[1]?.image) || activeThemeMeta?.storyImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
                  (isPreviewMode && activeThemeMeta?.products?.[2]?.image) || activeThemeMeta?.bannerImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
                  (isPreviewMode && activeThemeMeta?.products?.[3]?.image) || activeThemeMeta?.products?.[2]?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80'
                ].map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-xs border border-[#FBCBCB] group">
                    <img src={img} alt="Insta" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // ----------------------------------------------------
        // 9. STORE LOCATION / ATELIER
        // ----------------------------------------------------
        if (section.type === 'store_location') {
          return (
            <div
              key={section.id}
              className="py-12 px-4 border-b border-black/5"
              style={{ backgroundColor: styles?.surfaceColor || '#FFF3EC' }}
            >
              <div className="max-w-md mx-auto text-center space-y-2">
                <Compass className="w-8 h-8 mx-auto text-[#9F1239]" />
                <h3
                  className="text-xl font-bold font-serif"
                  style={{ color: styles?.headingColor || '#0F172A' }}
                >
                  {section.data.title || 'Visit Our Atelier'}
                </h3>
                <p className="text-xs font-medium text-[#374151]">{section.data.address}</p>
                <p className="text-[11px] opacity-75">{section.data.hours}</p>
                <p className="text-xs font-mono font-bold text-[#9F1239]">{section.data.phone}</p>
              </div>
            </div>
          );
        }

        // ----------------------------------------------------
        // 10. FOOTER
        // ----------------------------------------------------
        if (section.type === 'footer') {
          const tAccent = styles?.accentColor || '#9F1239';
          const tHeading = styles?.headingColor || '#0F172A';
          const tText = styles?.textColor || '#64748B';
          const tBorder = styles?.cardBorder?.match(/#([0-9A-Fa-f]{6})/)?.[0] || 'rgba(0,0,0,0.08)';
          return (
            <footer
              key={section.id}
              className="py-12 px-4 border-t border-black/5 space-y-6"
              style={{
                backgroundColor: styles?.surfaceColor || '#FFFFFF',
                color: tText
              }}
            >
              {/* Newsletter subscription — real signup stored per store */}
              {section.data.showNewsletter !== false && (
                <div className="max-w-md mx-auto text-center space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: tAccent }}>
                    {section.data.newsletterTitle || 'Join Our Newsletter'}
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    {section.data.newsletterText || `New arrivals, seasonal specials & early access from ${matchedStore.name}. No spam — unsubscribe anytime.`}
                  </p>
                  {newsletterDone ? (
                    <p className="text-xs font-bold py-2" style={{ color: tAccent }}>
                      ✓ Subscribed! Watch your inbox for early access.
                    </p>
                  ) : (
                    <form onSubmit={handleStoreSubscribe} className="flex items-center gap-2">
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address"
                        aria-label="Email address for newsletter"
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-full text-xs outline-none"
                        style={{ backgroundColor: styles?.backgroundColor || '#FFFFFF', border: `1px solid ${tBorder}`, color: tHeading }}
                      />
                      <button
                        type="submit"
                        disabled={newsletterBusy}
                        className="shrink-0 px-5 py-2.5 rounded-full text-xs font-bold text-white transition disabled:opacity-60"
                        style={{ backgroundColor: tAccent }}
                      >
                        {newsletterBusy ? 'Subscribing…' : (section.data.newsletterButtonText || 'Subscribe')}
                      </button>
                    </form>
                  )}
                  {newsletterError && (
                    <p className="text-[11px] font-semibold text-red-600">{newsletterError}</p>
                  )}
                </div>
              )}
              <div className="text-center text-xs space-y-3">
                <p className="font-semibold">{section.data.aboutText || section.data.tagline || `Official storefront for ${matchedStore.name}. Powered by Go Julex 0% platform fee commerce cloud.`}</p>
                <p className="text-[11px] opacity-75">
                  {section.data.copyright || section.data.copyrightText || `© ${new Date().getFullYear()} ${matchedStore.name}. All rights reserved.`}
                </p>
              </div>
            </footer>
          );
        }

        return null;
      });
      return __rendered.map((el, i) => {
        if (!el) return el;
        const sec = __enabled[i];
        return (
          <div
            key={'jxw_' + (sec.id || i)}
            className={isJulexEditMode ? 'jx-edit-wrap' : undefined}
            data-sid={sec.id}
            title={isJulexEditMode ? 'Click to edit ' + (sec.name || sec.type) : undefined}
          >
            {el}
          </div>
        );
      });
      })()}

      {/* CANVA-STYLE INLINE EDITOR (only inside the Visual Customizer iframe) */}
      {isJulexEditMode && (
        <JuxInlineEditor
          storeId={matchedStore.id}
          subdomain={cleanSubdomain}
          getSections={() => sections}
          getStyles={() => themeConfig.styles}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* SLIDE-OVER SHOPPING BAG DRAWER — styled by the store's active theme */}
      {/* ---------------------------------------------------- */}
      {isBagDrawerOpen && (() => {
        const tBg = styles?.backgroundColor || '#FFFFFF';
        const tAccent = styles?.accentColor || '#9F1239';
        const tHeading = styles?.headingColor || '#0F172A';
        const tText = styles?.textColor || '#374151';
        const tBorderRaw = (styles?.cardBorder || 'border-[#FBCBCB]').match(/#([0-9A-Fa-f]{6})/);
        const tBorder = tBorderRaw ? tBorderRaw[0] : '#E9E2D9';
        const tHeadBg = styles?.surfaceColor || styles?.headerBg || '#FFF6F2';

        return (
        <div className="fixed inset-0 z-50 overflow-hidden text-[#0F172A]">
          {/* Backdrop */}
          <div
            onClick={() => setIsBagDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-full max-w-md shadow-2xl flex flex-col justify-between animate-slide-left" style={{ backgroundColor: '#FFFFFF', borderLeft: `1px solid ${tBorder}` }}>
              {/* Drawer Header */}
              <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${tBorder}`, backgroundColor: tHeadBg }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl text-white flex items-center justify-center" style={{ backgroundColor: tAccent }}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm font-serif" style={{ color: tHeading }}>
                      Your Shopping Bag
                    </h2>
                    <p className="text-[10px]" style={{ color: tText }}>
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} • Direct from {matchedStore.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsBagDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-[#0F172A] transition"
                  title="Close Bag"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body: Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {storeCartItems.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-white text-center space-y-4 shadow-xs">
                      <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                        style={{ backgroundColor: tHeadBg, color: tAccent }}>
                        <ShoppingBag className="w-8 h-8 stroke-[2]" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-serif font-bold text-base text-[#0F172A]">
                          Your Shopping Bag is Empty
                        </p>
                        <p className="text-xs text-[#475569] max-w-xs mx-auto">
                          Add artisanal pieces crafted by {matchedStore.name} to your bag.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Quality & Delivery Guarantee */}
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-[11px] leading-tight font-medium">
                          <strong>100% Authentic Guarantee:</strong> Insured express shipping & tamper-proof sealed delivery.
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        {storeCartItems.map((item) => {
                        const itemPrice = Number(item.finalPrice || item.sellingPriceINR || item.price || 0);
                        const itemImg = item.image || item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80';

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-white transition flex items-center gap-3.5 shadow-xs"
                            style={{ border: `1px solid ${tBorder}` }}
                          >
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover bg-stone-50 shrink-0"
                              style={{ border: `1px solid ${tBorder}` }}
                            />

                            <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="font-bold text-xs truncate" style={{ color: tHeading }}>
                                {item.name}
                              </h3>
                              <p className="font-mono font-black text-xs" style={{ color: tAccent }}>
                                ₹{itemPrice.toLocaleString('en-IN')}
                              </p>

                              {/* Quantity Stepper */}
                              <div className="flex items-center gap-2 pt-1">
                                <div className="flex items-center rounded-lg bg-white overflow-hidden"
                                  style={{ border: `1px solid ${tBorder}` }}>
                                  <button
                                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                    className="px-2 py-0.5 hover:bg-black/5 text-[#374151] font-bold text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold" style={{ color: tHeading }}>
                                    {item.quantity || 1}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                    className="px-2 py-0.5 hover:bg-black/5 text-[#374151] font-bold text-xs"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                  title="Remove Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer: Subtotal & Checkout */}
              {storeCartItems.length > 0 && (
                <div className="p-5 border-t border-[#FBCBCB] bg-white space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#374151]">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold text-[#0F172A]">
                        ₹{storeSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#374151]">
                      <span>Shipping & Taxes</span>
                      <span className="text-emerald-700 font-bold">FREE (Included)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-[#0F172A] pt-2 border-t border-[#FBCBCB]">
                      <span>Total Amount</span>
                      <span className="font-mono text-base text-[#9F1239] font-black">
                        ₹{storeSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Link
                      to="/checkout"
                      onClick={() => setIsBagDrawerOpen(false)}
                      className="w-full py-3 rounded-2xl text-white text-xs font-bold text-center block shadow-md transition transform active:scale-98 cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: tAccent }}
                    >
                      Proceed to 1-Click Checkout ↗
                    </Link>

                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to="/cart"
                        onClick={() => setIsBagDrawerOpen(false)}
                        className="flex-1 py-2 text-center rounded-xl bg-white border border-[#FBCBCB] hover:bg-[#fedddd] text-[#881337] text-[11px] font-semibold transition"
                      >
                        View Full Cart Details
                      </Link>
                      <button
                        onClick={() => {
                          storeCartItems.forEach(it => removeFromCart(it.id));
                        }}
                        className="py-2 px-3 text-center rounded-xl hover:bg-rose-50 text-rose-600 text-[11px] font-semibold transition"
                      >
                        Clear Bag
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Store Customer Authentication & Account Orders Modal */}
      <StoreCustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => {
          setIsCustomerAuthOpen(false);
          try {
            const saved = localStorage.getItem(`gojulex_customer_${cleanSubdomain}`) ||
                          localStorage.getItem('gojulex_store_customer_active');
            setActiveCustomer(saved ? JSON.parse(saved) : null);
          } catch {}
        }}
        storeName={matchedStore.name}
        storeSubdomain={cleanSubdomain}
        accentColor={themeConfig?.styles?.accentColor || '#9F1239'}
        buttonRadius={themeConfig?.styles?.buttonRadius || 'rounded-2xl'}
      />
    </div>
  );
};
