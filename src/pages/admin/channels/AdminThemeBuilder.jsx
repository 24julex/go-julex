import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Maximize2,
  Save,
  RotateCcw,
  Sliders,
  Palette,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Eye,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Star,
  Globe,
  Upload,
  Type,
  CheckCircle2,
  Film,
  MessageSquare,
  Shield,
  HelpCircle,
  ExternalLink,
  Image as ImageIcon,
  Tag,
  Gift,
  Zap,
  Volume2,
  Percent,
  Compass,
  Layout,
  SlidersHorizontal,
  Wand2,
  Paintbrush,
  X
} from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';

// Master Template Layout Architectures & 14 Harmonious Theme Presets
export const HARMONIOUS_THEME_PRESETS = [
  {
    id: 'preset_soft_peach',
    name: '✨ Aura Haute Atelier Luxury',
    desc: 'Asymmetrical luxury split hero, serif display typography, floating glass cards & gold drop cap',
    layoutStyle: 'haute_atelier',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#FFFFFF',
    surfaceColor: '#FFF8F6',
    headerBg: '#FFFFFF',
    announcementBg: '#FAD4C0',
    announcementText: '#0F172A',
    accentColor: '#D4A017',
    headingColor: '#0F172A',
    textColor: '#374151',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#FBCBCB]'
  },
  {
    id: 'preset_pearl_blush',
    name: '💍 Frosted Pearl & Blush',
    desc: 'Opulent alabaster pearl with warm sand borders and regal serif headings for luxury fine jewelry & bridal',
    layoutStyle: 'haute_atelier',
    headingFont: 'Cinzel',
    bodyFont: 'Lato',
    baseFontSize: 15,
    backgroundColor: '#FDFBFA',
    surfaceColor: '#FAF0E6',
    headerBg: '#FFFFFF',
    announcementBg: '#FAF0E6',
    announcementText: '#332D28',
    accentColor: '#D4A373',
    headingColor: '#332D28',
    textColor: '#4A423B',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-xl',
    cardBorder: 'border-[#E8DFD8]'
  },
  {
    id: 'preset_sand_terracotta',
    name: '🏺 Warm Sand & Terracotta',
    desc: 'Earthy warmth emphasizing natural clay and terracotta hues for books, footwear & streetwear',
    layoutStyle: 'organic_artisan',
    headingFont: 'Cinzel',
    bodyFont: 'Lato',
    baseFontSize: 15,
    backgroundColor: '#FBF5F0',
    surfaceColor: '#F5EBE6',
    headerBg: '#FFFFFF',
    announcementBg: '#3D2319',
    announcementText: '#FFFFFF',
    accentColor: '#D4A017',
    headingColor: '#3D2319',
    textColor: '#57382D',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#E6D7CD]'
  },
  {
    id: 'preset_sage_linen',
    name: '🌱 Sage Minimalist Linen',
    desc: 'Calm eucalyptus sage green, crisp white surfaces, and natural herbal accents for organic millets & farm foods',
    layoutStyle: 'organic_artisan',
    headingFont: 'Outfit',
    bodyFont: 'DM Sans',
    baseFontSize: 15,
    backgroundColor: '#F7F9F7',
    surfaceColor: '#E8EFE9',
    headerBg: '#FFFFFF',
    announcementBg: '#2D6A4F',
    announcementText: '#FFFFFF',
    accentColor: '#2D6A4F',
    headingColor: '#1B4332',
    textColor: '#2D4A3E',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#C8DCD0]'
  },
  {
    id: 'preset_pure_cloud',
    name: '⚡ Modern Editorial & Streetwear Grid',
    desc: 'Running marquee ticker banner, heavy typography, sharp 90° square product containers & bottom slide-up quick add',
    layoutStyle: 'modern_editorial',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: 14,
    backgroundColor: '#FFFFFF',
    surfaceColor: '#FAFAFA',
    headerBg: '#FFFFFF',
    announcementBg: '#000000',
    announcementText: '#FFFFFF',
    accentColor: '#000000',
    headingColor: '#09090B',
    textColor: '#3F3F46',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-none',
    cardBorder: 'border-black'
  },
  {
    id: 'preset_playful_pop',
    name: '🎈 Playful Pop — Young Fashion',
    desc: 'Cheerful white-canvas fashion storefront: bold black display type, sunshine-yellow pill CTAs, blush pastel imagery and rotated sticker badges',
    layoutStyle: 'playful_pop',
    headingFont: 'Archivo Black',
    bodyFont: 'Poppins',
    baseFontSize: 15,
    backgroundColor: '#FFFFFF',
    surfaceColor: '#FFF0F4',
    headerBg: '#FFFFFF',
    announcementBg: '#111111',
    announcementText: '#FFFFFF',
    accentColor: '#FFC700',
    headingColor: '#111111',
    textColor: '#3F3F46',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-full',
    cardBorder: 'border-[#F7DCE4]'
  },
  {
    id: 'preset_editorial_boutique',
    name: '🏛 Editorial Boutique — Warm Luxe',
    desc: 'Cream ivory canvas, chocolate serif editorial headlines, terracotta accents and hairline-bordered lookbook cards',
    layoutStyle: 'editorial_boutique',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#F8F4ED',
    surfaceColor: '#F1EAE0',
    headerBg: '#F8F4ED',
    announcementBg: '#3E2E20',
    announcementText: '#F8F4ED',
    accentColor: '#B4552D',
    headingColor: '#3E2E20',
    textColor: '#6B5D4F',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-none',
    cardBorder: 'border-[#E3D9CA]'
  },
  {
    id: 'preset_quiet_luxe',
    name: '🕯 Quiet Luxe — Boutique Essentials',
    desc: 'Warm paper canvas, ink serif italics, moss-green accents, rust sale tags and hairline-bordered lookbook cards',
    layoutStyle: 'quiet_luxe',
    headingFont: 'Fraunces',
    bodyFont: 'Work Sans',
    baseFontSize: 15,
    backgroundColor: '#F1EDE3',
    surfaceColor: '#E7E1D2',
    headerBg: '#F1EDE3',
    announcementBg: '#23221D',
    announcementText: '#F1EDE3',
    accentColor: '#4F5B3E',
    headingColor: '#23221D',
    textColor: '#4B4A41',
    cardSurface: '#DAD2BE',
    buttonRadius: 'rounded-sm',
    cardBorder: 'border-[#C7BEA8]'
  },
  {
    id: 'preset_editorial_zine',
    name: '✦ Editorial Zine — Magazine Spread',
    desc: 'Beige editorial canvas with oversized mixed-cap serif, sage arch color blocks, floating pill nav, sparkle glyphs and collage product tiles',
    layoutStyle: 'editorial_zine',
    headingFont: 'Fraunces',
    bodyFont: 'Work Sans',
    baseFontSize: 15,
    backgroundColor: '#E8E4DB',
    surfaceColor: '#EAE6DF',
    headerBg: '#141414',
    announcementBg: '#141414',
    announcementText: '#F5F2EC',
    accentColor: '#8FBF7F',
    headingColor: '#141414',
    textColor: '#4A463E',
    cardSurface: '#F0EBE2',
    buttonRadius: 'rounded-full',
    cardBorder: 'border-[#D9CBB4]'
  },
  {
    id: 'preset_kinetic_pulse',
    name: '⚡ Kinetic Pulse — Animated Dark',
    desc: 'Dark canvas with shifting purple-blue gradients, floating cards, marquee ticker, pulse-glow accents and smooth entrance animations',
    layoutStyle: 'kinetic_pulse',
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#0A0A12',
    surfaceColor: '#12121F',
    headerBg: '#0A0A12',
    announcementBg: '#1a1a2e',
    announcementText: '#E2E8F0',
    accentColor: '#A855F7',
    headingColor: '#F1F5F9',
    textColor: '#94A3B8',
    cardSurface: '#151525',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#2A2A45]'
  },
  {
    id: 'preset_parfum_botanical',
    name: '🌹 Parfum Botanical — Soft Luxury',
    desc: 'Blush-pink botanical canvas, olive pill CTAs, floating pill nav, rotated sale stickers, serif mixed-italic headlines and animated press marquee',
    layoutStyle: 'parfum_botanical',
    headingFont: 'Playfair Display',
    bodyFont: 'Work Sans',
    baseFontSize: 15,
    backgroundColor: '#FCE4EC',
    surfaceColor: '#FBE3EA',
    headerBg: '#FFFFFF',
    announcementBg: '#A3B449',
    announcementText: '#FFFFFF',
    accentColor: '#A3B449',
    headingColor: '#1E1E1E',
    textColor: '#4A4A4A',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-full',
    cardBorder: 'border-[#F3D4DD]'
  },
  {
    id: 'preset_markly_luxe',
    name: '👜 Markly Luxe — Editorial Minimal',
    desc: 'Editorial luxury minimalism: white canvas, black grotesque type, square corners, grayscale photography, cognac leather accents and a photographic newsletter hero',
    layoutStyle: 'markly_luxe',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F6F6F6',
    headerBg: '#FFFFFF',
    announcementBg: '#111111',
    announcementText: '#FFFFFF',
    accentColor: '#A35A2B',
    headingColor: '#111111',
    textColor: '#3D3D3D',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-none',
    cardBorder: 'border-[#E6E6E6]'
  },
  {
    id: 'preset_lavender_haze',
    name: '🌸 Lavender Haze & Lilac',
    desc: 'Dreamy muted lavender, soft heather cards, and romantic typography for skincare & aromatherapy',
    layoutStyle: 'haute_atelier',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#FAF7FC',
    surfaceColor: '#F0EAF8',
    headerBg: '#FFFFFF',
    announcementBg: '#7C3AED',
    announcementText: '#FFFFFF',
    accentColor: '#7C3AED',
    headingColor: '#2E1065',
    textColor: '#4C1D95',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#DDD6FE]'
  },
  {
    id: 'preset_rosegold_atelier',
    name: '👑 Rose Gold Atelier',
    desc: 'Lustrous rose gold metallic accents with ivory surfaces and high editorial styling for designer sarees & couture',
    layoutStyle: 'haute_atelier',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#FCF9F9',
    surfaceColor: '#F5E6E8',
    headerBg: '#FFFFFF',
    announcementBg: '#4A1D24',
    announcementText: '#FFFFFF',
    accentColor: '#D4A017',
    headingColor: '#4A1D24',
    textColor: '#602B33',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#F4C7D0]'
  },
  {
    id: 'preset_nordic_frost',
    name: '❄️ Nordic Frost & Slate',
    desc: 'Cool glacial ice-blue, crisp slate borders, and precision geometric sans-serif for modern tech & gadgets',
    layoutStyle: 'modern_editorial',
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    baseFontSize: 14,
    backgroundColor: '#F5F9FC',
    surfaceColor: '#E4F0F6',
    headerBg: '#FFFFFF',
    announcementBg: '#0284C7',
    announcementText: '#FFFFFF',
    accentColor: '#0284C7',
    headingColor: '#0C2D48',
    textColor: '#1E40AF',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-xl',
    cardBorder: 'border-[#BAE6FD]'
  },
  {
    id: 'preset_emerald_botanical',
    name: '🌿 Emerald Botanical Bloom',
    desc: 'Deep forest emerald, warm botanical parchment, and holistic organic feel for herbal wellness & teas',
    layoutStyle: 'organic_artisan',
    headingFont: 'Cinzel',
    bodyFont: 'Lato',
    baseFontSize: 15,
    backgroundColor: '#F4FAF6',
    surfaceColor: '#E2F2E9',
    headerBg: '#FFFFFF',
    announcementBg: '#059669',
    announcementText: '#FFFFFF',
    accentColor: '#059669',
    headingColor: '#064E3B',
    textColor: '#134E4A',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#A7F3D0]'
  },
  {
    id: 'preset_sunset_amber',
    name: '🌅 Sunset Amber & Marigold',
    desc: 'Joyful Indian marigold saffron, warm terracotta glows, and festive radiance for handicrafts & sweets',
    layoutStyle: 'haute_atelier',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#FDF8F2',
    surfaceColor: '#FAECD8',
    headerBg: '#FFFFFF',
    announcementBg: '#D97706',
    announcementText: '#FFFFFF',
    accentColor: '#D97706',
    headingColor: '#451A03',
    textColor: '#78350F',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#FDE68A]'
  },
  {
    id: 'preset_charcoal_champagne',
    name: '🔮 Neo-Tech Cyber Grid',
    desc: 'Dark glassmorphic sticky header, glowing gold/emerald borders, LED status chips & dark obsidian grid background',
    layoutStyle: 'neo_tech',
    headingFont: 'Space Grotesk',
    bodyFont: 'Lato',
    baseFontSize: 15,
    backgroundColor: '#0B0C10',
    surfaceColor: '#12141C',
    headerBg: '#121212',
    announcementBg: '#1F2833',
    announcementText: '#F7F5F2',
    accentColor: '#D4A017',
    headingColor: '#FFFFFF',
    textColor: '#C5C6C7',
    cardSurface: '#1A1A1A',
    buttonRadius: 'rounded-xl',
    cardBorder: 'border-white/10'
  },
  {
    id: 'preset_midnight_sapphire',
    name: '💎 Midnight Sapphire Luxury',
    desc: 'Midnight navy sapphire surfaces, gold highlights, and luxury prestige layout for gems & horology',
    layoutStyle: 'neo_tech',
    headingFont: 'Cinzel',
    bodyFont: 'Outfit',
    baseFontSize: 15,
    backgroundColor: '#0B1E3D',
    surfaceColor: '#122B54',
    headerBg: '#0F254A',
    announcementBg: '#2563EB',
    announcementText: '#FFFFFF',
    accentColor: '#2563EB',
    headingColor: '#FFFFFF',
    textColor: '#93C5FD',
    cardSurface: '#143160',
    buttonRadius: 'rounded-xl',
    cardBorder: 'border-blue-400/30'
  },
  {
    id: 'preset_noir_obsidian',
    name: '🖤 Noir Obsidian & Champagne',
    desc: 'Editorial minimalist monochrome with subtle champagne gold accent for high-fashion editorial & leather',
    layoutStyle: 'modern_editorial',
    headingFont: 'Cinzel',
    bodyFont: 'Space Grotesk',
    baseFontSize: 14,
    backgroundColor: '#111111',
    surfaceColor: '#1C1C1C',
    headerBg: '#161616',
    announcementBg: '#000000',
    announcementText: '#FFFFFF',
    accentColor: '#D4A017',
    headingColor: '#FFFFFF',
    textColor: '#B8B8B8',
    cardSurface: '#1C1C1C',
    buttonRadius: 'rounded-none',
    cardBorder: 'border-zinc-700'
  },
  {
    id: 'preset_coral_silk',
    name: '🪸 Coral Silk & Cashmere',
    desc: 'Playful warm coral silk, soft cashmere peach surfaces, and rounded friendly cards for boutique gifts & toys',
    layoutStyle: 'haute_atelier',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#FFF8F6',
    surfaceColor: '#FDEAE6',
    headerBg: '#FFFFFF',
    announcementBg: '#E11D48',
    announcementText: '#FFFFFF',
    accentColor: '#D4A017',
    headingColor: '#881337',
    textColor: '#9F1239',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#FECDD3]'
  }
];

