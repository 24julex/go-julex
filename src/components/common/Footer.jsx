import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShieldCheck,
  Percent,
  Truck,
  Mail,
  MapPin,
  Zap
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="transition-colors duration-200" style={{ backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
      {/* 4 Feature Guarantees Strip */}
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>0% Platform Fee</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Merchants keep 100% of revenue</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Flat SaaS Tiers</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Predictable 6-mo & 1-yr plans</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Direct Artisan Escrow</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>100% authentic maker guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>Pan-India Express</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Insured courier logistics & tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-black" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
                <Store className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-black tracking-wider" style={{ color: 'var(--text-primary)' }}>
                GO JULEX
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Go Julex is a <strong style={{ color: 'var(--text-primary)' }}>0% platform fee, merchant-centric e-commerce Software-as-a-Service (SaaS)</strong> platform designed to empower independent brands, artisans, and sellers to run and scale direct-to-consumer businesses without percentage cuts.
            </p>
            <div className="pt-2 text-xs space-y-1 font-mono" style={{ color: 'var(--text-muted)' }}>
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Koramangala 4th Block, Bengaluru, India</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> support@gojulex.com</p>
            </div>
          </div>

          {/* D2C Categories */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
              Explore Catalog
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <li><Link to="/catalog?cat=Artisan+Leather+%26+Goods" className="hover:opacity-80 transition">Artisan Leather & Bags</Link></li>
              <li><Link to="/catalog?cat=Boutique+Timepieces+%26+Jewels" className="hover:opacity-80 transition">Timepieces & Fine Jewels</Link></li>
              <li><Link to="/catalog?cat=Sustainable+Apparel" className="hover:opacity-80 transition">Sustainable Handloom Wear</Link></li>
              <li><Link to="/catalog?cat=Studio+Audio+%26+Tech" className="hover:opacity-80 transition">Studio Audio & Acoustic Tech</Link></li>
              <li><Link to="/catalog?cat=Handcrafted+Living+%26+Decor" className="hover:opacity-80 transition">Ceramics & Home Living</Link></li>
            </ul>
          </div>

          {/* For Merchants */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              For Merchants (0% Fee)
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <li><Link to="/plans" className="font-semibold hover:opacity-80 transition">SaaS Subscription Plans</Link></li>
              <li><Link to="/plans" className="hover:opacity-80 transition">0% Commission ROI Calculator</Link></li>
              <li><Link to="/admin" className="hover:opacity-80 transition">Merchant Operations Console</Link></li>
              <li><Link to="/super-admin" className="font-bold flex items-center gap-1 hover:opacity-80 transition" style={{ color: 'var(--accent)' }}>⚡ Super Admin Master Portal</Link></li>
              <li><Link to="/admin/products" className="hover:opacity-80 transition">Inventory & SKU Manager</Link></li>
              <li><Link to="/admin/orders" className="hover:opacity-80 transition">Order Dispatches</Link></li>
            </ul>
          </div>

          {/* Buyer Protection */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
              Buyer Protection
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <li><Link to="/orders" className="hover:opacity-80 transition">Real-Time Transit Tracking</Link></li>
              <li><span>Instant UPI & 256-bit SSL</span></li>
              <li><span>100% Direct Maker Origin</span></li>
              <li><span>7-Day Craftsmanship Warranty</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-6 text-center text-[11px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} GO JULEX Technologies Pvt. Ltd. All rights reserved. 0% Platform Fee D2C E-Commerce SaaS.
      </div>
    </footer>
  );
};
