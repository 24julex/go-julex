import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Layers,
  Users,
  Tag,
  BarChart3,
  Globe,
  Settings,
  Plus,
  Zap,
  ChevronDown,
  ChevronRight,
  Palette,
  Link as LinkIcon,
  FileText,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { useAuth } from '../../context/AuthContext';

export const SidebarNav = ({ onOpenAddProduct, onCloseMobile }) => {
  const { currentStore, kpis } = useMerchantAdmin();
  const { isSuperAdmin } = useAuth();
  const location = useLocation();

  const isOnlineStoreActive =
    location.pathname.includes('/channels/online-store') ||
    location.pathname.includes('/channels/themes') ||
    location.pathname.includes('/channels/domains');
  const [onlineStoreExpanded, setOnlineStoreExpanded] = useState(true);

  const navItems = [
    { name: 'Home', path: '/admin/dashboard', icon: Home },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingBag,
      badge: kpis.unfulfilledOrdersCount > 0 ? `${kpis.unfulfilledOrdersCount} New` : null,
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: Layers,
      badge: kpis.lowStockItemsCount > 0 ? `${kpis.lowStockItemsCount} Low` : null,
    },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Discounts', path: '/admin/discounts', icon: Tag },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 }
  ];

  return (
    <aside className="w-full h-full flex flex-col justify-between select-none overflow-hidden" style={{ backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-primary)' }}>
      {/* Brand Logo */}
      <div className="p-4 shrink-0 space-y-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <Link to="/admin" onClick={onCloseMobile} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 flex items-center justify-center shadow text-slate-950 font-bold font-script text-lg">
              GJ
            </div>
            <div>
              <span className="brand-gojulex-logo text-2xl tracking-normal block leading-tight">
                Go Julex
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold block leading-none" style={{ color: 'var(--accent)' }}>
                Merchant Admin
              </span>
            </div>
          </Link>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}>
            0% FEE
          </span>
        </div>

        {/* Quick Add Product Button */}
        <Link
          to="/admin/products/new"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl font-bold text-xs shadow transition transform active:scale-95 text-black"
          style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-2xl font-semibold text-xs transition ${isActive ? 'font-bold' : ''}`
              }
              style={({ isActive }) => isActive ? {
                backgroundColor: 'rgba(212,160,23,0.15)',
                color: 'var(--accent)',
                border: '1px solid rgba(212,160,23,0.30)',
              } : {
                color: 'var(--text-secondary)',
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Online Store */}
        <div className="pt-2">
          <div
            onClick={() => setOnlineStoreExpanded(!onlineStoreExpanded)}
            className="flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer text-xs transition"
            style={isOnlineStoreActive ? { color: 'var(--accent)', fontWeight: 700, backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.25)' } : { color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span>Online Store</span>
            </div>
            {onlineStoreExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            )}
          </div>

          {onlineStoreExpanded && (
            <div className="pl-4 pr-1 mt-1 space-y-1 ml-5 text-xs animate-fade-in" style={{ borderLeft: '1px solid rgba(212,160,23,0.25)' }}>
              <NavLink
                to="/admin/channels/online-store/themes"
                onClick={onCloseMobile}
                className={({ isActive }) => `flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] transition ${isActive ? 'font-bold' : ''}`}
                style={({ isActive }) => isActive ? { color: 'var(--accent)', backgroundColor: 'rgba(212,160,23,0.12)' } : { color: 'var(--text-secondary)' }}
              >
                <Palette className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span>Themes & Customizer</span>
              </NavLink>

              <NavLink
                to="/admin/channels/online-store/domains"
                onClick={onCloseMobile}
                className={({ isActive }) => `flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] transition ${isActive ? 'font-bold' : ''}`}
                style={({ isActive }) => isActive ? { color: 'var(--accent)', backgroundColor: 'rgba(212,160,23,0.12)' } : { color: 'var(--text-secondary)' }}
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Domains</span>
              </NavLink>

              <a
                href={`/store/${(currentStore?.subdomain || 'auraliving').toLowerCase().replace(/\.gojulex\.com$/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition"
                style={{ color: 'var(--accent)' }}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Live Store</span>
                </div>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="pt-1">
          <NavLink
            to="/admin/settings/invoices"
            onClick={onCloseMobile}
            className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-2xl font-semibold text-xs transition ${isActive ? 'font-bold' : ''}`}
            style={({ isActive }) => isActive ? { color: 'var(--accent)', backgroundColor: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.30)' } : { color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
              <span>Invoices & Receipts</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              GST
            </span>
          </NavLink>
        </div>

        {/* Settings */}
        <div className="pt-1">
          <NavLink
            to="/admin/settings"
            onClick={onCloseMobile}
            className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-2xl font-semibold text-xs transition ${isActive ? 'font-bold' : ''}`}
            style={({ isActive }) => isActive ? { color: 'var(--accent)', backgroundColor: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.30)' } : { color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </div>
          </NavLink>
        </div>
      </nav>

      {/* Bottom Area */}
      <div className="p-3 mt-auto shrink-0 space-y-2.5 text-xs" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-sidebar)' }}>
        {/* Fee Savings */}
        <div className="p-2.5 rounded-2xl space-y-1" style={{ backgroundColor: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.20)' }}>
          <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
            <span>0% Fee Savings</span>
            <span className="font-mono font-black text-emerald-500">
              +₹{(kpis?.feesSavedINR ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            100% store revenue retained vs marketplace take rates.
          </p>
        </div>

        {/* Super Admin Link */}
        {isSuperAdmin && (
          <Link
            to="/super-admin/overview"
            onClick={onCloseMobile}
            className="flex items-center justify-between p-2 rounded-2xl font-bold transition text-black"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Master Super Admin</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-mono">⚡ 10 Modules</span>
          </Link>
        )}
      </div>
    </aside>
  );
};
