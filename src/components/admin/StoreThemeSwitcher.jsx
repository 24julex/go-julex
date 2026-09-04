import React, { useState } from 'react';
import { THEME_MARKETPLACE } from '../../data/themeRegistry';
import { HARMONIOUS_THEME_PRESETS } from '../../pages/admin/channels/AdminThemeBuilder';
import { api } from '../../services/api';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { Palette, CheckCircle2 } from 'lucide-react';

export const StoreThemeSwitcher = ({ onApplied }) => {
  const { currentStore } = useMerchantAdmin();
  const cleanSubdomain = (currentStore?.subdomain || 'store').toLowerCase().replace(/[^a-z0-9]/g, '');

  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const savedActiveId = localStorage.getItem(`gojulex_store_active_theme_${currentStore?.id}`) ||
                            localStorage.getItem(`gojulex_store_active_theme_${cleanSubdomain}`);
      if (savedActiveId) {
        const found = THEME_MARKETPLACE.find((t) => t.id === savedActiveId || t.presetId === savedActiveId);
        if (found) return found;
      }
      const rawTheme = localStorage.getItem(`gojulex_store_theme_${currentStore?.id}`) ||
                       localStorage.getItem(`gojulex_store_theme_${cleanSubdomain}`);
      if (rawTheme) {
        const parsed = JSON.parse(rawTheme);
        return THEME_MARKETPLACE.find((t) => t.presetId === parsed.presetId || t.id === parsed.presetId) || THEME_MARKETPLACE[0];
      }
    } catch (e) {}
    return THEME_MARKETPLACE[0];
  });
  const [busyId, setBusyId] = useState(null);

  const handleApplyTheme = (theme) => {
    if (busyId || theme.id === activeTheme?.id) return;
    setBusyId(theme.id);

    const presetStyles = HARMONIOUS_THEME_PRESETS.find((p) => p.id === theme.presetId) || HARMONIOUS_THEME_PRESETS[0];

    let currentThemeObj = null;
    try {
      const raw = localStorage.getItem(`gojulex_store_theme_${currentStore?.id}`) ||
                  localStorage.getItem(`gojulex_store_theme_${cleanSubdomain}`);
      if (raw) currentThemeObj = JSON.parse(raw);
    } catch (e) {}

    const newThemePayload = {
      presetId: theme.presetId,
      styles: { ...presetStyles, presetId: theme.presetId },
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
    api.themes.assign(currentStore?.id, theme.presetId).catch(() => {});
    setBusyId(null);
    if (onApplied) onApplied(theme);
  };

  return (
    <div className="p-5 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Storefront Theme</h3>
        </div>
        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
          Active: {activeTheme?.name || 'Default'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {THEME_MARKETPLACE.map((theme) => {
          const isActive = theme.id === activeTheme?.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleApplyTheme(theme)}
              disabled={busyId === theme.id}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5"
              style={isActive ? {
                backgroundColor: 'rgba(212,160,23,0.12)',
                borderColor: 'rgba(212,160,23,0.45)',
                color: 'var(--accent)'
              } : {
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-primary)'
              }}
            >
              {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
              {theme.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
