// ============================================================================
// STOREFRONT DARK DOM PASS — the catch-all visibility guarantee.
//
// deriveDarkStyles() flips the theme's palette fields, but theme section
// templates also contain HARDCODED literal colors (e.g. color: '#111111' on
// prices). Those survive into dark mode as black-on-black. CSS cannot
// override inline styles selectively, so this pass inspects the RENDERED
// storefront: any text whose effective background makes it illegible is
// flipped to the readable side, and neutral light surfaces (white/cream
// cards) are deepened. Brand-colored accents are detected by saturation and
// left untouched. Idempotent — safe to re-run; original inline values are
// captured once and restored when the visitor switches back to light.
// ============================================================================

const parse = (value) => {
  const m = String(value || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
};

const wcagLum = ({ r, g, b }) => {
  const f = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrast = (a, b) => {
  const l1 = wcagLum(a), l2 = wcagLum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

const toHsl = ({ r, g, b }) => {
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

const hslCss = (h, s, l) => `hsl(${((h % 360) + 360) % 360}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

// Composite rgba `top` over opaque `bottom`.
const composite = (top, bottom) => {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1
  };
};

const orig = new WeakMap(); // el -> { bg, color, border } ORIGINAL inline values

const remember = (el, prop) => {
  let rec = orig.get(el);
  if (!rec) { rec = {}; orig.set(el, rec); }
  if (!(prop in rec)) rec[prop] = el.style[prop];
};

// Deepen a neutral light surface (white/cream/gray card) into a dark one,
// keeping a whisper of its hue. Saturated colors are brand accents — kept.
const darkenSurface = (cssColor) => {
  const c = parse(cssColor);
  if (!c || c.a === 0) return null;
  const [h, s, l] = toHsl(c);
  if (l <= 0.5 || s > 0.35) return null; // already dark or a brand color
  return hslCss(h, Math.min(s, 0.14), 0.15);
};

export const applyDarkContrast = (root, { darkInk = '#14100E', lightText = '#ECE9E4' } = {}) => {
  if (!root) return () => {};
  const ink = parse(darkInk);
  const light = parse(lightText);

  const enforce = () => {
    const rootBg = parse(getComputedStyle(root).backgroundColor) || { r: 16, g: 20, b: 16, a: 1 };
    const walk = (el, inheritedBg) => {
      const cs = getComputedStyle(el);
      let bg = inheritedBg;

      // 1. Own background: deepen neutral light surfaces.
      const ownBg = parse(cs.backgroundColor);
      if (ownBg && ownBg.a > 0) {
        const effective = ownBg.a < 1 ? composite(ownBg, inheritedBg) : ownBg;
        const darker = darkenSurface(cs.backgroundColor);
        if (darker) {
          remember(el, 'backgroundColor');
          el.style.backgroundColor = darker;
          bg = parse(darker);
        } else {
          bg = effective;
        }
      }

      // 2. Neutral light borders -> dark borders (saturated ones kept).
      const ownBorder = parse(cs.borderTopColor);
      if (ownBorder && ownBorder.a > 0) {
        const darkerBorder = darkenSurface(cs.borderTopColor);
        if (darkerBorder) {
          remember(el, 'borderColor');
          el.style.borderColor = darkerBorder;
        }
      }

      // 3. Text: flip whenever illegible against the effective background.
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText && cs.backgroundImage === 'none') {
        const fg = parse(cs.color);
        if (fg) {
          const c = contrast(fg, bg);
          if (c < 4.5) {
            const viaLight = contrast(light, bg);
            const viaInk = contrast(ink, bg);
            remember(el, 'color');
            el.style.color = viaLight >= viaInk
              ? (viaLight >= 4.5 ? lightText : '#FFFFFF')
              : (viaInk >= 4.5 ? darkInk : '#000000');
          }
        }
      }

      for (const child of el.children) walk(child, bg);
    };
    walk(root, rootBg);
  };

  enforce();

  // React re-renders (drawer opens, cart updates) recreate nodes with the
  // original literals — re-enforce, debounced. Idempotent, so re-runs are
  // cheap and never fight themselves.
  let timer = null;
  const schedule = () => {
    if (timer) return;
    timer = setTimeout(() => { timer = null; enforce(); }, 150);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

  return () => {
    observer.disconnect();
    if (timer) { clearTimeout(timer); timer = null; }
    // Restore every inline value we touched.
    const walkRestore = (el) => {
      const rec = orig.get(el);
      if (rec) {
        for (const [prop, value] of Object.entries(rec)) el.style[prop] = value;
      }
      for (const child of el.children) walkRestore(child);
    };
    walkRestore(root);
  };
};