// Curated pastel swatches for quick palette tweaking
const PASTEL_SWATCHES = [
  '#BE123C', '#FAD4C0', '#D4A373', '#D4A017', '#9C6644', '#52796F',
  '#9D8189', '#B56576', '#BA7A3A', '#6B7A52', '#FFF1F2', '#0F172A'
];

// 15 Comprehensive Block Blueprints for the Storefront Builder
export const AVAILABLE_BLOCK_LIBRARY = [
  {
    type: 'announcement',
    name: 'Announcement Bar',
    category: 'Conversions & Alerts',
    desc: 'Top marquee banner with promo codes, free shipping offers, and flash alerts.',
    icon: Volume2,
    defaultData: {
      text: '✨ Complimentary Gift Packaging • Free Express Delivery Across India',
      linkText: 'Explore Catalog',
      linkUrl: '#products',
      overrideBg: '',
      overrideText: ''
    }
  },
  {
    type: 'header',
    name: 'Navigation Header',
    category: 'Navigation',
    desc: 'Sticky brand header with logo, navigation links, search, and live shopping bag count.',
    icon: Layout,
    defaultData: {
      logoText: 'My Store',
      logoImg: '',
      tagline: 'Direct-to-Consumer Boutique',
      navLink1: 'Collections',
      navLink2: 'New Arrivals',
      navLink3: 'Our Story',
      showSearch: true,
      showCartCount: true
    }
  },
  {
    type: 'hero',
    name: 'Hero Banner Slider',
    category: 'Hero & Showcase',
    desc: 'Full-bleed hero banner with bold headline, primary CTA, lookbook link, and studio imagery.',
    icon: ImageIcon,
    defaultData: {
      badgeText: '✨ Curated Seasonal Release',
      headline: 'Timeless Artistry Crafted For Discerning Tastes',
      subtext: 'Explore our latest releases made with master craftsmanship, pure materials, and timeless design.',
      ctaText: 'Shop New Arrivals ↗',
      ctaLink: '#products',
      secondaryCtaText: 'Explore Lookbook',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
      overrideBadgeBg: '',
      overrideCtaBg: '',
      overrideCtaText: ''
    }
  },
  {
    type: 'badges',
    name: 'Trust Badges & Value Props',
    category: 'Social Proof',
    desc: '4 high-trust pillar badges: Free express shipping, 100% authentic guarantee, easy returns, handcrafted.',
    icon: Shield,
    defaultData: {
      badge1Title: 'Free Express Shipping',
      badge1Desc: 'Pan-India doorstep delivery with live tracking.',
      badge2Title: '100% Authentic Guaranteed',
      badge2Desc: 'Hand-inspected genuine materials with certificate of origin.',
      badge3Title: 'Easy 7-Day Returns',
      badge3Desc: 'Hassle-free replacement & exchange guarantee.',
      badge4Title: 'Artisanal Craftsmanship',
      badge4Desc: 'Crafted with precision by generational master artisans.'
    }
  },
  {
    type: 'featured_ribbon',
    name: 'Featured Collection Ribbon',
    category: 'Commerce',
    desc: 'Curated category ribbon highlighting bestselling items and seasonal edits.',
    icon: Tag,
    defaultData: {
      badge: 'Top Picks',
      title: 'Bestselling Masterpieces',
      subtitle: 'Hand-picked favorites ready for same-day dispatch'
    }
  },
  {
    type: 'product_grid',
    name: 'Multi-Column Product Grid',
    category: 'Commerce',
    desc: 'Interactive 2/3/4-column product catalog with 1-click add to cart, discount tags, and ratings.',
    icon: ShoppingBag,
    defaultData: {
      title: 'Trending Catalog',
      subtitle: 'Direct artisanal pieces at zero platform commission.',
      columns: 3,
      showPrice: true,
      showQuickAdd: true,
      showBadges: true,
      buttonLabel: '+ Quick Add to Bag',
      overrideCardBg: '',
      overrideButtonBg: '',
      overridePriceColor: ''
    }
  },
  {
    type: 'story',
    name: 'Brand Story & Artisan Atelier',
    category: 'Storytelling',
    desc: 'Dedicated founder letter, maker heritage, workshop photograph, and brand philosophy.',
    icon: MessageSquare,
    defaultData: {
      badge: 'Our Heritage & Philosophy',
      headline: 'Crafted with Integrity, Sold with Zero Markup',
      storyText: 'Every piece is born from a devotion to timeless design and authentic materials. By bypassing traditional middlemen, we bring generational artistry straight to your doorstep.',
      founderName: 'Artisan Founder',
      founderRole: 'Master Craftsman & Curator',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    type: 'testimonials',
    name: 'Customer Reviews & Social Proof',
    category: 'Social Proof',
    desc: '5-star customer testimonials with verified buyer badges and quotes.',
    icon: Star,
    defaultData: {
      rating: '4.9 ★★★★★',
      title: 'Loved by Over 10,000+ Discerning Patrons Across India',
      quote: '"Exceptional quality, genuine materials, and delivered in pristine packaging within 48 hours."',
      author: 'Rhea Sharma, Mumbai',
      badge: 'Verified Buyer'
    }
  },
  {
    type: 'video_reels',
    name: 'Video & Social Reels Showcase',
    category: 'Media & Social',
    desc: 'Vertical 9:16 reels showcasing styling inspiration, product crafting, and unboxings.',
    icon: Film,
    defaultData: {
      title: 'Seen On Social & Reels',
      subtitle: 'Real customer unboxings & studio crafting reels',
      tagText: '@gojulex'
    }
  },
  {
    type: 'promo_banner',
    name: 'Promotional Banner & Coupon Voucher',
    category: 'Conversions & Alerts',
    desc: 'High-converting discount voucher with 1-click coupon copy and urgency countdown.',
    icon: Percent,
    defaultData: {
      badge: 'Limited Time Exclusive',
      headline: 'Unlock 15% Off Your Entire Order',
      couponCode: 'JULEX15',
      subtext: 'Apply coupon code at checkout for instant seasonal savings.',
      ctaText: 'Redeem Voucher',
      overrideBg: ''
    }
  },
  {
    type: 'category_bubbles',
    name: 'Category Bubbles & Quick Filter (D2C Pantry)',
    category: 'Navigation',
    desc: 'Circular category bubbles for quick visual navigation (Millets, Snacks, Brews, Honey, Flours).',
    icon: Compass,
    defaultData: {
      title: 'Explore By Health Category',
      showImages: true
    }
  },
  {
    type: 'faq',
    name: 'FAQ Accordion & Help Center',
    category: 'Support & FAQs',
    desc: 'Collapsible accordion answering top buyer questions regarding shipping, returns, and authenticity.',
    icon: HelpCircle,
    defaultData: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about ordering, delivery, and care.',
      q1: 'How long does shipping take across India?',
      a1: 'We ship via express air logistics. Metro orders arrive within 2-3 business days, and rest of India within 4-5 business days with full real-time tracking.',
      q2: 'What is the return and exchange policy?',
      a2: 'We offer an easy 7-day doorstep return and replacement guarantee for any defective or damaged items.',
      q3: 'Are the products guaranteed 100% authentic?',
      a3: 'Yes, every product comes with an authentic certificate of origin and is hand-inspected before dispatch.'
    }
  },
  {
    type: 'newsletter',
    name: 'VIP Newsletter & Club Signup',
    category: 'Conversions & Alerts',
    desc: 'Email capture form offering 10% off the next order for joining the VIP community.',
    icon: Sparkles,
    defaultData: {
      headline: 'Join the Connoisseur Circle',
      subtext: 'Subscribe for private preview access to limited artisanal drops and a 10% welcome voucher.',
      buttonText: 'Unlock 10% Off',
      placeholder: 'Enter your email address...'
    }
  },
  {
    type: 'instagram_feed',
    name: 'Instagram & Social Gallery Feed',
    category: 'Media & Social',
    desc: 'Shoppable Instagram grid showing how patrons style and wear your pieces.',
    icon: Globe,
    defaultData: {
      title: 'Follow Our Journey On Instagram',
      handle: '@artisanjewelry.studio',
      subtitle: 'Tag us in your photos to be featured on our official global gallery'
    }
  },
  {
    type: 'store_location',
    name: 'Physical Boutique & Atelier Visit',
    category: 'Storytelling',
    desc: 'Showcase your offline store, flagship atelier address, opening hours, and visit booking.',
    icon: Compass,
    defaultData: {
      title: 'Visit Our Flagship Atelier',
      address: '128 Heritage Avenue, Studio Lane, Chennai, Tamil Nadu - 600001',
      hours: 'Mon - Sat: 10:30 AM – 8:30 PM | Sunday by Appointment',
      phone: '+91 98765 43210',
      ctaText: 'Get Driving Directions ↗'
    }
  },
  {
    type: 'footer',
    name: 'Storefront Footer',
    category: 'Navigation',
    desc: 'Bottom footer with legal notices, payment badges, and copyright statement.',
    icon: Layout,
    defaultData: {
      tagline: '100% Direct-from-Maker Commerce • 0% Platform Commission',
      copyrightText: `© 2026 Store Name. All Rights Reserved.`,
      showNewsletter: true
    }
  }
];

