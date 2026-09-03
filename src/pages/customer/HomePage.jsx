import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../../components/customer/Hero';
import { WatchCard } from '../../components/customer/WatchCard';
import { useProducts } from '../../context/ProductContext';
import {
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Store,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  CreditCard,
  Truck
} from 'lucide-react';

export const HomePage = () => {
  const { products, brands } = useProducts();

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Showcase */}
      <Hero />

      {/* 0% Commission SaaS Teaser Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/60 via-slate-900 to-cyan-950/60 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Direct-to-Consumer SaaS
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Are you an Independent Brand or Artisan?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Stop losing 15%–30% on legacy marketplaces. Run your independent storefront with Go Julex flat SaaS subscriptions and keep 100% of every sale.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/plans"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-xs shadow-md shadow-sky-400/20 flex items-center gap-2 transition hover:scale-105"
            >
              Explore 0% Fee Plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Artisan Creations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Direct from the Maker
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Curated Artisan Highlights
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-sky-300 hover:text-sky-200 flex items-center gap-1 transition"
          >
            View Complete Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <WatchCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Independent Brands Guild Spotlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            Verified Creators
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Independent Brands & Artisan Studios
          </h2>
          <p className="text-xs text-slate-400">
            Every studio on Go Julex operates on our 0% fee model, passing genuine craftsmanship savings directly to you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {brands.slice(0, 8).map((b, idx) => {
            const brandName = typeof b === 'string' ? b : (b?.name || `Brand ${idx + 1}`);
            return (
              <Link
                key={brandName || idx}
                to={`/catalog?brand=${encodeURIComponent(brandName)}`}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-sky-400 text-center space-y-2 transition-all hover:scale-105 bg-obsidian-900/80"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 mx-auto font-black text-sm">
                  {brandName.charAt(0)}
                </div>
                <h4 className="font-serif text-xs font-bold text-white truncate">{brandName}</h4>
                <span className="text-[10px] text-emerald-400 font-semibold block">0% Platform Cut</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* New Arrivals Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Fresh Off the Workbench
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              New Studio Arrivals
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-sky-300 hover:text-sky-200 flex items-center gap-1 transition"
          >
            Explore All New Pieces <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <WatchCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
