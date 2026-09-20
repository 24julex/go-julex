import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import {
  STOREFRONT_MODE_KEY,
  STOREFRONT_MODE_EVENT,
  readStorefrontMode,
  readableInk
} from '../../utils/storefrontTheme';

// ============================================================================
// STOREFRONT LIGHT/DARK TOGGLE — the store visitor's personal preference.
// Persists across visits (localStorage) and routes (html[data-jx-mode]),
// and broadcasts a window event so a live storefront re-derives its theme
// colors instantly. `accent` (optional) tints the button to match the theme.
// ============================================================================
export const StorefrontModeToggle = ({ accent = '#D4A017', className = '' }) => {
  const [mode, setMode] = useState(readStorefrontMode());

  // Persist the choice, then reload: the storefront applies its palette and
  // the contrast pass ONCE against a clean DOM for the new mode. In-place
  // re-derivation (restore + re-apply over live React DOM) proved fragile —
  // inline overrides and React re-renders fought each other into mixed
  // states. A reload is instant and always correct.
  const switchMode = (next) => {
    try { localStorage.setItem(STOREFRONT_MODE_KEY, next); } catch (e) {}
    window.dispatchEvent(new CustomEvent(STOREFRONT_MODE_EVENT, { detail: next }));
    window.location.reload();
  };

  const isDark = mode === 'dark';
  const ink = readableInk(accent);

  return (
    <button
      type="button"
      onClick={() => switchMode(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`fixed bottom-5 left-5 z-[60] w-11 h-11 rounded-full shadow-xl flex items-center justify-center transition-transform duration-200 active:scale-90 hover:scale-105 cursor-pointer ${className}`}
      style={{ backgroundColor: accent, color: ink, border: '1.5px solid rgba(255,255,255,0.4)' }}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};
