import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Palette,
  Sliders,
  Sparkles,
  ChevronDown,
  Layers,
  Eye,
  ShoppingBag,
  Copy,
  RotateCcw,
  Store,
  Smartphone,
  Laptop,
  X
} from 'lucide-react';
import { useMerchantAdmin } from '../../../context/MerchantAdminContext';
import { HARMONIOUS_THEME_PRESETS } from './AdminThemeBuilder';
import { THEME_MARKETPLACE as THEME_MARKETPLACE_12, THEME_META } from '../../../data/themeRegistry';
import { ThemePreviewModal } from '../../../components/common/ThemePreviewModal';
import { api } from '../../../services/api';


export const ThemeStorefrontPreview = ({ theme, isLarge = false }) => {
  const preset = HARMONIOUS_THEME_PRESETS.find((p) => p.id === theme.presetId) || HARMONIOUS_THEME_PRESETS[0];
  const layoutStyle = preset.layoutStyle || 'haute_atelier';
  const themeMeta = THEME_META[theme.presetId] || THEME_META[preset.id] || {};
  const productsList = (theme.products && theme.products.length > 0 ? theme.products : themeMeta.products) || [
    { name: theme.name + ' Item A', price: 2490, image: theme.thumbnail, tag: 'Popular' },
    { name: theme.name + ' Item B', price: 4890, image: theme.thumbnail, tag: 'New' }
  ];

  return (
    <div
      className="w-full h-full select-none flex flex-col font-sans transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: preset.backgroundColor, color: preset.textColor }}
    >
      {/* Top Browser Bar */}
      <div className="h-4 sm:h-5 px-2 bg-black/10 border-b border-black/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        </div>
        <div className="px-2 py-0.2 rounded bg-white/70 text-[7px] font-mono truncate max-w-[140px]" style={{ color: '#111' }}>
          store.gojulex.com
        </div>
        <div className="w-4" />
      </div>

      {/* Dynamic Announcement Bar */}
      <div
        className={`py-1 px-2 text-center text-[7px] sm:text-[8px] font-bold truncate shrink-0 tracking-tight ${
          layoutStyle === 'editions_hyper' ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-mono tracking-widest uppercase' : layoutStyle === 'modern_editorial' ? 'uppercase font-mono tracking-widest' : ''
        }`}
        style={{ backgroundColor: preset.announcementBg, color: preset.announcementText }}
      >
        {layoutStyle === 'editions_hyper' && '⚡ SHOPIFY EDITIONS KINETIC RELEASE • 150+ MOTION UPDATES • 0% FEE'}
        {layoutStyle === 'organic_pantry' && '🌿 100% Certified Organic Millets & Foods • Express Shipping'}
        {layoutStyle === 'haute_atelier' && '✨ Haute Atelier • Free Express Delivery • 100% Authentic'}
        {layoutStyle === 'modern_editorial' && '⚡ EDITORIAL RELEASE • 0% COMMISSION D2C • EXPRESS SHIPPING'}
        {layoutStyle === 'organic_artisan' && '🌱 Certified 100% Handcrafted Harvest • Direct Studio'}
        {layoutStyle === 'neo_tech' && '🔮 NEON ENGINE LIVE • INSTANT DIRECT CHECKOUT'}
      </div>

      {/* Dynamic Header */}
      <div
        className={`py-1.5 px-3 border-b flex items-center justify-between shrink-0 ${
          layoutStyle === 'haute_atelier' ? 'justify-center flex-col gap-0.5' : ''
        }`}
        style={{ backgroundColor: preset.headerBg, borderColor: preset.accentColor + '25' }}
      >
        <span
          className={`font-bold text-[9px] sm:text-[10px] tracking-tight truncate max-w-[130px] ${
            layoutStyle === 'modern_editorial' ? 'uppercase tracking-widest font-black' : ''
          }`}
          style={{ fontFamily: preset.headingFont, color: preset.headingColor }}
        >
          {themeMeta.brandName || theme.name.split(' ')[0]}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] font-medium hidden sm:inline" style={{ color: preset.textColor }}>Collection</span>
          <span className="text-[7px] font-medium hidden sm:inline" style={{ color: preset.textColor }}>Deals</span>
          <span
            className={`px-1.5 py-0.5 text-white text-[7px] font-bold shadow-2xs ${
              layoutStyle === 'organic_pantry' ? 'rounded-full bg-emerald-700' : layoutStyle === 'organic_artisan' ? 'rounded-full' : layoutStyle === 'modern_editorial' ? 'rounded-none' : 'rounded-lg'
            }`}
            style={{ backgroundColor: preset.accentColor }}
          >
            Bag (2)
          </span>
        </div>
      </div>

      {/* Dynamic Hero Banner with High-Res Vertical Photography */}
      <div
        className="p-2.5 sm:p-3 border-b flex flex-col justify-center space-y-1 relative overflow-hidden shrink-0 h-16 sm:h-20"
        style={{ backgroundColor: preset.surfaceColor, borderColor: preset.accentColor + '20' }}
      >
        <img
          src={theme.thumbnail || themeMeta.thumbnail}
          alt={theme.name}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10">
          <span
            className={`px-1.5 py-0.2 text-[6px] sm:text-[7px] font-bold text-white uppercase tracking-wider inline-block ${
              layoutStyle === 'organic_pantry' ? 'rounded-full bg-emerald-800' : layoutStyle === 'organic_artisan' ? 'rounded-full' : layoutStyle === 'modern_editorial' ? 'rounded-none font-mono' : 'rounded-md'
            }`}
            style={{ backgroundColor: preset.accentColor }}
          >
            Curated Showcase
          </span>
          <p className="font-bold text-[9px] sm:text-[10px] truncate" style={{ fontFamily: preset.headingFont, color: preset.headingColor }}>
            {theme.name}
          </p>
        </div>
      </div>

      {/* Dynamic Topic-Specific Product Cards */}
      <div className="p-2 flex-1 overflow-hidden grid grid-cols-2 gap-1.5">
        {productsList.slice(0, 2).map((item, idx) => (
          <div
            key={idx}
            className={`p-1.5 border space-y-1 shadow-2xs ${
              layoutStyle === 'organic_pantry' || layoutStyle === 'organic_artisan' ? 'rounded-2xl' : layoutStyle === 'modern_editorial' ? 'rounded-none' : 'rounded-xl'
            } ${preset.cardBorder || 'border-black/5'}`}
            style={{ backgroundColor: preset.cardSurface }}
          >
            <div className={`w-full aspect-[4/3] bg-black/5 overflow-hidden relative ${
              layoutStyle === 'organic_pantry' || layoutStyle === 'organic_artisan' ? 'rounded-xl' : layoutStyle === 'modern_editorial' ? 'rounded-none' : 'rounded-lg'
            }`}>
              <img
                src={item.image || theme.thumbnail}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.tag && (
                <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[5px] font-bold text-white shadow-xs" style={{ backgroundColor: preset.accentColor }}>
                  {item.tag}
                </span>
              )}
            </div>
            <p className="font-bold text-[7px] sm:text-[8px] truncate" style={{ color: preset.headingColor }}>{item.name}</p>
            <div className="flex items-center justify-between">
              <p className="font-mono font-bold text-[7px] sm:text-[8px]" style={{ color: preset.accentColor }}>₹{item.price?.toLocaleString('en-IN')}</p>
              <span className="text-[5px] px-1 bg-black/5 rounded font-bold" style={{ color: preset.textColor }}>In Stock</span>
            </div>
          </div>
        ))}
      </div>

      {/* Palette Strip & Layout Tag */}
      <div className="py-1 px-2.5 bg-black/5 border-t border-black/5 flex items-center justify-between shrink-0">
        <span className="text-[6px] sm:text-[7px] font-bold uppercase tracking-wider opacity-80" style={{ color: preset.accentColor }}>
          {layoutStyle === 'organic_pantry' && '🌿 Organic Pantry'}
          {layoutStyle === 'haute_atelier' && '✨ Haute Atelier'}
          {layoutStyle === 'modern_editorial' && '⚡ Editorial Grid'}
          {layoutStyle === 'organic_artisan' && '☕ Minimal Warm'}
          {layoutStyle === 'neo_tech' && '🔮 Neo-Tech'}
        </span>
        <div className="flex items-center -space-x-1">
          <span className="w-3 h-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: preset.backgroundColor }} title="Canvas Bg" />
          <span className="w-3 h-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: preset.surfaceColor }} title="Surface" />
          <span className="w-3 h-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: preset.accentColor }} title="Accent" />
          <span className="w-3 h-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: preset.headingColor }} title="Heading" />
        </div>
      </div>
    </div>
  );
};