export const AdminThemeBuilder = () => {
  const { currentStore, products, addProduct, updateProduct, deleteProduct, showToast } = useMerchantAdmin();
  const navigate = useNavigate();

  const cleanSubdomain = (currentStore?.subdomain || 'auraliving').toLowerCase().replace(/\.gojulex\.com$/, '');
  const liveStoreUrl = `/store/${cleanSubdomain}`;
  // Read the SAME keys the storefront reads, in the same order — so the
  // builder always customizes exactly the sections the live store renders
  const savedThemeRaw = typeof window !== 'undefined'
    ? (localStorage.getItem(`gojulex_store_theme_${currentStore?.id || 'store_' + cleanSubdomain}`) ||
       localStorage.getItem(`gojulex_store_theme_store_${cleanSubdomain}`) ||
       localStorage.getItem(`gojulex_store_theme_${cleanSubdomain}`))
    : null;
  const savedTheme = savedThemeRaw ? JSON.parse(savedThemeRaw) : null;

  // Viewport State: 'mobile' | 'desktop' | 'full'
  const [viewport, setViewport] = useState('desktop');

  // Sidebar Tab: 'blocks' | 'colors' | 'presets'
  const [activeTab, setActiveTab] = useState('blocks');

  // Currently Expanded Block in Accordion
  const [expandedSectionId, setExpandedSectionId] = useState('sec_hero');

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Active Preset ID
  const [activePresetId, setActivePresetId] = useState(savedTheme?.presetId || 'preset_soft_peach');

  // Global Styles & Colors State
  const [styles, setStyles] = useState(savedTheme?.styles || {
    presetId: 'preset_soft_peach',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    baseFontSize: 15,
    backgroundColor: '#FFF9F6',
    surfaceColor: '#FFF3EC',
    headerBg: '#FFFFFF',
    announcementBg: '#FAD4C0',
    announcementText: '#4A281E',
    accentColor: '#E8927C',
    headingColor: '#4A281E',
    textColor: '#7A4B3A',
    cardSurface: '#FFFFFF',
    buttonRadius: 'rounded-2xl',
    cardBorder: 'border-[#F7D8CA]'
  });

  // Reorderable and 100% Configurable Sections (Full Suite by Default)
  const [sections, setSections] = useState(() => {
    if (savedTheme?.sections && Array.isArray(savedTheme.sections) && savedTheme.sections.length > 0) {
      return savedTheme.sections;
    }
    return [
      {
        id: 'sec_announcement',
        type: 'announcement',
        name: 'Announcement Bar',
        enabled: true,
        data: {
          text: `✨ Complimentary Gift Packaging on Orders at ${currentStore?.name || 'My Store'} • Free Express Delivery Across India`,
          linkText: 'Explore Catalog',
          linkUrl: '#products',
          overrideBg: '',
          overrideText: ''
        }
      },
    {
      id: 'sec_header',
      type: 'header',
      name: 'Navigation Header',
      enabled: true,
      data: {
        logoText: currentStore?.name || 'My Store',
        logoImg: '',
        tagline: currentStore?.categoryLabel || 'Direct-to-Consumer Boutique',
        navLink1: 'Collections',
        navLink2: 'New Arrivals',
        navLink3: 'Our Story',
        showSearch: true,
        showCartCount: true
      }
    },
    {
      id: 'sec_hero',
      type: 'hero',
      name: 'Hero Banner Slider',
      enabled: true,
      data: {
        badgeText: '✨ Curated Seasonal Release',
        headline: 'Timeless Artistry Crafted For Discerning Tastes',
        subtext: 'Explore our latest releases made with master craftsmanship, pure materials, and 0% platform markups.',
        ctaText: 'Shop New Arrivals ↗',
        ctaLink: '#products',
        secondaryCtaText: 'Explore Lookbook',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
        overrideBadgeBg: '',
        overrideCtaBg: '',
        overrideCtaText: ''
      }
    },
    {
      id: 'sec_badges',
      type: 'badges',
      name: 'Trust Badges & Value Props',
      enabled: true,
      data: {
        badge1Title: 'Free Express Shipping',
        badge1Desc: 'Pan-India doorstep delivery with live tracking.',
        badge2Title: '100% Authentic Guaranteed',
        badge2Desc: 'Hand-inspected genuine materials with certificate.',
        badge3Title: 'Easy 7-Day Returns',
        badge3Desc: 'Hassle-free replacement & exchange guarantee.',
        badge4Title: 'Artisanal Craftsmanship',
        badge4Desc: 'Generational craftsmanship & master design.'
      }
    },
    {
      id: 'sec_featured',
      type: 'featured_ribbon',
      name: 'Featured Collection Ribbon',
      enabled: true,
      data: {
        badge: 'Top Picks',
        title: 'Bestselling Masterpieces',
        subtitle: 'Hand-picked favorites ready for same-day dispatch'
      }
    },
    {
      id: 'sec_grid',
      type: 'product_grid',
      name: 'Multi-Column Product Grid',
      enabled: true,
      data: {
        title: 'Trending Catalog',
        subtitle: 'Handcrafted pieces crafted for discerning tastes.',
        columns: 3,
        showPrice: true,
        showQuickAdd: true,
        showBadges: true,
        buttonLabel: '+ Quick Add to Bag',
        overrideCardBg: '',
        overrideButtonBg: '',
        overridePriceColor: ''
      }
    },
    {
      id: 'sec_story',
      type: 'story',
      name: 'Brand Story & Artisan Atelier',
      enabled: true,
      data: {
        badge: 'Our Heritage & Philosophy',
        headline: 'Crafted with Devotion & Integrity',
        storyText: 'Every piece is born from a devotion to timeless design and authentic materials. We bring generational artistry and certified quality straight to your doorstep.',
        founderName: 'Artisan Founder',
        founderRole: 'Master Craftsman & Curator',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
      }
    },
    {
      id: 'sec_testimonials',
      type: 'testimonials',
      name: 'Customer Reviews & Social Proof',
      enabled: true,
      data: {
        rating: '4.9 ★★★★★',
        title: 'Loved by Over 10,000+ Discerning Patrons Across India',
        quote: '"Exceptional quality, genuine materials, and delivered in pristine packaging within 48 hours."',
        author: 'Rhea Sharma, Mumbai',
        badge: 'Verified Buyer'
      }
    },
    {
      id: 'sec_faq',
      type: 'faq',
      name: 'FAQ Accordion & Help Center',
      enabled: true,
      data: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about ordering, delivery, and care.',
        q1: 'How long does shipping take across India?',
        a1: 'We ship via express air logistics. Metro orders arrive within 2-3 business days, and rest of India within 4-5 business days.',
        q2: 'What is the return and exchange policy?',
        a2: 'We offer an easy 7-day doorstep return and replacement guarantee for any defective items.',
        q3: 'Are the products guaranteed 100% authentic?',
        a3: 'Yes, every product comes with an authentic certificate of origin and is hand-inspected.'
      }
    },
    {
      id: 'sec_footer',
      type: 'footer',
      name: 'Storefront Footer',
      enabled: true,
      data: {
        tagline: '100% Direct-from-Maker Commerce • 0% Platform Commission',
        copyrightText: `© ${new Date().getFullYear()} ${currentStore?.name || 'My Store'}. All Rights Reserved.`,
        showNewsletter: true
      }
    }
  ];
});

  // Modal / Drawer state for adding new sections from the library
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [blockCategoryFilter, setBlockCategoryFilter] = useState('All');

  const handleAddBlock = (blueprint) => {
    const newId = `sec_${blueprint.type}_${Date.now()}`;
    const newSection = {
      id: newId,
      type: blueprint.type,
      name: blueprint.name,
      enabled: true,
      data: { ...blueprint.defaultData }
    };
    // Insert before footer or at the end
    const footerIdx = sections.findIndex((s) => s.type === 'footer');
    const updated = [...sections];
    if (footerIdx !== -1) {
      updated.splice(footerIdx, 0, newSection);
    } else {
      updated.push(newSection);
    }
    setSections(updated);
    setExpandedSectionId(newId);
    setActiveTab('blocks');
    setIsAddBlockOpen(false);
    showToast(`Added "${blueprint.name}" section to your storefront! 🎉`, 'success');

    // Auto-save draft to localStorage
    try {
      const payload = {
        presetId: activePresetId,
        styles,
        sections: updated,
        updatedAt: new Date().toISOString()
      };
      if (currentStore?.id) localStorage.setItem(`gojulex_store_theme_${currentStore.id}`, JSON.stringify(payload));
      localStorage.setItem(`gojulex_store_theme_${cleanSubdomain}`, JSON.stringify(payload));
      localStorage.setItem(`gojulex_store_theme_store_${cleanSubdomain}`, JSON.stringify(payload));
    } catch (e) {}
  };

  // 1-Click Apply Preset
  const applyPreset = (preset) => {
    setActivePresetId(preset.id);
    setStyles({
      ...styles,
      presetId: preset.id,
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
      baseFontSize: preset.baseFontSize,
      backgroundColor: preset.backgroundColor,
      surfaceColor: preset.surfaceColor,
      headerBg: preset.headerBg,
      announcementBg: preset.announcementBg,
      announcementText: preset.announcementText,
      accentColor: preset.accentColor,
      headingColor: preset.headingColor,
      textColor: preset.textColor,
      cardSurface: preset.cardSurface,
      buttonRadius: preset.buttonRadius,
      cardBorder: preset.cardBorder
    });
    showToast(`Applied "${preset.name}" palette preset!`, 'success');
  };

  // Drag & Drop Section Reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updated = [...sections];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setSections(updated);
    setDraggedIndex(null);
    showToast(`Moved "${movedItem.name}" to position ${targetIndex + 1}`, 'info');
  };

  // Move Up / Down Steppers
  const moveSection = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setSections(updated);
    showToast(`Moved "${movedItem.name}" ${direction}`, 'info');
  };

  const toggleSectionEnabled = (id) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const removeSection = (id) => {
    const toRemove = sections.find((s) => s.id === id);
    setSections(sections.filter((s) => s.id !== id));
    showToast(`Removed "${toRemove?.name}" from layout`, 'info');
  };

  // File Upload Helper (Local Device -> FileReader Data URL)
  const handleFileUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          callback(uploadEvent.target.result);
          showToast('Image uploaded successfully from your device!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    const payload = {
      presetId: activePresetId,
      styles,
      sections,
      updatedAt: new Date().toISOString()
    };
    try {
      if (currentStore?.id) {
        localStorage.setItem(`gojulex_store_theme_${currentStore.id}`, JSON.stringify(payload));
        localStorage.setItem(`gojulex_store_active_theme_${currentStore.id}`, activePresetId);
      }
      localStorage.setItem(`gojulex_store_theme_${cleanSubdomain}`, JSON.stringify(payload));
      localStorage.setItem(`gojulex_store_theme_store_${cleanSubdomain}`, JSON.stringify(payload));
      localStorage.setItem(`gojulex_store_active_theme_${cleanSubdomain}`, activePresetId);
    } catch (e) {}

    showToast('Theme layout & all custom sections published live! 🚀', 'success');
  };

  const handleDiscard = () => {
    showToast('Discarded draft customizer changes', 'info');
    navigate('/admin/channels/online-store/themes');
  };

  // Helper to render interactive color input with Hex field + Swatches
  const renderColorControl = (label, value, onChange) => (
    <div className="p-2.5 rounded-2xl bg-white border border-[#FBCBCB] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#0F172A]">{label}</span>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded-lg bg-transparent border-0 cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 px-2 py-0.5 rounded-lg bg-white border border-[#FBCBCB] font-mono text-[10px] text-[#0F172A] text-center focus:outline-none focus:border-[#BE123C]"
          />
        </div>
      </div>
      {/* Quick Pastel Swatch Row */}
      <div className="flex items-center gap-1 overflow-x-auto pt-0.5">
        {PASTEL_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onChange(swatch)}
            className="w-4 h-4 rounded-full border border-black/10 shrink-0 hover:scale-125 transition"
            style={{ backgroundColor: swatch }}
            title={swatch}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col text-[#0F172A] overflow-hidden select-none font-sans">
      {/* 1. Top Customizer Bar */}
      <header className="h-14 border-b border-[#FBCBCB] bg-white/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Back & Active Theme */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscard}
            className="p-2 rounded-2xl bg-white border border-[#FBCBCB] hover:bg-[#FEE2E2] text-[#881337] hover:text-[#0F172A] transition"
            title="Exit Customizer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#0F172A] font-serif">
                {HARMONIOUS_THEME_PRESETS.find((p) => p.id === activePresetId)?.name || 'Custom Theme'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#fedddd] text-[#881337] border border-[#F8B4B4]">
                Soft Peach Engine
              </span>
            </div>
            <p className="text-[10px] text-[#374151]">
              {currentStore.name} • 100% Cohesive Palette & Typography
            </p>
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#FBCBCB] rounded-2xl text-xs shadow-xs">
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-xl transition ${
              viewport === 'mobile' ? 'bg-[#D4A017] text-white shadow-xs' : 'text-[#374151] hover:text-[#0F172A]'
            }`}
            title="Mobile View (380px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-xl transition ${
              viewport === 'desktop' ? 'bg-[#D4A017] text-white shadow-xs' : 'text-[#374151] hover:text-[#0F172A]'
            }`}
            title="Desktop Canvas (900px)"
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport('full')}
            className={`p-1.5 rounded-xl transition ${
              viewport === 'full' ? 'bg-[#D4A017] text-white shadow-xs' : 'text-[#374151] hover:text-[#0F172A]'
            }`}
            title="Full Screen Canvas"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Live Link, Reset, Discard, Save */}
        <div className="flex items-center gap-2">
          <Link
            to={liveStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-xs font-semibold text-[#881337] hover:text-[#0F172A] transition shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>View Live Store</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={() => applyPreset(HARMONIOUS_THEME_PRESETS[0])}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-xs font-semibold text-[#881337] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button
            onClick={handleDiscard}
            className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-xs font-semibold text-[#881337] transition"
          >
            Discard
          </button>

          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-[#D4A017] hover:bg-[#881337] text-white font-bold text-xs shadow-xs transition transform active:scale-95"
          >
            <Save className="w-3.5 h-3.5" /> Save & Publish Live 🚀
          </button>
        </div>
      </header>

      {/* 2. Main Workspace: Left Controls Sidebar & Center Live Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT CONTROLS SIDEBAR */}
        <aside className="w-84 sm:w-96 border-r border-[#FBCBCB] bg-white/80 backdrop-blur-md flex flex-col shrink-0 overflow-hidden text-xs">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-[#FBCBCB] bg-white p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`py-2 rounded-2xl font-bold flex items-center justify-center gap-1 transition ${
                activeTab === 'blocks'
                  ? 'bg-[#D4A017] text-white shadow-xs'
                  : 'text-[#881337] hover:bg-[#FEE2E2]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Blocks ({sections.length})
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`py-2 rounded-2xl font-bold flex items-center justify-center gap-1 transition ${
                activeTab === 'colors'
                  ? 'bg-[#D4A017] text-white shadow-xs'
                  : 'text-[#881337] hover:bg-[#FEE2E2]'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" /> Colors & Fonts
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-2 rounded-2xl font-bold flex items-center justify-center gap-1 transition ${
                activeTab === 'presets'
                  ? 'bg-[#D4A017] text-white shadow-xs'
                  : 'text-[#881337] hover:bg-[#FEE2E2]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" /> 12 Presets
            </button>
          </div>

          {/* TAB 1: BLOCKS & CONTENT + PER-BLOCK COLOR OVERRIDES */}
          {activeTab === 'blocks' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px]">
                  Storefront Structure ({sections.length} Blocks)
                </span>
                <span className="text-[10px] text-[#374151] font-semibold">
                  Drag ↕ or Click ▲▼
                </span>
              </div>

              {/* Sections Reorder List */}
              <div className="space-y-2">
                {sections.map((sec, idx) => {
                  const isExpanded = expandedSectionId === sec.id;

                  return (
                    <div
                      key={sec.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`rounded-2xl border transition bg-white overflow-hidden ${
                        draggedIndex === idx ? 'opacity-40 border-dashed border-[#BE123C]' : ''
                      } ${
                        isExpanded ? 'border-[#BE123C] shadow-xs' : 'border-[#FBCBCB] hover:border-[#BE123C]/60'
                      }`}
                    >
                      {/* Block Row */}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div
                          className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1 min-w-0"
                          onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                        >
                          <GripVertical className="w-4 h-4 text-slate-400 shrink-0 hover:text-[#D4A017]" />
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-[#0F172A] block truncate">
                              {sec.name}
                            </span>
                            <span className="text-[9px] text-[#374151] uppercase tracking-wider">
                              Block #{idx + 1}
                            </span>
                          </div>
                        </div>

                        {/* Move Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, 'up')}
                            className="p-1 rounded-lg hover:bg-[#fedddd] text-[#881337] disabled:opacity-20 transition"
                            title="Move Block Up (▲)"
                          >
                            <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sections.length - 1}
                            onClick={() => moveSection(idx, 'down')}
                            className="p-1 rounded-lg hover:bg-[#fedddd] text-[#881337] disabled:opacity-20 transition"
                            title="Move Block Down (▼)"
                          >
                            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSectionEnabled(sec.id)}
                            className={`p-1 rounded-lg text-xs font-bold transition ml-1 ${
                              sec.enabled ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-stone-100'
                            }`}
                            title={sec.enabled ? 'Visible in Storefront' : 'Hidden'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Accordion Inputs & Per-Block Color Controls */}
                      {isExpanded && (
                        <div className="p-3.5 border-t border-[#FBCBCB] bg-white space-y-3 text-[11px] animate-fade-in">
                          {/* Announcement Bar Form */}
                          {sec.type === 'announcement' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Announcement Copy</label>
                                <textarea
                                  rows="2"
                                  value={sec.data.text}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.text = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Link CTA Label</label>
                                  <input
                                    type="text"
                                    value={sec.data.linkText}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.linkText = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A]"
                                  />
                                </div>

                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Custom Bar Bg Override</label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="color"
                                      value={sec.data.overrideBg || styles.announcementBg}
                                      onChange={(e) => {
                                        const updated = [...sections];
                                        updated[idx].data.overrideBg = e.target.value;
                                        setSections(updated);
                                      }}
                                      className="w-6 h-6 rounded-lg bg-transparent border-0 cursor-pointer"
                                    />
                                    <span className="font-mono text-[10px]">
                                      {sec.data.overrideBg || styles.announcementBg}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Navigation Header Form */}
                          {sec.type === 'header' && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Brand Logo Text</label>
                                <input
                                  type="text"
                                  value={sec.data.logoText || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.logoText = e.target.value;
                                    setSections(updated);
                                  }}
                                  placeholder="e.g. Abi's Jewelry Store"
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Brand Tagline / Niche</label>
                                <input
                                  type="text"
                                  value={sec.data.tagline || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.tagline = e.target.value;
                                    setSections(updated);
                                  }}
                                  placeholder="e.g. Fine Jewelry & Luxury"
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A]"
                                />
                              </div>

                              {/* Logo Image URL / Upload */}
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Brand Logo Image (Upload / URL)</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={sec.data.logoImg || ''}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.logoImg = e.target.value;
                                      setSections(updated);
                                    }}
                                    placeholder="https://... or upload below"
                                    className="flex-1 px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-mono text-[10px]"
                                  />
                                  <label className="cursor-pointer px-3 py-1.5 bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] rounded-xl text-[#881337] font-bold text-[10px] whitespace-nowrap">
                                    <Upload className="w-3 h-3 inline mr-1" /> Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = () => {
                                            const updated = [...sections];
                                            updated[idx].data.logoImg = reader.result;
                                            setSections(updated);
                                            showToast('Logo uploaded!', 'success');
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Navigation Links */}
                              <div className="pt-2 border-t border-[#FBCBCB] space-y-2">
                                <span className="font-bold text-[#0F172A] block text-[10px] uppercase tracking-wider">
                                  Header Navigation Links
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[10px] text-[#374151] block mb-0.5">Link 1</label>
                                    <input
                                      type="text"
                                      value={sec.data.navLink1 || 'Collections'}
                                      onChange={(e) => {
                                        const updated = [...sections];
                                        updated[idx].data.navLink1 = e.target.value;
                                        setSections(updated);
                                      }}
                                      className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl text-[10px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-[#374151] block mb-0.5">Link 2</label>
                                    <input
                                      type="text"
                                      value={sec.data.navLink2 || 'New Arrivals'}
                                      onChange={(e) => {
                                        const updated = [...sections];
                                        updated[idx].data.navLink2 = e.target.value;
                                        setSections(updated);
                                      }}
                                      className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl text-[10px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-[#374151] block mb-0.5">Link 3</label>
                                    <input
                                      type="text"
                                      value={sec.data.navLink3 || 'Our Story'}
                                      onChange={(e) => {
                                        const updated = [...sections];
                                        updated[idx].data.navLink3 = e.target.value;
                                        setSections(updated);
                                      }}
                                      className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl text-[10px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Hero Banner Form */}
                          {sec.type === 'hero' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Badge Ribbon Text</label>
                                <input
                                  type="text"
                                  value={sec.data.badgeText}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badgeText = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A]"
                                />
                              </div>

                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Headline Text</label>
                                <input
                                  type="text"
                                  value={sec.data.headline}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.headline = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Subtext Copy</label>
                                <textarea
                                  rows="2"
                                  value={sec.data.subtext}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.subtext = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A]"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Primary CTA Button Label</label>
                                  <input
                                    type="text"
                                    value={sec.data.ctaText}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.ctaText = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-semibold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Secondary CTA Label</label>
                                  <input
                                    type="text"
                                    value={sec.data.secondaryCtaText}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.secondaryCtaText = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                  />
                                </div>
                              </div>

                              {/* Hero Media Upload */}
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">
                                  Hero Image / Media (Upload from Local Device or Paste URL)
                                </label>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D4A017] text-white font-bold cursor-pointer hover:bg-[#881337] transition shrink-0">
                                      <Upload className="w-3.5 h-3.5" /> Upload File
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                          handleFileUpload(e, (dataUrl) => {
                                            const updated = [...sections];
                                            updated[idx].data.imageUrl = dataUrl;
                                            setSections(updated);
                                          })
                                        }
                                      />
                                    </label>
                                    <input
                                      type="text"
                                      value={sec.data.imageUrl}
                                      placeholder="Or paste image URL"
                                      onChange={(e) => {
                                        const updated = [...sections];
                                        updated[idx].data.imageUrl = e.target.value;
                                        setSections(updated);
                                      }}
                                      className="flex-1 px-2.5 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] text-[10px] font-mono"
                                    />
                                  </div>

                                  {sec.data.imageUrl && (
                                    <div className="relative w-full h-20 rounded-xl overflow-hidden border border-[#FBCBCB] bg-white">
                                      <img
                                        src={sec.data.imageUrl}
                                        alt="Hero Preview"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Product Grid Form */}
                          {sec.type === 'product_grid' && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Section Title</label>
                                <input
                                  type="text"
                                  value={sec.data.title}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Columns Layout</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {[2, 3, 4].map((cols) => (
                                    <button
                                      key={cols}
                                      type="button"
                                      onClick={() => {
                                        const updated = [...sections];
                                        updated[idx].data.columns = cols;
                                        setSections(updated);
                                      }}
                                      className={`py-1.5 rounded-xl font-bold border transition ${
                                        sec.data.columns === cols
                                          ? 'bg-[#D4A017] text-white border-[#BE123C]'
                                          : 'bg-white text-[#881337] border-[#FBCBCB]'
                                      }`}
                                    >
                                      {cols} Columns
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Direct Product Images & Items Customizer */}
                              <div className="pt-2 border-t border-[#FBCBCB] space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#0F172A] text-[11px] uppercase tracking-wider">
                                    Manage Product Photos & Details ({products.length})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addProduct({
                                        name: 'New Custom Creation',
                                        sellingPriceINR: 4999,
                                        comparePriceINR: 5999,
                                        category: currentStore.categoryLabel || 'General',
                                        stockQuantity: 10,
                                        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
                                        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
                                        description: 'Custom handcrafted item added via theme customizer.'
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-xl bg-[#D4A017] text-white font-bold text-[10px] hover:bg-[#881337] transition flex items-center gap-1 shadow-xs"
                                  >
                                    <Plus className="w-3 h-3 stroke-[3]" /> Add Product
                                  </button>
                                </div>

                                {products.length === 0 ? (
                                  <div className="p-4 text-center rounded-2xl bg-white border border-dashed border-[#FBCBCB] space-y-2">
                                    <p className="text-[11px] text-[#374151]">No custom products yet in this store.</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        addProduct({
                                          name: 'Signature Artisan Piece',
                                          sellingPriceINR: 12500,
                                          comparePriceINR: 14999,
                                          category: currentStore.categoryLabel || 'Boutique',
                                          stockQuantity: 10,
                                          images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
                                          imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
                                          description: 'Bespoke item with custom craftsmanship.'
                                        });
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-[#D4A017] text-white font-bold text-xs"
                                    >
                                      + Create First Product
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                    {products.map((prod, pIdx) => {
                                      const mainImg = prod.imageUrl || prod.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';
                                      return (
                                        <div
                                          key={prod.id || pIdx}
                                          className="p-2.5 rounded-2xl bg-white border border-[#FBCBCB] space-y-2 shadow-xs"
                                        >
                                          {/* Product Thumbnail & Quick Info */}
                                          <div className="flex items-center gap-2.5">
                                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-[#FBCBCB] shrink-0">
                                              <img
                                                src={mainImg}
                                                alt={prod.name}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                              <input
                                                type="text"
                                                value={prod.name}
                                                onChange={(e) => updateProduct(prod.id, { name: e.target.value })}
                                                placeholder="Product Title"
                                                className="w-full px-2 py-0.5 bg-[#FFF5F5] border border-[#FBCBCB] rounded-lg text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                                              />
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-500 font-bold">₹</span>
                                                <input
                                                  type="number"
                                                  value={prod.sellingPriceINR || prod.price || ''}
                                                  onChange={(e) => updateProduct(prod.id, { sellingPriceINR: Number(e.target.value), price: Number(e.target.value) })}
                                                  placeholder="Price"
                                                  className="w-20 px-1.5 py-0.5 bg-[#FFF5F5] border border-[#FBCBCB] rounded-lg text-[10px] font-mono text-[#0F172A] font-bold"
                                                />
                                              </div>
                                            </div>

                                            <button
                                              type="button"
                                              onClick={() => deleteProduct(prod.id)}
                                              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition shrink-0"
                                              title="Remove Product"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>

                                          {/* Image Uploader for this product */}
                                          <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                                            <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-[#fedddd] hover:bg-[#FEE2E2] border border-[#F8B4B4] text-[#881337] font-bold text-[10px] flex items-center gap-1 transition">
                                              <Upload className="w-3 h-3" />
                                              <span>Upload Photo</span>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, (dataUrl) => {
                                                  updateProduct(prod.id, {
                                                    imageUrl: dataUrl,
                                                    images: [dataUrl, ...(prod.images?.slice(1) || [])]
                                                  });
                                                })}
                                              />
                                            </label>

                                            <input
                                              type="text"
                                              value={prod.imageUrl || ''}
                                              onChange={(e) => updateProduct(prod.id, { imageUrl: e.target.value, images: [e.target.value] })}
                                              placeholder="Or paste image URL"
                                              className="flex-1 px-2 py-1 bg-[#FFF5F5] border border-[#FBCBCB] rounded-lg text-[10px] font-mono text-[#0F172A] placeholder-slate-400"
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Trust Badges Form */}
                          {sec.type === 'badges' && (
                            <div className="space-y-2.5">
                              <div className="space-y-1.5 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Badge 1 (0% Fee / Commission)</label>
                                <input
                                  type="text"
                                  value={sec.data.badge1Title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge1Title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-bold"
                                />
                                <input
                                  type="text"
                                  value={sec.data.badge1Desc || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge1Desc = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg text-[10px]"
                                />
                              </div>

                              <div className="space-y-1.5 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Badge 2 (Authenticity & Quality)</label>
                                <input
                                  type="text"
                                  value={sec.data.badge2Title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge2Title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-bold"
                                />
                                <input
                                  type="text"
                                  value={sec.data.badge2Desc || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge2Desc = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg text-[10px]"
                                />
                              </div>

                              <div className="space-y-1.5 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Badge 3 (Shipping & Delivery)</label>
                                <input
                                  type="text"
                                  value={sec.data.badge3Title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge3Title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-bold"
                                />
                                <input
                                  type="text"
                                  value={sec.data.badge3Desc || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge3Desc = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg text-[10px]"
                                />
                              </div>

                              <div className="space-y-1.5 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Badge 4 (Craftsmanship / Support)</label>
                                <input
                                  type="text"
                                  value={sec.data.badge4Title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge4Title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-bold"
                                />
                                <input
                                  type="text"
                                  value={sec.data.badge4Desc || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge4Desc = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg text-[10px]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Brand Story Form */}
                          {sec.type === 'story' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Badge Copy</label>
                                <input
                                  type="text"
                                  value={sec.data.badge || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.badge = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Headline</label>
                                <input
                                  type="text"
                                  value={sec.data.headline || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.headline = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Founder / Brand Story Paragraph</label>
                                <textarea
                                  rows="3"
                                  value={sec.data.storyText || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.storyText = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[11px]"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Founder Name</label>
                                  <input
                                    type="text"
                                    value={sec.data.founderName || ''}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.founderName = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Role / Title</label>
                                  <input
                                    type="text"
                                    value={sec.data.founderRole || ''}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.founderRole = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl text-xs"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Story / Studio Photo</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={sec.data.imageUrl || ''}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.imageUrl = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="flex-1 px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl font-mono text-[10px]"
                                  />
                                  <label className="cursor-pointer px-2.5 py-1 bg-[#fedddd] hover:bg-[#FEE2E2] border border-[#F8B4B4] rounded-xl text-[#881337] font-bold text-[10px]">
                                    <Upload className="w-3 h-3 inline mr-1" /> Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, (url) => {
                                        const updated = [...sections];
                                        updated[idx].data.imageUrl = url;
                                        setSections(updated);
                                      })}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Customer Reviews & Testimonials Form */}
                          {sec.type === 'testimonials' && (
                            <div className="space-y-2.5">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Rating Display</label>
                                  <input
                                    type="text"
                                    value={sec.data.rating || ''}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.rating = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Badge Tag</label>
                                  <input
                                    type="text"
                                    value={sec.data.badge || ''}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.badge = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Section Title</label>
                                <input
                                  type="text"
                                  value={sec.data.title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Customer Quote</label>
                                <textarea
                                  rows="2"
                                  value={sec.data.quote || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.quote = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Customer Author & City</label>
                                <input
                                  type="text"
                                  value={sec.data.author || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.author = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                />
                              </div>
                            </div>
                          )}

                          {/* Video Reel Showcase Form */}
                          {sec.type === 'video_reels' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Section Title</label>
                                <input
                                  type="text"
                                  value={sec.data.title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                  placeholder="e.g. Seen On Social & Reels"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Subtitle</label>
                                <input
                                  type="text"
                                  value={sec.data.subtitle || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.subtitle = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                  placeholder="e.g. Real customer unboxings & studio crafting reels"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Social Tag / Handle</label>
                                <input
                                  type="text"
                                  value={sec.data.tagText || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.tagText = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-mono text-[#881337] font-bold"
                                  placeholder="@brandname"
                                />
                              </div>

                              <div className="space-y-1.5 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Reel 1 Poster / Video Image</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={sec.data.reel1Img || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80'}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.reel1Img = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="flex-1 px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-mono text-[10px]"
                                  />
                                  <label className="cursor-pointer px-2 py-1 bg-[#fedddd] hover:bg-[#FEE2E2] border border-[#F8B4B4] rounded-lg text-[#881337] font-bold text-[10px]">
                                    <Upload className="w-3 h-3 inline mr-1" /> Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, (url) => {
                                        const updated = [...sections];
                                        updated[idx].data.reel1Img = url;
                                        setSections(updated);
                                      })}
                                    />
                                  </label>
                                </div>
                              </div>

                              <div className="space-y-1.5 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Reel 2 Poster / Video Image</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={sec.data.reel2Img || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.reel2Img = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="flex-1 px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-mono text-[10px]"
                                  />
                                  <label className="cursor-pointer px-2 py-1 bg-[#fedddd] hover:bg-[#FEE2E2] border border-[#F8B4B4] rounded-lg text-[#881337] font-bold text-[10px]">
                                    <Upload className="w-3 h-3 inline mr-1" /> Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, (url) => {
                                        const updated = [...sections];
                                        updated[idx].data.reel2Img = url;
                                        setSections(updated);
                                      })}
                                    />
                                  </label>
                                </div>
                              </div>

                              <div className="space-y-1.5 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Reel 3 Poster / Video Image</label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={sec.data.reel3Img || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.reel3Img = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="flex-1 px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-mono text-[10px]"
                                  />
                                  <label className="cursor-pointer px-2 py-1 bg-[#fedddd] hover:bg-[#FEE2E2] border border-[#F8B4B4] rounded-lg text-[#881337] font-bold text-[10px]">
                                    <Upload className="w-3 h-3 inline mr-1" /> Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, (url) => {
                                        const updated = [...sections];
                                        updated[idx].data.reel3Img = url;
                                        setSections(updated);
                                      })}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Promotional Banner */}
                          {sec.type === 'promo_banner' && (
                            <div className="space-y-2">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Headline Text</label>
                                <input
                                  type="text"
                                  value={sec.data.headline}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.headline = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">Coupon Code</label>
                                  <input
                                    type="text"
                                    value={sec.data.couponCode}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.couponCode = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-mono text-[#D4A017] font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[#374151] font-semibold block mb-1">CTA Label</label>
                                  <input
                                    type="text"
                                    value={sec.data.ctaText}
                                    onChange={(e) => {
                                      const updated = [...sections];
                                      updated[idx].data.ctaText = e.target.value;
                                      setSections(updated);
                                    }}
                                    className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* FAQ Accordion Form */}
                          {sec.type === 'faq' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">FAQ Section Title</label>
                                <input
                                  type="text"
                                  value={sec.data.title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div className="space-y-1 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Question 1 (Shipping & Logistics)</label>
                                <input
                                  type="text"
                                  value={sec.data.q1 || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.q1 = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-bold"
                                />
                                <textarea
                                  rows="2"
                                  value={sec.data.a1 || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.a1 = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg text-[10px]"
                                />
                              </div>

                              <div className="space-y-1 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Question 2 (Returns & Exchange)</label>
                                <input
                                  type="text"
                                  value={sec.data.q2 || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.q2 = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-bold"
                                />
                                <textarea
                                  rows="2"
                                  value={sec.data.a2 || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.a2 = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg text-[10px]"
                                />
                              </div>

                              <div className="space-y-1 p-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB]">
                                <label className="text-[#374151] font-bold block text-[10px]">Question 3 (Authenticity Guarantee)</label>
                                <input
                                  type="text"
                                  value={sec.data.q3 || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.q3 = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg font-bold"
                                />
                                <textarea
                                  rows="2"
                                  value={sec.data.a3 || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.a3 = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-[#FBCBCB] rounded-lg text-[10px]"
                                />
                              </div>
                            </div>
                          )}

                          {/* VIP Newsletter Form */}
                          {sec.type === 'newsletter' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Headline</label>
                                <input
                                  type="text"
                                  value={sec.data.headline || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.headline = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Subtext / Offer</label>
                                <input
                                  type="text"
                                  value={sec.data.subtext || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.subtext = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Button Label</label>
                                <input
                                  type="text"
                                  value={sec.data.buttonText || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.buttonText = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold text-[#881337]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Instagram Gallery Form */}
                          {sec.type === 'instagram_feed' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Gallery Title</label>
                                <input
                                  type="text"
                                  value={sec.data.title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Instagram Handle</label>
                                <input
                                  type="text"
                                  value={sec.data.handle || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.handle = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-mono text-[#881337] font-bold"
                                />
                              </div>
                            </div>
                          )}

                          {/* Physical Boutique & Atelier Form */}
                          {sec.type === 'store_location' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Atelier / Store Title</label>
                                <input
                                  type="text"
                                  value={sec.data.title || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.title = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Physical Address</label>
                                <input
                                  type="text"
                                  value={sec.data.address || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.address = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Visiting Hours</label>
                                <input
                                  type="text"
                                  value={sec.data.hours || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.hours = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Contact Phone</label>
                                <input
                                  type="text"
                                  value={sec.data.phone || ''}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.phone = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl font-mono text-[10px]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          {sec.type === 'footer' && (
                            <div className="space-y-2">
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Footer Tagline</label>
                                <input
                                  type="text"
                                  value={sec.data.tagline}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.tagline = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="text-[#374151] font-semibold block mb-1">Copyright Line</label>
                                <input
                                  type="text"
                                  value={sec.data.copyrightText}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[idx].data.copyrightText = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#FBCBCB] rounded-xl"
                                />
                              </div>
                            </div>
                          )}

                          {/* Delete Block */}
                          <div className="pt-2 border-t border-[#FBCBCB] flex items-center justify-between">
                            <span className="text-[10px] text-[#374151]/70">Section ID: {sec.id}</span>
                            <button
                              type="button"
                              onClick={() => removeSection(sec.id)}
                              className="text-rose-600 hover:text-rose-700 text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Remove Section
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Section Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBlockOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#fedddd] hover:bg-[#FEE2E2] border-2 border-dashed border-[#F8B4B4] hover:border-[#D4A017] text-[#881337] font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer group"
                >
                  <Plus className="w-4 h-4 text-[#D4A017] group-hover:scale-125 transition" />
                  <span>+ Add Section / Block ({AVAILABLE_BLOCK_LIBRARY.length} Available)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DEDICATED THEME COLORS & FONTS ENGINE */}
          {activeTab === 'colors' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px]">
              <div>
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] block">
                  Palette Customization Engine
                </span>
                <p className="text-[10px] text-[#374151] mt-0.5">
                  Real-time color binding with interactive pickers and instant canvas hydration.
                </p>
              </div>

              {/* Individual Color Pickers */}
              <div className="space-y-2.5">
                {renderColorControl('1. Storefront Canvas Background', styles.backgroundColor, (v) =>
                  setStyles({ ...styles, backgroundColor: v })
                )}

                {renderColorControl('2. Announcement Bar Background', styles.announcementBg, (v) =>
                  setStyles({ ...styles, announcementBg: v })
                )}

                {renderColorControl('3. Announcement Bar Text', styles.announcementText, (v) =>
                  setStyles({ ...styles, announcementText: v })
                )}

                {renderColorControl('4. Primary Accent (Buttons & Badges)', styles.accentColor, (v) =>
                  setStyles({ ...styles, accentColor: v })
                )}

                {renderColorControl('5. Header & Nav Background', styles.headerBg, (v) =>
                  setStyles({ ...styles, headerBg: v })
                )}

                {renderColorControl('6. Product Cards Surface', styles.cardSurface, (v) =>
                  setStyles({ ...styles, cardSurface: v })
                )}

                {renderColorControl('7. Heading Text Color', styles.headingColor, (v) =>
                  setStyles({ ...styles, headingColor: v })
                )}

                {renderColorControl('8. Body & Subtitle Text Color', styles.textColor, (v) =>
                  setStyles({ ...styles, textColor: v })
                )}
              </div>

              {/* Typography & Fonts */}
              <div className="space-y-3 pt-3 border-t border-[#FBCBCB]">
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] block">
                  Typography & Radius Controls
                </span>

                <div className="space-y-1.5">
                  <label className="text-[#374151] font-semibold block">Heading Font Family</label>
                  <select
                    value={styles.headingFont}
                    onChange={(e) => setStyles({ ...styles, headingFont: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-bold"
                  >
                    <option value="Playfair Display">Playfair Display (Serif Luxe)</option>
                    <option value="Cinzel">Cinzel (Regal Classic)</option>
                    <option value="Fraunces">Fraunces (Editorial Serif)</option>
                    <option value="Archivo Black">Archivo Black (Bold Poster)</option>
                    <option value="Poppins">Poppins (Friendly Geometric)</option>
                    <option value="Work Sans">Work Sans (Quiet Neutral)</option>
                    <option value="Space Grotesk">Space Grotesk (Modern Sans)</option>
                    <option value="Outfit">Outfit (Crisp Geometric)</option>
                    <option value="Inter">Inter (Clean Neutral)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
                    {/* keep the theme's font selectable even if not listed above */}
                    {styles.headingFont && !['Playfair Display','Cinzel','Fraunces','Archivo Black','Poppins','Work Sans','Space Grotesk','Outfit','Inter','Plus Jakarta Sans'].includes(styles.headingFont) && (
                      <option value={styles.headingFont}>{styles.headingFont} (Active Theme Font)</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#374151] font-semibold block">Body Font Family</label>
                  <select
                    value={styles.bodyFont}
                    onChange={(e) => setStyles({ ...styles, bodyFont: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] font-bold"
                  >
                    <option value="Inter">Inter (Clean Neutral)</option>
                    <option value="Work Sans">Work Sans (Quiet Neutral)</option>
                    <option value="Poppins">Poppins (Friendly Geometric)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
                    <option value="Space Grotesk">Space Grotesk (Modern Sans)</option>
                    <option value="Outfit">Outfit (Crisp Geometric)</option>
                    <option value="Playfair Display">Playfair Display (Serif Luxe)</option>
                    <option value="Fraunces">Fraunces (Editorial Serif)</option>
                    {styles.bodyFont && !['Inter','Work Sans','Poppins','Plus Jakarta Sans','Space Grotesk','Outfit','Playfair Display','Fraunces'].includes(styles.bodyFont) && (
                      <option value={styles.bodyFont}>{styles.bodyFont} (Active Theme Font)</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#374151] font-semibold block">Button Corner Radius</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'rounded-full', label: 'Pill' },
                      { id: 'rounded-2xl', label: 'Curved (2xl)' },
                      { id: 'rounded-none', label: 'Square' }
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setStyles({ ...styles, buttonRadius: r.id })}
                        className={`py-1.5 rounded-xl font-bold border transition ${
                          styles.buttonRadius === r.id
                            ? 'bg-[#D4A017] text-white border-[#BE123C]'
                            : 'bg-white text-[#881337] border-[#FBCBCB]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 12 HARMONIOUS PALETTE PRESETS */}
          {activeTab === 'presets' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[11px]">
              <div>
                <span className="font-bold text-[#0F172A] uppercase tracking-wider text-[10px] block">
                  12 Cohesive Theme Presets
                </span>
                <p className="text-[10px] text-[#374151] mt-0.5">
                  Single-palette color harmonies without conflicting contrasts.
                </p>
              </div>

              <div className="space-y-2">
                {HARMONIOUS_THEME_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`p-3 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#fedddd] border-[#BE123C] shadow-xs'
                          : 'bg-white border-[#FBCBCB] hover:border-[#BE123C]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* 3-Color Swatch Pill */}
                          <div className="flex items-center -space-x-1">
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.backgroundColor }}
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.announcementBg }}
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: preset.accentColor }}
                            />
                          </div>
                          <span className="font-bold text-xs text-[#0F172A]">{preset.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A017]" />}
                      </div>
                      <p className="text-[10px] text-[#374151] mt-1 pl-7">{preset.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* CENTER LIVE STOREFRONT CANVAS */}
        <main className="flex-1 bg-white overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
          <div
            className={`transition-all duration-300 rounded-3xl overflow-hidden border shadow-xl min-h-[90vh] ${
              styles.cardBorder || 'border-[#FBCBCB]'
            } ${
              viewport === 'mobile'
                ? 'w-[380px] max-w-full'
                : viewport === 'desktop'
                ? 'w-[920px] max-w-full'
                : 'w-full'
            }`}
            style={{
              backgroundColor: styles.backgroundColor,
              color: styles.textColor,
              fontFamily: styles.bodyFont,
              fontSize: `${styles.baseFontSize}px`
            }}
          >
            {/* Render Storefront Blocks Sequentially with Direct Canvas Selection & Visual Inline Editing */}
            {sections.map((sec, secIdx) => {
              if (!sec.enabled) return null;
              const isSelected = expandedSectionId === sec.id;

              return (
                <div
                  key={sec.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSectionId(sec.id);
                    setActiveTab('blocks');
                  }}
                  className={`relative group transition cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#D4A017] shadow-md z-10'
                      : 'hover:ring-2 hover:ring-[#BE123C]/50'
                  }`}
                >
                  {/* Floating Action Badge on Canvas */}
                  <div
                    className={`absolute top-2 right-2 z-30 flex items-center gap-1 transition ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <span className="px-2.5 py-1 rounded-xl bg-[#D4A017] text-white text-[10px] font-bold shadow-lg flex items-center gap-1">
                      <span>✏️ {sec.name}</span>
                    </span>
                  </div>

                  {/* 1. Announcement Bar */}
                  {sec.type === 'announcement' && (
                    <div
                      className="py-2.5 px-4 text-center text-xs font-bold transition flex items-center justify-center gap-3"
                      style={{
                        backgroundColor: sec.data.overrideBg || styles.announcementBg,
                        color: sec.data.overrideText || styles.announcementText
                      }}
                    >
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updated = [...sections];
                          updated[secIdx].data.text = e.currentTarget.textContent;
                          setSections(updated);
                        }}
                        className="focus:outline-none focus:bg-white/20 px-1 rounded"
                      >
                        {sec.data.text}
                      </span>
                      {sec.data.linkText && (
                        <span className="underline opacity-90 hover:opacity-100 font-black">
                          {sec.data.linkText} →
                        </span>
                      )}
                    </div>
                  )}

                  {/* 2. Navigation Header */}
                  {sec.type === 'header' && (
                    <header
                      className="p-4 border-b flex items-center justify-between transition"
                      style={{
                        backgroundColor: styles.headerBg,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {sec.data.logoImg && (
                          <img
                            src={sec.data.logoImg}
                            alt="Brand Logo"
                            className="h-8 object-contain rounded-lg"
                          />
                        )}
                        <div>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const updated = [...sections];
                              updated[secIdx].data.logoText = e.currentTarget.textContent;
                              setSections(updated);
                            }}
                            className="font-bold text-sm tracking-wider block leading-tight focus:outline-none focus:bg-black/5 px-1 rounded"
                            style={{ fontFamily: styles.headingFont, color: styles.headingColor }}
                          >
                            {sec.data.logoText}
                          </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const updated = [...sections];
                              updated[secIdx].data.tagline = e.currentTarget.textContent;
                              setSections(updated);
                            }}
                            className="text-[9px] opacity-70 block focus:outline-none focus:bg-black/5 px-1 rounded"
                          >
                            {sec.data.tagline}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="hover:opacity-75">{sec.data.navLink1 || 'Collections'}</span>
                        <span className="hover:opacity-75">{sec.data.navLink2 || 'New Arrivals'}</span>
                        <span className="hover:opacity-75">{sec.data.navLink3 || 'Our Story'}</span>
                        <div
                          className="flex items-center gap-1 font-bold px-3 py-1 rounded-full text-white text-[11px] shadow-xs"
                          style={{ backgroundColor: styles.accentColor }}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> <span>Bag (2)</span>
                        </div>
                      </div>
                    </header>
                  )}

                  {/* 3. Hero Banner */}
                  {sec.type === 'hero' && (
                    <div
                      className="relative p-8 sm:p-12 overflow-hidden border-b flex flex-col justify-center min-h-[360px] transition"
                      style={{
                        backgroundColor: styles.surfaceColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="relative z-10 max-w-lg space-y-3.5">
                        {sec.data.badgeText && (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const updated = [...sections];
                              updated[secIdx].data.badgeText = e.currentTarget.textContent;
                              setSections(updated);
                            }}
                            className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white inline-block shadow-xs focus:outline-none"
                            style={{ backgroundColor: sec.data.overrideBadgeBg || styles.accentColor }}
                          >
                            {sec.data.badgeText}
                          </span>
                        )}
                        <h1
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const updated = [...sections];
                            updated[secIdx].data.headline = e.currentTarget.textContent;
                            setSections(updated);
                          }}
                          className="text-2xl sm:text-4xl font-black leading-tight focus:outline-none focus:bg-black/5 px-1 rounded"
                          style={{ fontFamily: styles.headingFont, color: styles.headingColor }}
                        >
                          {sec.data.headline}
                        </h1>
                        <p
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const updated = [...sections];
                            updated[secIdx].data.subtext = e.currentTarget.textContent;
                            setSections(updated);
                          }}
                          className="text-xs leading-relaxed opacity-90 focus:outline-none focus:bg-black/5 px-1 rounded"
                        >
                          {sec.data.subtext}
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <button
                            className={`px-6 py-2.5 font-bold text-xs shadow-xs transition ${styles.buttonRadius}`}
                            style={{
                              backgroundColor: sec.data.overrideCtaBg || styles.accentColor,
                              color: sec.data.overrideCtaText || '#ffffff'
                            }}
                          >
                            {sec.data.ctaText}
                          </button>
                          {sec.data.secondaryCtaText && (
                            <button
                              className={`px-5 py-2.5 font-bold text-xs border transition ${styles.buttonRadius}`}
                              style={{ borderColor: styles.accentColor, color: styles.headingColor }}
                            >
                              {sec.data.secondaryCtaText}
                            </button>
                          )}
                        </div>
                      </div>

                      {sec.data.imageUrl && (
                        <img
                          src={sec.data.imageUrl}
                          alt="Hero Banner"
                          className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-55 mix-blend-multiply pointer-events-none"
                        />
                      )}
                    </div>
                  )}

                  {/* 4. Featured Collection Ribbon */}
                  {sec.type === 'featured_ribbon' && (
                    <div
                      className="p-6 text-center space-y-1.5 border-b"
                      style={{
                        backgroundColor: styles.backgroundColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      {sec.data.badge && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider inline-block shadow-xs"
                          style={{ backgroundColor: styles.accentColor }}
                        >
                          {sec.data.badge}
                        </span>
                      )}
                      <h2
                        className="text-xl font-bold"
                        style={{ fontFamily: styles.headingFont, color: styles.headingColor }}
                      >
                        {sec.data.title}
                      </h2>
                      <p className="text-xs opacity-80">{sec.data.subtitle}</p>
                    </div>
                  )}

                  {/* 5. Product Grid */}
                  {sec.type === 'product_grid' && (
                    <div
                      className="p-6 sm:p-8 space-y-5 border-b"
                      style={{
                        backgroundColor: styles.surfaceColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className="text-base font-bold"
                          style={{ fontFamily: styles.headingFont, color: styles.headingColor }}
                        >
                          {sec.data.title}
                        </h3>
                        <span
                          className="text-xs font-semibold underline"
                          style={{ color: styles.accentColor }}
                        >
                          View All Items →
                        </span>
                      </div>

                      <div
                        className={`grid ${
                          sec.data.columns === 2
                            ? 'grid-cols-2'
                            : sec.data.columns === 4
                            ? 'grid-cols-2 sm:grid-cols-4'
                            : 'grid-cols-1 sm:grid-cols-3'
                        } gap-4`}
                      >
                        {products.slice(0, sec.data.columns || 3).map((prod) => {
                          const mainImg =
                            prod.imageUrl ||
                            (prod.images && prod.images[0]) ||
                            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';
                          const priceVal = Number(prod.sellingPriceINR || prod.price || 0);

                          return (
                            <div
                              key={prod.id}
                              className={`rounded-3xl p-3.5 space-y-2.5 shadow-xs hover:shadow-md transition border ${
                                styles.cardBorder || 'border-[#FBCBCB]'
                              }`}
                              style={{ backgroundColor: sec.data.overrideCardBg || styles.cardSurface }}
                            >
                              <img
                                src={mainImg}
                                alt={prod.name}
                                className="w-full aspect-square rounded-2xl object-cover"
                              />
                              <p
                                className="font-bold text-xs truncate"
                                style={{ color: styles.headingColor }}
                              >
                                {prod.name}
                              </p>
                              {sec.data.showPrice !== false && (
                                <p
                                  className="font-mono font-bold text-xs"
                                  style={{ color: styles.accentColor }}
                                >
                                  ₹{priceVal.toLocaleString('en-IN')}
                                </p>
                              )}
                              <button
                                className={`w-full py-2 text-[10px] font-bold text-white transition ${styles.buttonRadius}`}
                                style={{ backgroundColor: sec.data.overrideButtonBg || styles.accentColor }}
                              >
                                {sec.data.buttonLabel || 'Add to Bag'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 6. Promotional Banner */}
                  {sec.type === 'promo_banner' && (
                    <div
                      className="p-8 border-b text-center space-y-3 text-white transition"
                      style={{ backgroundColor: sec.data.overrideBg || styles.accentColor }}
                    >
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-widest">
                        {sec.data.badge}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black font-serif">
                        {sec.data.headline}
                      </h3>
                      <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-xs font-bold">
                        <span>Voucher:</span>
                        <span className="font-mono px-2 py-0.5 rounded-lg bg-white text-[#0F172A] font-black">
                          {sec.data.couponCode}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 max-w-sm mx-auto">{sec.data.subtext}</p>
                    </div>
                  )}

                  {/* 7. Video Reels */}
                  {sec.type === 'video_reels' && (
                    <div
                      className="p-6 border-b space-y-4"
                      style={{
                        backgroundColor: styles.backgroundColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="text-center space-y-1">
                        <h3
                          className="font-bold text-sm flex items-center justify-center gap-1.5"
                          style={{ fontFamily: styles.headingFont, color: styles.headingColor }}
                        >
                          <Film className="w-4 h-4" style={{ color: styles.accentColor }} />
                          {sec.data.title}
                        </h3>
                        <p className="text-xs opacity-75">{sec.data.subtitle}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          sec.data.reel1Img || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
                          sec.data.reel2Img || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
                          sec.data.reel3Img || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80'
                        ].map((img, i) => (
                          <div
                            key={i}
                            className="aspect-[9/14] rounded-2xl overflow-hidden relative shadow-xs border"
                            style={{ borderColor: styles.accentColor + '30' }}
                          >
                            <img src={img} alt="Reel" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[9px] font-bold">
                              ▶ Watch Reel
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Testimonials */}
                  {sec.type === 'testimonials' && (
                    <div
                      className="p-8 text-center space-y-3 border-b"
                      style={{
                        backgroundColor: styles.surfaceColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <p className="font-bold text-sm" style={{ color: styles.accentColor }}>
                        {sec.data.rating}
                      </p>
                      <h3
                        className="font-bold text-base font-serif"
                        style={{ color: styles.headingColor }}
                      >
                        {sec.data.title}
                      </h3>
                      <p className="text-xs italic opacity-90 max-w-md mx-auto">{sec.data.quote}</p>
                      <p className="text-[11px] font-bold" style={{ color: styles.accentColor }}>
                        — {sec.data.author} ({sec.data.badge})
                      </p>
                    </div>
                  )}

                  {/* Trust Badges */}
                  {sec.type === 'badges' && (
                    <div
                      className="p-6 border-b"
                      style={{
                        backgroundColor: styles.backgroundColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-2xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
                          <Shield className="w-5 h-5 mx-auto text-[#D4A017]" />
                          <p className="font-bold text-[11px]" style={{ color: styles.headingColor }}>{sec.data.badge1Title || '0% Platform Fee'}</p>
                          <p className="text-[9px] opacity-75">{sec.data.badge1Desc || 'Direct pricing'}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
                          <CheckCircle2 className="w-5 h-5 mx-auto text-[#D4A017]" />
                          <p className="font-bold text-[11px]" style={{ color: styles.headingColor }}>{sec.data.badge2Title || '100% Authentic'}</p>
                          <p className="text-[9px] opacity-75">{sec.data.badge2Desc || 'Genuine guarantee'}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
                          <Zap className="w-5 h-5 mx-auto text-[#D4A017]" />
                          <p className="font-bold text-[11px]" style={{ color: styles.headingColor }}>{sec.data.badge3Title || 'Insured Delivery'}</p>
                          <p className="text-[9px] opacity-75">{sec.data.badge3Desc || 'Fast dispatch'}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-[#FBCBCB] space-y-1 shadow-xs">
                          <Sparkles className="w-5 h-5 mx-auto text-[#D4A017]" />
                          <p className="font-bold text-[11px]" style={{ color: styles.headingColor }}>{sec.data.badge4Title || 'Handcrafted'}</p>
                          <p className="text-[9px] opacity-75">{sec.data.badge4Desc || 'Master artisan pieces'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Brand Story */}
                  {sec.type === 'story' && (
                    <div
                      className="p-8 border-b"
                      style={{
                        backgroundColor: styles.surfaceColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        <div className="sm:col-span-7 space-y-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider inline-block shadow-xs" style={{ backgroundColor: styles.accentColor }}>
                            {sec.data.badge || 'Heritage'}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold font-serif" style={{ color: styles.headingColor }}>
                            {sec.data.headline || 'Crafted with Integrity'}
                          </h3>
                          <p className="text-xs leading-relaxed opacity-90">{sec.data.storyText}</p>
                          <div className="pt-2 border-t border-black/5">
                            <span className="font-bold text-xs block" style={{ color: styles.headingColor }}>{sec.data.founderName || 'Founder & Master Artisan'}</span>
                            <span className="text-[10px] opacity-70">{sec.data.founderRole || 'Curator'}</span>
                          </div>
                        </div>
                        <div className="sm:col-span-5">
                          <img
                            src={sec.data.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'}
                            alt="Studio Story"
                            className="w-full aspect-[4/3] rounded-2xl object-cover shadow-md border"
                            style={{ borderColor: styles.accentColor + '30' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FAQ Accordion */}
                  {sec.type === 'faq' && (
                    <div
                      className="p-6 sm:p-8 border-b space-y-4"
                      style={{
                        backgroundColor: styles.backgroundColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="text-center space-y-1">
                        <h3 className="text-base sm:text-lg font-bold font-serif" style={{ color: styles.headingColor }}>
                          {sec.data.title || 'Frequently Asked Questions'}
                        </h3>
                        <p className="text-xs opacity-75">{sec.data.subtitle}</p>
                      </div>
                      <div className="space-y-2 max-w-xl mx-auto">
                        <div className="p-3 rounded-xl bg-white border border-[#FBCBCB] space-y-1">
                          <p className="font-bold text-xs" style={{ color: styles.headingColor }}>Q: {sec.data.q1 || 'Shipping timeframe?'}</p>
                          <p className="text-[11px] opacity-80">{sec.data.a1}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#FBCBCB] space-y-1">
                          <p className="font-bold text-xs" style={{ color: styles.headingColor }}>Q: {sec.data.q2 || 'Return policy?'}</p>
                          <p className="text-[11px] opacity-80">{sec.data.a2}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#FBCBCB] space-y-1">
                          <p className="font-bold text-xs" style={{ color: styles.headingColor }}>Q: {sec.data.q3 || 'Authenticity guarantee?'}</p>
                          <p className="text-[11px] opacity-80">{sec.data.a3}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIP Newsletter */}
                  {sec.type === 'newsletter' && (
                    <div
                      className="p-8 border-b text-center space-y-3"
                      style={{
                        backgroundColor: styles.surfaceColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <Sparkles className="w-6 h-6 mx-auto text-[#D4A017]" />
                      <h3 className="text-xl font-bold font-serif" style={{ color: styles.headingColor }}>
                        {sec.data.headline || 'Join the Connoisseur Circle'}
                      </h3>
                      <p className="text-xs opacity-80 max-w-md mx-auto">{sec.data.subtext}</p>
                      <div className="flex items-center gap-2 max-w-md mx-auto pt-1">
                        <input
                          type="email"
                          placeholder={sec.data.placeholder || 'Enter your email...'}
                          className="flex-1 px-3 py-2 bg-white border border-[#FBCBCB] rounded-xl text-xs"
                        />
                        <button
                          className={`px-4 py-2 text-xs font-bold text-white shadow-xs ${styles.buttonRadius}`}
                          style={{ backgroundColor: styles.accentColor }}
                        >
                          {sec.data.buttonText || 'Subscribe'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Instagram Gallery Feed */}
                  {sec.type === 'instagram_feed' && (
                    <div
                      className="p-6 border-b space-y-4"
                      style={{
                        backgroundColor: styles.backgroundColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="text-center space-y-1">
                        <h3 className="text-base font-bold font-serif" style={{ color: styles.headingColor }}>
                          {sec.data.title || 'Follow Our Instagram'}
                        </h3>
                        <p className="text-xs font-mono font-bold" style={{ color: styles.accentColor }}>{sec.data.handle}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
                          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
                          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
                          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80'
                        ].map((img, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-xs border border-[#FBCBCB]">
                            <img src={img} alt="Insta" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physical Boutique / Atelier Location */}
                  {sec.type === 'store_location' && (
                    <div
                      className="p-6 border-b"
                      style={{
                        backgroundColor: styles.surfaceColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <div className="max-w-md mx-auto text-center space-y-2">
                        <Compass className="w-6 h-6 mx-auto text-[#D4A017]" />
                        <h3 className="text-base font-bold font-serif" style={{ color: styles.headingColor }}>
                          {sec.data.title || 'Visit Our Atelier'}
                        </h3>
                        <p className="text-xs font-medium">{sec.data.address}</p>
                        <p className="text-[11px] opacity-75">{sec.data.hours}</p>
                        <p className="text-[11px] font-mono font-bold text-[#D4A017]">{sec.data.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  {sec.type === 'footer' && (
                    <footer
                      className="p-6 text-center text-[10px] space-y-1 border-t"
                      style={{
                        backgroundColor: styles.surfaceColor,
                        color: styles.textColor,
                        borderColor: styles.accentColor + '20'
                      }}
                    >
                      <p>
                        {sec.data.copyrightText ||
                          `© ${new Date().getFullYear()} ${currentStore?.name}. All rights reserved.`}
                      </p>
                      <p className="opacity-70">
                        {sec.data.tagline || 'Direct D2C Boutique Powered by Go Julex'}
                      </p>
                    </footer>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* 3. ADD BLOCK / SECTION LIBRARY MODAL */}
      {isAddBlockOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddBlockOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#FBCBCB] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up z-10">
            {/* Header */}
            <div className="p-5 border-b border-[#FBCBCB] bg-[#fedddd] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4A017] text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#0F172A] font-serif">
                    Storefront Section Library
                  </h2>
                  <p className="text-xs text-[#374151]">
                    Choose from {AVAILABLE_BLOCK_LIBRARY.length} high-converting modular blocks to enrich your storefront.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBlockOpen(false)}
                className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-[#0F172A] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="p-3 border-b border-[#FBCBCB] bg-white flex items-center gap-1.5 overflow-x-auto text-xs">
              {['All', 'Conversions & Alerts', 'Commerce', 'Storytelling', 'Social Proof', 'Navigation', 'Media & Social', 'Support & FAQs'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBlockCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    blockCategoryFilter === cat
                      ? 'bg-[#D4A017] text-white shadow-xs'
                      : 'bg-[#fedddd] text-[#881337] hover:bg-[#FEE2E2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Blocks Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVAILABLE_BLOCK_LIBRARY.filter(b => blockCategoryFilter === 'All' || b.category === blockCategoryFilter).map((blueprint) => {
                const IconComp = blueprint.icon || Layers;
                return (
                  <div
                    key={blueprint.type}
                    className="p-4 rounded-2xl border border-[#FBCBCB] hover:border-[#D4A017] bg-white hover:bg-[#FFF5F5] transition flex flex-col justify-between space-y-3 group shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#D4A017]">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#fedddd] text-[#881337]">
                          {blueprint.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#0F172A] pt-1">
                        {blueprint.name}
                      </h4>
                      <p className="text-[11px] text-[#475569] leading-relaxed">
                        {blueprint.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddBlock(blueprint)}
                      className="w-full py-2 rounded-xl bg-[#D4A017] hover:bg-[#881337] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Insert Section
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
