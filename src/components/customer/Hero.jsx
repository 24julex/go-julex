import React from 'react';
import { Link } from 'react-router-dom';
import {
  Percent,
  ArrowRight,
  Store,
  Zap,
  Sparkles
} from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 transition-colors duration-200" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Background ambient glow — gold in dark, warm in light */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(212,160,23,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-2/3 right-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse, rgba(224,64,251,0.20) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest shadow-sm"
            style={{ background: 'linear-gradient(135deg, #E040FB 0%, #FF6B9D 100%)' }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Premium Direct-to-Consumer • 0% Platform Fee
          </div>

          {/* Headline */}
          <h1
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Empowering Independent Creators with{' '}
            <span className="gold-gradient-text">
              0% Platform Fees
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed transition-colors duration-200"
            style={{ color: 'var(--text-secondary)' }}
          >
            Discover authentic handcrafted goods, boutique fashion, and artisan products directly from independent makers. Merchants keep{' '}
            <strong style={{ color: 'var(--text-primary)' }}>100% of their revenue</strong>{' '}
            with flat, predictable SaaS subscriptions.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/catalog"
              className="px-8 py-4 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-black"
              style={{ background: 'linear-gradient(135deg, #D4A017 0%, #F5C842 100%)', boxShadow: '0 8px 24px rgba(212,160,23,0.30)' }}
            >
              <Store className="w-4 h-4" /> Shop Now
            </Link>

            <Link
              to="/catalog"
              className="px-7 py-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2"
              style={{ border: '2px solid var(--border-card)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}
            >
              View Collections
            </Link>

            <Link
              to="/plans"
              className="px-7 py-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2"
              style={{ border: '1px solid rgba(224,64,251,0.40)', color: '#E040FB', backgroundColor: 'transparent' }}
            >
              Start your own store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Metrics */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 text-left"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
              <span className="font-mono text-2xl font-black" style={{ color: 'var(--accent)' }}>0%</span>
              <p className="text-[11px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Sales Commission</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
              <span className="font-mono text-2xl font-black text-emerald-400">100%</span>
              <p className="text-[11px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Revenue Retained</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
              <span className="font-mono text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Flat Tier</span>
              <p className="text-[11px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>6-Mo & 1-Yr SaaS</p>
            </div>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
              <span className="font-mono text-2xl font-black" style={{ color: 'var(--accent)' }}>Direct</span>
              <p className="text-[11px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>Maker-to-Consumer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
