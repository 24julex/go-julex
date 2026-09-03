import React, { useState, useEffect } from 'react';
import {
  Palette,
  Plus,
  Search,
  Sliders,
  Copy,
  Pencil,
  Trash2,
  Layers,
  Store,
  DollarSign,
  Crown,
  Eye,
  UserCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { CreateThemeModal } from '../../components/super-admin/themes/CreateThemeModal';
import { ThemePreviewModal } from '../../components/common/ThemePreviewModal';
import { MASTER_THEME_CATALOG as MASTER_THEMES_CATALOG } from '../../data/themeRegistry';
import { api } from '../../services/api';


/* Rendered Live Website Template Card Front */
const MiniThemeStorefrontCard = ({ theme }) => {
  const bg = theme.tokens?.backgroundColor || '#FFFFFF';
  const surface = theme.tokens?.surfaceColor || '#F5F5F0';
  const accent = theme.tokens?.primaryAccent || '#D4A017';
  const headingColor = theme.tokens?.headingColor || '#0F172A';
  const fontSerif = theme.tokens?.headingFont || 'serif';

  return (
    <div
      className="w-full h-full p-3 flex flex-col justify-between select-none overflow-hidden relative shadow-inner"
      style={{ backgroundColor: bg }}
    >
      {/* Mini Store Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-black shadow-xs" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
            GJ
          </div>
          <span className="text-[11px] font-extrabold truncate max-w-[140px]" style={{ color: headingColor, fontFamily: fontSerif }}>
            {theme.name.split(' ')[0]} Storefront
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px]" style={{ color: headingColor }}>
          <span className="hidden sm:inline font-medium opacity-80">Catalog</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-xs" style={{ backgroundColor: accent }}>
            Buy Now
          </span>
        </div>
      </div>

      {/* Mini Store Hero Banner */}
      <div className="py-2 px-2.5 rounded-xl space-y-1 border" style={{ backgroundColor: surface, borderColor: 'rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between">
          <span className="text-[7px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded" style={{ backgroundColor: 'rgba(212,160,23,0.18)', color: accent }}>
            {theme.vertical.split(',')[0]}
          </span>
          <span className="text-[7px] font-mono opacity-60" style={{ color: headingColor }}>0% Fee SaaS</span>
        </div>
        <h4 className="text-[10px] font-extrabold leading-snug truncate" style={{ color: headingColor, fontFamily: fontSerif }}>
          {theme.tagline}
        </h4>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="px-2 py-0.5 rounded text-[7px] font-bold text-white shadow-xs" style={{ backgroundColor: accent }}>
            Explore Collection →
          </span>
        </div>
      </div>

      {/* Mini 3-Item Store Product Cards */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="p-1 rounded-lg border space-y-0.5" style={{ backgroundColor: surface, borderColor: 'rgba(0,0,0,0.08)' }}>
            <div className="w-full h-8 rounded bg-black/10 overflow-hidden relative">
              <img
                src={theme.thumbnail}
                alt="Product Preview"
                className="w-full h-full object-cover opacity-85"
              />
            </div>
            <div className="text-[7px] font-bold truncate" style={{ color: headingColor }}>
              Artisan SKU #{idx}
            </div>
            <div className="text-[7px] font-mono font-extrabold" style={{ color: accent }}>
              ₹{(idx * 1999).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ThemesPage = () => {
  const { showToast, tenants, impersonateTenant } = useSuperAdmin();
  // Live preview renders against a real storefront — first live tenant, else demo store
  const previewSubdomain = (tenants?.[0]?.subdomain || 'luxestudio').toLowerCase().replace(/\.gojulex\.com$/, '');
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sandboxTheme, setSandboxTheme] = useState(null);
  const [editingTheme, setEditingTheme] = useState(null);

  // Super Admin template authority: edits (overrides), deletions and custom
  // themes persist in localStorage so they survive reloads.
  const [customThemes, setCustomThemes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gojulex_super_custom_themes') || '[]'); } catch { return []; }
  });
  const [themeOverrides, setThemeOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gojulex_super_theme_overrides') || '{}'); } catch { return {}; }
  });
  const [deletedThemeIds, setDeletedThemeIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gojulex_super_theme_deleted') || '[]'); } catch { return []; }
  });

  // Load overrides from the BACKEND (single source of truth, shared with
  // the merchant dashboards); localStorage is only an offline fallback.
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
        setThemeOverrides(ovMap);
        setDeletedThemeIds(del);
        localStorage.setItem('gojulex_super_theme_overrides', JSON.stringify(ovMap));
        localStorage.setItem('gojulex_super_theme_deleted', JSON.stringify(del));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const persistCustom = (list) => {
    setCustomThemes(list);
    localStorage.setItem('gojulex_super_custom_themes', JSON.stringify(list));
  };
  const persistOverrides = (map) => {
    setThemeOverrides(map);
    localStorage.setItem('gojulex_super_theme_overrides', JSON.stringify(map));
  };
  const persistDeleted = (list) => {
    setDeletedThemeIds(list);
    localStorage.setItem('gojulex_super_theme_deleted', JSON.stringify(list));
  };
  const pushOverrideToBackend = (id, fields) => api.themes.updateOverride(id, fields).catch(() => {});

  const allThemes = [...MASTER_THEMES_CATALOG, ...customThemes]
    .filter((t) => !deletedThemeIds.includes(t.id))
    .map((t) => (themeOverrides[t.id] ? { ...t, ...themeOverrides[t.id], tokens: { ...t.tokens, ...(themeOverrides[t.id].tokens || {}) } } : t));

  const filteredThemes = allThemes.filter((theme) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      theme.name.toLowerCase().includes(q) ||
      theme.vertical.toLowerCase().includes(q) ||
      theme.tagline.toLowerCase().includes(q) ||
      theme.slug.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filterTab === 'All') return true;
    if (filterTab === 'Jewelry & Luxury') return theme.category === 'Jewelry & Luxury' || theme.vertical.includes('Jewelry');
    if (filterTab === 'Fashion & Couture') return theme.category === 'Fashion & Couture' || theme.vertical.includes('Fashion');
    if (filterTab === 'Gifts & Beauty') return theme.category === 'Gifts & Beauty' || theme.vertical.includes('Beauty');
    if (filterTab === 'Books & Apparel') return theme.category === 'Books & Apparel' || theme.vertical.includes('Books');
    if (filterTab === 'Organic & Millets') return theme.category === 'Organic & Millets' || theme.vertical.includes('Millets');
    if (filterTab === 'Electronics & Gadgets') return theme.category === 'Electronics & Gadgets' || theme.vertical.includes('Electronics');
    return true;
  });

  const getStoresUsingTheme = (themeSlug) => {
    return tenants.filter((t) => (t.themeSlug || 'aura-soft-peach') === themeSlug || (t.activeThemeSlug || 'aura-soft-peach') === themeSlug);
  };

  const handleDuplicate = (theme) => {
    const newTheme = {
      ...theme,
      id: `custom_${Date.now()}`,
      name: `${theme.name} (Copy)`,
      slug: `${theme.slug}-copy`,
      isPublished: true
    };
    persistCustom([...customThemes, newTheme]);
    showToast(`Theme duplicated: "${newTheme.name}"`, 'success');
  };

  // DELETE: Super Admin can remove ANY template (master preset or custom)
  const handleArchive = (themeId) => {
    const theme = allThemes.find((t) => t.id === themeId);
    if (!window.confirm(`Delete template "${theme?.name || themeId}"?
Stores using it will fall back to the default theme.`)) return;
    if (themeId.startsWith('custom_')) {
      persistCustom(customThemes.filter((t) => t.id !== themeId));
    } else {
      persistDeleted([...deletedThemeIds, themeId]);
      pushOverrideToBackend(themeId, { deleted: true });
    }
    showToast(`Template "${theme?.name || themeId}" deleted from the catalog`, 'info');
  };

  // EDIT: Super Admin can edit ANY template's identity and design tokens
  const handleSaveEdit = (edited) => {
    if (edited.id.startsWith('custom_')) {
      persistCustom(customThemes.map((t) => (t.id === edited.id ? edited : t)));
    } else {
      const { id, tokens, ...rest } = edited;
      const fields = { ...rest, ...(tokens || {}) };
      persistOverrides({ ...themeOverrides, [id]: { ...(themeOverrides[id] || {}), ...fields } });
      pushOverrideToBackend(id, fields);
    }
    setEditingTheme(null);
    showToast(`Template "${edited.name}" updated`, 'success');
  };

  const handleRestoreDefaults = () => {
    persistDeleted([]);
    persistOverrides({});
    api.themes.resetOverrides().catch(() => {});
    showToast('Master catalog restored to defaults', 'success');
  };

  const handleSaveNewTheme = (newThemeData) => {
    persistCustom([...customThemes, newThemeData]);
    showToast(`Master theme "${newThemeData.name}" created!`, 'success');
  };

  const totalThemes = allThemes.length;
  const totalInstalls = tenants.length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
              <Palette className="w-6 h-6" style={{ color: 'var(--accent)' }} /> Global Theme Registry & Storefront Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {totalThemes} Master Themes
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Publish responsive D2C storefront themes, define CSS design tokens, and push live layout updates to merchant stores.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition transform active:scale-95 whitespace-nowrap text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create New Master Theme
        </button>
      </div>

      {/* 2. Top Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border space-y-2 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Master Themes</span>
            <Layers className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-2xl font-black font-serif" style={{ color: 'var(--text-primary)' }}>{totalThemes}</p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{totalThemes} universal responsive presets</span>
        </div>

        <div className="p-5 rounded-3xl border space-y-2 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Stores Using Themes</span>
            <Store className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-2xl font-black font-serif" style={{ color: 'var(--text-primary)' }}>{totalInstalls}</p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Active merchant storefronts</span>
        </div>

        <div className="p-5 rounded-3xl border space-y-2 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Platform Fee Plan</span>
            <DollarSign className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-2xl font-black font-serif font-mono" style={{ color: 'var(--accent)' }}>
            0% Commission
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Included with SaaS subscription</span>
        </div>
      </div>

      {/* 3. Live Merchant Theme Adoptions */}
      <div className="p-6 rounded-3xl border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <div>
              <h2 className="text-sm font-bold font-serif" style={{ color: 'var(--text-primary)' }}>Live Merchant Theme Adoptions</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Real-time visibility into which theme is active on each merchant store.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tenants.map((store) => {
            const activeThemeSlug = store.themeSlug || store.activeThemeSlug || 'aura-soft-peach';
            const themeMatch = allThemes.find((t) => t.slug === activeThemeSlug) || allThemes[0];
            return (
              <div
                key={store.id}
                className="p-3.5 rounded-2xl border space-y-2 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{store.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)' }}>
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{(store.subdomain || store.id).replace(/^store_/, '')}.gojulex.com</p>
                </div>

                <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span style={{ color: 'var(--text-muted)' }}>Theme:</span>
                    <span className="font-bold truncate max-w-[130px]" style={{ color: 'var(--accent)' }}>{themeMatch.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span style={{ color: 'var(--text-muted)' }}>ID:</span>
                    <span className="font-mono truncate max-w-[130px]" style={{ color: 'var(--text-secondary)' }}>{store.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 text-xs w-full sm:w-auto">
          {[
            { id: 'All', label: 'All' },
            { id: 'Jewelry & Luxury', label: 'Jewelry & Luxury' },
            { id: 'Fashion & Couture', label: 'Fashion & Couture' },
            { id: 'Gifts & Beauty', label: 'Gifts & Beauty' },
            { id: 'Books & Apparel', label: 'Books & Apparel' },
            { id: 'Organic & Millets', label: 'Organic & Millets' },
            { id: 'Electronics & Gadgets', label: 'Electronics & Gadgets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-2xl font-bold transition whitespace-nowrap cursor-pointer ${
                filterTab === tab.id ? 'text-black' : ''
              }`}
              style={filterTab === tab.id ? {
                background: 'linear-gradient(135deg, #D4A017, #F5C842)',
              } : {
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search themes, styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-2xl text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* 5. Master Themes Grid with Rendered Live Storefront Template Preview Front Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => {
          const storesUsingThis = getStoresUsingTheme(theme.slug);

          return (
            <div
              key={theme.id}
              className="rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}
            >
              <div>
                {/* Live Rendered Storefront Template Front Header */}
                <div className="relative h-56 w-full border-b overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
                  <MiniThemeStorefrontCard theme={theme} />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md"
                      style={{ backgroundColor: '#D4A017', color: '#111111', border: '1px solid rgba(0,0,0,0.2)' }}
                    >
                      {theme.vertical.split(',')[0]}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    {theme.tierAccess === 'pro' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black flex items-center gap-1 shadow-xs">
                        <Crown className="w-3 h-3" /> PRO
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                      LIVE TEMPLATE
                    </span>
                  </div>
                </div>

                {/* Tokens Metadata */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {theme.name}
                    </h3>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{theme.version}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
                      🎨 {theme.tokens?.headingFont || 'Serif'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
                      📄 {theme.tokens?.bodyFont || 'Sans'}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-lg text-black font-bold"
                      style={{ backgroundColor: theme.tokens?.primaryAccent || 'var(--accent)' }}
                    >
                      Accent Color
                    </span>
                  </div>

                  <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-[11px] font-bold mb-1.5 flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                      <span>Currently Active On:</span>
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{storesUsingThis.length} Store(s)</span>
                    </p>
                    {storesUsingThis.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {storesUsingThis.map((store) => (
                          <Link
                            key={store.id}
                            to={`/store/${(store.subdomain || store.id).replace(/^store_/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <Store className="w-2.5 h-2.5" />
                            {store.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Available in merchant marketplace</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSandboxTheme(theme)}
                  className="flex-1 py-2 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer text-black"
                  style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Preview
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingTheme({ ...theme })}
                    title="Edit Template (Super Admin)"
                    className="p-2 rounded-xl transition cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--accent)' }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(theme)}
                    title="Duplicate Theme as Template"
                    className="p-2 rounded-xl transition cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleArchive(theme.id)}
                    title="Delete Template"
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    style={{ border: '1px solid var(--border-card)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateThemeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewTheme}
      />

      {/* Super Admin Template Editor — full authority over ANY template */}
      {editingTheme && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Edit Template</h3>
                <p className="text-[11px] text-slate-500">Super Admin authority — changes apply to the master catalog</p>
              </div>
              <button onClick={() => setEditingTheme(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-slate-900">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Template Name</label>
                <input
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category / Vertical</label>
                <input
                  value={editingTheme.vertical || ''}
                  onChange={(e) => setEditingTheme({ ...editingTheme, vertical: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Accent Color</label>
                  <input
                    type="color"
                    value={editingTheme.tokens?.primaryAccent || '#A3B449'}
                    onChange={(e) => setEditingTheme({ ...editingTheme, tokens: { ...editingTheme.tokens, primaryAccent: e.target.value } })}
                    className="w-full h-11 rounded-xl border border-slate-300 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Background</label>
                  <input
                    type="color"
                    value={editingTheme.tokens?.backgroundColor || '#FFFFFF'}
                    onChange={(e) => setEditingTheme({ ...editingTheme, tokens: { ...editingTheme.tokens, backgroundColor: e.target.value } })}
                    className="w-full h-11 rounded-xl border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Heading Font</label>
                <select
                  value={editingTheme.tokens?.headingFont || 'Playfair Display'}
                  onChange={(e) => setEditingTheme({ ...editingTheme, tokens: { ...editingTheme.tokens, headingFont: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                >
                  {['Playfair Display', 'Cinzel', 'Fraunces', 'Archivo Black', 'Poppins', 'Work Sans', 'Inter', 'Space Grotesk', 'Outfit', 'Plus Jakarta Sans'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tagline</label>
                <input
                  value={editingTheme.tagline || ''}
                  onChange={(e) => setEditingTheme({ ...editingTheme, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400 font-mono truncate">{editingTheme.id}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingTheme(null)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button
                  onClick={() => handleSaveEdit(editingTheme)}
                  className="px-5 py-2 rounded-xl text-xs font-black text-black shadow cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(deletedThemeIds.length > 0 || Object.keys(themeOverrides).length > 0) && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleRestoreDefaults}
            className="px-4 py-2 rounded-xl text-[11px] font-bold border cursor-pointer"
            style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}
          >
            ↺ Restore master catalog defaults ({deletedThemeIds.length} deleted, {Object.keys(themeOverrides).length} edited)
          </button>
        </div>
      )}

      {sandboxTheme && (
        <ThemePreviewModal
          theme={sandboxTheme}
          subdomain={previewSubdomain}
          onClose={() => setSandboxTheme(null)}
        />
      )}
    </div>
  );
};
