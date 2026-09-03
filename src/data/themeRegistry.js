// ============================================================
// GO JULEX — SINGLE SOURCE OF TRUTH FOR STOREFRONT THEMES
// Both the Merchant console (Channels → Themes) and the Super
// Admin master themes page derive their catalogs from this
// registry, which is generated from HARMONIOUS_THEME_PRESETS.
// Adding a new preset in AdminThemeBuilder automatically makes
// it appear in BOTH dashboards.
// ============================================================
import { HARMONIOUS_THEME_PRESETS } from '../pages/admin/channels/AdminThemeBuilder';

// Extra gallery metadata for themes (thumbnails, category labels).
// Entries without metadata get sensible auto-generated values.
const THEME_META = {
  preset_playful_pop: {
    aesthetic: 'Youth Fashion & Streetwear',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    featureTags: ['🎈 Sticker Badges', '☀️ Sunshine Yellow CTAs', '✏️ Marker Highlights', '📸 Polaroid Hero']
  },
  preset_editorial_boutique: {
    aesthetic: 'Premium Fashion Lookbook',
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    featureTags: ['🏛 Editorial Split Hero', '🧵 Hairline Lookbook Cards', '🍂 Terracotta Accents', '📜 Serif Display Type']
  },
  preset_quiet_luxe: {
    aesthetic: 'Considered Essentials & Boutique',
    thumbnail: 'https://images.unsplash.com/photo-1539515098-509892447af2?auto=format&fit=crop&w=600&q=80',
    featureTags: ['🕯 Fraunces Serif Italics', '🌿 Moss & Rust Accents', '📄 Warm Paper Canvas', '🎴 Hairline Lookbook Grid']
  },
  preset_markly_luxe: {
    aesthetic: 'Editorial Luxury Minimal',
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    featureTags: ['-monimal Square Layouts', '-newsletter Capture Hero', '-grayscale Photography', '-cognac Leather Accent']
  },
  preset_editorial_zine: {
    aesthetic: 'Editorial Magazine & Zine',
    thumbnail: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
    featureTags: ['✦ Oversized Mixed-Cap Serif', '🌿 Sage Arch Blocks', '⚫ Floating Pill Nav', '🎨 Multi-Color Collage Tiles']
  },
  preset_soft_peach: {
    aesthetic: 'Luxury & Haute Couture',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    featureTags: ['✨ Haute Atelier Layout', '⚡ Fast Checkout', '📱 Mobile Optimized', '🎨 100% Drag & Drop']
  }
};

const stripEmoji = (name) => name.replace(/^[^\w(]+/, '').trim();

const presetToMarketplaceEntry = (preset, index) => {
  const meta = THEME_META[preset.id] || {};
  return {
    id: `theme_${preset.id.replace('preset_', '')}`,
    presetId: preset.id,
    name: stripEmoji(preset.name),
    aesthetic: meta.aesthetic || 'Storefront Preset',
    vibe: preset.desc,
    version: 'v1.0.0',
    isDefaultActive: index === 0,
    thumbnail:
      meta.thumbnail ||
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    description: preset.desc,
    featureTags: meta.featureTags || ['🎨 Preset Styling', '📱 Mobile Optimized', '⚡ Fast Checkout']
  };
};

// Merchant console theme gallery (Channels → Online Store → Themes)
export const THEME_MARKETPLACE = HARMONIOUS_THEME_PRESETS.map(presetToMarketplaceEntry);

// Super Admin master themes catalog (shape used by /super-admin/themes)
export const MASTER_THEME_CATALOG = HARMONIOUS_THEME_PRESETS.map((p, index) => {
  const entry = presetToMarketplaceEntry(p, index);
  return {
    id: p.id,
    name: entry.name,
    slug: p.id.replace('preset_', '').replace(/_/g, '-'),
    vertical: entry.aesthetic,
    category: entry.aesthetic,
    version: entry.version,
    tierAccess: 'free',
    priceINR: 0,
    isPublished: true,
    thumbnail: entry.thumbnail,
    tagline: p.desc,
    tokens: {
      headingFont: p.headingFont,
      bodyFont: p.bodyFont,
      primaryAccent: p.accentColor,
      backgroundColor: p.backgroundColor,
      surfaceColor: p.surfaceColor,
      headingColor: p.headingColor,
      buttonRadius: p.buttonRadius
    }
  };
});
