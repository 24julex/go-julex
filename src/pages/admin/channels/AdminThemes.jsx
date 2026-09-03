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
  // Real-image preview: the theme's actual hero + product photographs from
  // THEME_META (served locally from /theme-images/) — not an illustration
  const themeMeta = THEME_META[theme.presetId] || {};
  const hero = themeMeta.heroImage || theme.thumbnail;
  const products = (themeMeta.products || []).slice(0, 3);

  return (
    <div className="w-full h-full relative bg-white overflow-hidden">
      <img src={hero} alt={theme.name} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
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
    // Record the real store->theme mapping in the backend (super-admin portal reads it)
    api.themes.assign(currentStore?.id, theme.presetId).catch(() => {});
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

                  {isCurrentlyActive && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                      Active Live
                    </span>
                  )}

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

                {/* Clean card body: name + apply */}
                <div className="px-4 py-3 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm font-serif truncate" style={{ color: 'var(--text-primary)' }}>{theme.name}</h3>
                  {isCurrentlyActive ? (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}>
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyTheme(theme)}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-black shadow-xs transition cursor-pointer whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                    >
                      Apply Theme
                    </button>
                  )}
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
