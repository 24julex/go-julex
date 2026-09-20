// ============================================================================
// STOREFRONT DARK MODE — automatic dark-palette derivation for EVERY theme.
// Each published theme keeps its hue identity; only lightness is re-targeted
// so text always stays visible on the flipped surfaces. No per-theme
// hand-tuning: any existing or future theme gets a readable dark mode.
// ============================================================================

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const hexToRgb = (hex) => {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // drop alpha (e.g. #FFFFFFF5)
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, l];
};

const hueToRgb = (p, q, t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

const hslToHex = (h, s, l) => {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return `#${[v, v, v].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const rgb = [hueToRgb(p, q, h + 1 / 3), hueToRgb(p, q, h), hueToRgb(p, q, h - 1 / 3)]
    .map((x) => Math.round(x * 255).toString(16).padStart(2, '0'));
  return `#${rgb.join('')}`;
};

// Re-target lightness while keeping hue (and taming saturation so large dark
// surfaces don't glow). The identity of the theme survives the flip.
const shift = (hex, targetL, { satScale = 1, satMax = 0.55 } = {}) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [h, s, l] = rgbToHsl(...rgb);
  // Already near the target side of the scale — keep it (e.g. a theme with a
  // naturally dark surface shouldn't be lightened in dark mode).
  const ns = Math.min(satMax, s * satScale);
  return hslToHex(h, ns, clamp(targetL(l), 0, 1));
};

// Surface roles: page bg deepest, then header, surface, cards, announcement.
// Text roles: headings brightest, body slightly softer, announcements clear.
// Accent: clamped into a mid band that stays punchy on dark AND keeps white
// button labels readable.
const DARK_FIELD_RULES = {
  backgroundColor: { l: (l) => (l < 0.22 ? l : 0.07), satScale: 0.9 },
  headerBg: { l: (l) => (l < 0.22 ? l : 0.10), satScale: 0.9 },
  surfaceColor: { l: (l) => (l < 0.22 ? l : 0.12), satScale: 0.85 },
  cardSurface: { l: (l) => (l < 0.25 ? l + 0.04 : 0.16), satScale: 0.8 },
  announcementBg: { l: (l) => (l < 0.25 ? l : 0.18), satScale: 0.8 },
  announcementText: { l: (l) => (l > 0.78 ? l : 0.92), satScale: 0.7 },
  textColor: { l: (l) => (l > 0.8 ? l : 0.84), satScale: 0.6 },
  headingColor: { l: (l) => (l > 0.85 ? l : 0.93), satScale: 0.65 },
  accentColor: { l: (l) => clamp(l, 0.58, 0.68), satScale: 1, satMax: 0.75 }
};

export const deriveDarkStyles = (styles) => {
  if (!styles || typeof styles !== 'object') return styles;
  const out = { ...styles };
  for (const [field, rule] of Object.entries(DARK_FIELD_RULES)) {
    if (typeof styles[field] === 'string' && styles[field].startsWith('#')) {
      const shifted = shift(styles[field], rule.l, { satScale: rule.satScale, satMax: rule.satMax });
      if (shifted) out[field] = shifted;
    }
  }
  return out;
};

// Black-or-white text choice for a given background (WCAG-ish luminance).
export const readableInk = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#FFFFFF';
  const [r, g, b] = rgb.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.35 ? '#1E293B' : '#FFFFFF';
};

export const STOREFRONT_MODE_KEY = 'jx_storefront_mode';
export const STOREFRONT_MODE_EVENT = 'jx-mode-change';
export const readStorefrontMode = () => {
  try { return localStorage.getItem(STOREFRONT_MODE_KEY) === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; }
};