export const AdminThemes = () => {
  const { currentStore, showToast } = useMerchantAdmin();
  const navigate = useNavigate();

  const cleanSubdomain = (currentStore?.subdomain || 'auraliving').toLowerCase().replace(/\.gojulex\.com$/, '');

  // Super-admin template customizations from the BACKEND — the same source
  // the super admin portal writes to, so edits/deletions reflect here too.
  const [catalogOverrides, setCatalogOverrides] = useState({});
  const [catalogDeleted, setCatalogDeleted] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.themes.getOverrides()
      .then((res) => {
        if (cancelled || !res?.success || !Array.isArray(res.data)) return;
        const ovMap = {};
        const del = [];
        res.data.forEach((o) => {
          if (o.deleted) { del.push(o.id); return; }
          const { id: oid, deleted: _d, updatedAt: _u, ...fields } = o;
          const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== null && v !== ''));
          if (Object.keys(clean).length > 0) ovMap[oid] = clean;
        });
        setCatalogOverrides(ovMap);
        setCatalogDeleted(del);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const savedActiveId = localStorage.getItem(`gojulex_store_active_theme_${currentStore?.id}`) ||
                            localStorage.getItem(`gojulex_store_active_theme_${cleanSubdomain}`);
      if (savedActiveId) {
        const found = THEME_MARKETPLACE_12.find((t) => t.id === savedActiveId || t.presetId === savedActiveId);
        if (found) return found;
      }
      const rawTheme = localStorage.getItem(`gojulex_store_theme_${currentStore?.id}`) ||
                       localStorage.getItem(`gojulex_store_theme_${cleanSubdomain}`);
      if (rawTheme) {
        const parsed = JSON.parse(rawTheme);
        const found = THEME_MARKETPLACE_12.find((t) => t.presetId === parsed.presetId || t.id === parsed.presetId);
        if (found) return found;
      }
    } catch (e) {}
    return THEME_MARKETPLACE_12[0];
  });

  const [aestheticFilter, setAestheticFilter] = useState('All Styles');
  const [demoModalTheme, setDemoModalTheme] = useState(null);
  const [previewViewport, setPreviewViewport] = useState('desktop');
  const [actionsOpen, setActionsOpen] = useState(false);

  const aestheticCategories = [
    'All Styles',
    'Warm & Pastel',
    'Luxury & Dark',
    'Minimalist'
  ];

  const filteredThemes = THEME_MARKETPLACE_12
    .filter((t) => !catalogDeleted.includes(t.presetId))
    .map((t) => {
      const ov = catalogOverrides[t.presetId];
      if (!ov) return t;
      return {
        ...t,
        name: ov.name || t.name,
        aesthetic: ov.vertical || t.aesthetic,
        vibe: ov.tagline || t.vibe,
        description: ov.tagline || t.description
      };
    })
    .filter((t) => {
      if (aestheticFilter === 'All Styles') return true;
      return t.aesthetic === aestheticFilter;
    });

  const handleApplyTheme = (theme, redirect = false) => {
    const presetStyles = HARMONIOUS_THEME_PRESETS.find((p) => p.id === theme.presetId) || HARMONIOUS_THEME_PRESETS[0];

    let currentThemeObj = null;
    try {
      const raw = localStorage.getItem(`gojulex_store_theme_${currentStore?.id}`) ||
                  localStorage.getItem(`gojulex_store_theme_${cleanSubdomain}`);
      if (raw) currentThemeObj = JSON.parse(raw);
    } catch (e) {}

    const newThemePayload = {
      presetId: theme.presetId,
      styles: {
        ...presetStyles,
        presetId: theme.presetId
      },
      sections: currentThemeObj?.sections || [],
      updatedAt: new Date().toISOString()
    };

    if (currentStore?.id) {
      localStorage.setItem(`gojulex_store_theme_${currentStore.id}`, JSON.stringify(newThemePayload));
      localStorage.setItem(`gojulex_store_active_theme_${currentStore.id}`, theme.id);
    }
    localStorage.setItem(`gojulex_store_theme_${cleanSubdomain}`, JSON.stringify(newThemePayload));
    localStorage.setItem(`gojulex_store_active_theme_${cleanSubdomain}`, theme.id);

    setActiveTheme(theme);
    showToast(`"${theme.name}" applied & published live to your storefront! 🚀`, 'success');

    if (redirect) {
      navigate('/admin/themes/builder');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif tracking-tight flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <Palette className="w-6 h-6" style={{ color: 'var(--accent)' }} /> Store Themes & Visual Customizer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {THEME_MARKETPLACE_12.length} Cohesive Presets
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Visual storefront previews: Choose any unified color harmony and customize every block with our Visual Customizer.
          </p>
        </div>

        <Link
          to="/admin/channels/online-store/themes/builder"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition transform active:scale-95 whitespace-nowrap text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
        >
          <Sliders className="w-4 h-4 stroke-[3]" /> Open Visual Customizer
        </Link>
      </div>

      {/* 2. Current Active Theme Hero Card */}
      <div className="p-6 rounded-3xl border space-y-6 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Current Live Active Theme
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Last published: <strong style={{ color: 'var(--text-primary)' }}>Active on Storefront</strong>
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative w-64 sm:w-72 h-44 rounded-2xl overflow-hidden border shrink-0 shadow-md group" style={{ borderColor: 'var(--border-card)' }}>
              <ThemeStorefrontPreview theme={activeTheme} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold font-serif" style={{ color: 'var(--text-primary)' }}>{activeTheme.name}</h3>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
                  {activeTheme.version}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  Active Live
                </span>
              </div>
              <p className="text-xs max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {activeTheme.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeTheme.featureTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium"
                    style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <a
              href={`/store/${(currentStore?.subdomain || 'auraliving').toLowerCase().replace(/\.gojulex\.com$/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              <Eye className="w-4 h-4" style={{ color: 'var(--accent)' }} /> View Live Store
            </a>

            <Link
              to="/admin/channels/online-store/themes/builder"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-black font-bold text-xs shadow-xs transition cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
            >
              <Sliders className="w-4 h-4" /> Customize / Drag & Drop Builder
            </Link>

            <div className="relative">
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer"
                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
              >
                <span>Actions</span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>

              {actionsOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border shadow-xl p-1.5 z-20 space-y-1 text-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
                  <button
                    onClick={() => {
                      setActionsOpen(false);
                      showToast(`Created duplicate of "${activeTheme.name}"`, 'info');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition hover:bg-amber-500/10 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Duplicate Theme
                  </button>
                  <button
                    onClick={() => {
                      setActionsOpen(false);
                      showToast('Theme settings reset to default', 'info');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 text-left transition hover:bg-rose-500/10 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Theme Library & Marketplace Grid */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold font-serif flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layers className="w-5 h-5" style={{ color: 'var(--accent)' }} /> Cohesive Theme Catalog ({THEME_MARKETPLACE_12.length} Styles)
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Single-palette color harmonies that work seamlessly for any store.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {aestheticCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setAestheticFilter(cat)}
                className={`px-3.5 py-1.5 rounded-2xl font-bold transition whitespace-nowrap cursor-pointer ${
                  aestheticFilter === cat ? 'text-black' : ''
                }`}
                style={aestheticFilter === cat ? {
                  background: 'linear-gradient(135deg, #D4A017, #F5C842)',
                } : {
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => {
            const isCurrentlyActive = activeTheme.id === theme.id;
            // Each theme's 3 key design tokens: heading font, body font, accent color
            const themePreset = HARMONIOUS_THEME_PRESETS.find((p) => p.id === theme.presetId) || HARMONIOUS_THEME_PRESETS[0];

            return (
              <div
                key={theme.id}
                className="rounded-3xl border overflow-hidden transition flex flex-col justify-between group shadow-xs hover:shadow-md"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: isCurrentlyActive ? 'var(--accent)' : 'var(--border-card)',
                }}
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <ThemeStorefrontPreview theme={theme} />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs"
                      style={{ backgroundColor: 'rgba(212,160,23,0.2)', color: '#7A5800', border: '1px solid rgba(168,122,0,0.35)' }}
                    >
                      {theme.aesthetic}
                    </span>

                    {isCurrentlyActive && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        Active Live
                      </span>
                    )}
                  </div>

                  {/* Theme tokens: font pair + accent swatch (always visible) */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/85 backdrop-blur-sm text-slate-700 truncate" title="Heading font">
                      Aa {themePreset.headingFont}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/85 backdrop-blur-sm text-slate-700 truncate" title="Body font">
                      {themePreset.bodyFont}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/85 backdrop-blur-sm text-slate-700" title="Accent color">
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20 inline-block" style={{ backgroundColor: themePreset.accentColor }} />
                      {themePreset.accentColor}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => setDemoModalTheme(theme)}
                      className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Live Preview
                    </button>
                    {!isCurrentlyActive && (
                      <button
                        onClick={() => handleApplyTheme(theme)}
                        className="px-3.5 py-2 rounded-xl font-bold text-xs transition shadow-xs text-black cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                      >
                        Apply Theme
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>{theme.name}</h3>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{theme.version}</span>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {theme.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {theme.featureTags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[9px]"
                        style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{theme.vibe}</span>

                    {isCurrentlyActive ? (
                      <Link
                        to="/admin/channels/online-store/themes/builder"
                        className="px-3 py-1 rounded-xl text-xs font-bold transition"
                        style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}
                      >
                        Customize
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleApplyTheme(theme)}
                        className="px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                      >
                        Apply Theme
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Preview Modal with Device Switcher */}
      <ThemePreviewModal
        theme={demoModalTheme}
        subdomain={cleanSubdomain}
        onClose={() => setDemoModalTheme(null)}
        onApply={() => { handleApplyTheme(demoModalTheme); setDemoModalTheme(null); }}
      />
    </div>
  );
};
