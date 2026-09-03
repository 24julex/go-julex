import React from 'react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const Toast = () => {
  const { toastMessage, closeToast } = useCart();
  const { isDarkMode } = useTheme();

  if (!toastMessage) return null;

  const isInfo = toastMessage.type === 'info';
  const isError = toastMessage.type === 'error';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 animate-bounce-short flex items-center gap-3.5 px-5 py-4 rounded-2xl border transition-all duration-200 max-w-md ${
        isDarkMode
          ? 'bg-obsidian-900/95 backdrop-blur-md border-gold-500/40 text-white shadow-luxury shadow-black/80'
          : 'bg-white/95 backdrop-blur-md border-cyan-500/60 text-slate-900 shadow-2xl shadow-slate-900/20'
      }`}
    >
      {/* Status Icon */}
      <div className="shrink-0">
        {isInfo ? (
          <Info className={`w-5 h-5 ${isDarkMode ? 'text-[#FB7185]' : 'text-[#9F1239]'}`} />
        ) : isError ? (
          <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
        ) : (
          <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-gold-400' : 'text-cyan-600'}`} />
        )}
      </div>

      {/* Message Text */}
      <p className={`text-sm font-semibold tracking-wide ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
        {toastMessage.message}
      </p>

      {/* Close Button */}
      <button
        onClick={closeToast}
        className={`ml-auto p-1 rounded-lg transition-colors ${
          isDarkMode
            ? 'text-slate-400 hover:text-white hover:bg-obsidian-800'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

