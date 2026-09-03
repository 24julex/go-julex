import React, { useState } from 'react';
import { X, Laptop, Smartphone, ExternalLink } from 'lucide-react';

// ============================================================
// UNIFIED REAL LIVE THEME PREVIEW — the single preview surface
// used by BOTH the merchant console and the super-admin portal.
// Renders the actual storefront with the theme applied via the
// ?theme= override (never touches the store's saved theme).
// ============================================================
export const ThemePreviewModal = ({ theme, subdomain, onClose, onApply }) => {
  const [viewport, setViewport] = useState('desktop');
  if (!theme) return null;

  const storeSub = (subdomain || 'luxestudio').toLowerCase().replace(/\.gojulex\.com$/, '');
  const previewUrl = `/store/${storeSub}?theme=${theme.presetId || theme.id}&preview=1`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border bg-white border-slate-200">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between gap-3 border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-sm truncate text-slate-900">
              {theme.name} — Live Preview
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              Real storefront render
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl text-xs border border-slate-200 bg-slate-50">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewport === 'desktop' ? 'bg-amber-500 text-black font-bold' : 'text-slate-500'}`}
              title="Desktop Preview"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewport === 'mobile' ? 'bg-amber-500 text-black font-bold' : 'text-slate-500'}`}
              title="Mobile Preview (380px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 rounded-xl font-bold text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
              title="Open the live preview in a full browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            {onApply && (
              <button
                onClick={onApply}
                className="px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs text-black cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
              >
                Apply & Publish
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-xl transition cursor-pointer text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* REAL live preview — the actual storefront, no sandbox restrictions */}
        <div className="flex-1 overflow-hidden p-4 bg-slate-100 flex items-center justify-center">
          <div
            className={`transition-all duration-300 overflow-hidden border shadow-xl bg-white ${
              viewport === 'mobile' ? 'w-[380px] h-[600px]' : 'w-full h-[600px]'
            }`}
            style={{ borderColor: '#cbd5e1' }}
          >
            <iframe
              key={`${previewUrl}-${viewport}`}
              src={previewUrl}
              title={`${theme.name} live preview`}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
