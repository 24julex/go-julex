import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { SuperAdminCommandPalette } from './SuperAdminCommandPalette';
import { TwoFactorAuthModal } from './TwoFactorAuthModal';
import { EditAdminProfileModal } from './EditAdminProfileModal';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import {
  LayoutDashboard,
  User,
  Store,
  CreditCard,
  TrendingUp,
  BarChart3,
  ShoppingBag,
  ShieldCheck,
  Users,
  Bell,
  Sliders,
  Search,
  Zap,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Globe,
  Palette,
  FileText
} from 'lucide-react';

export const SuperAdminLayout = () => {
  const {
    impersonatedTenant,
    stopImpersonation,
    activeAdmin,
    setCommandPaletteOpen,
    set2FAModalOpen,
    metrics,
    tenants,
    toast
  } = useSuperAdmin();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/super-admin/overview', icon: LayoutDashboard, badge: null },
    { label: 'Tenants (Stores)', path: '/super-admin/tenants', icon: Store, badge: `${tenants?.length ?? 0}` },
    { label: 'Plans & Tiers', path: '/super-admin/plans', icon: CreditCard, badge: '0% Fee' },
    { label: 'Revenue & MRR', path: '/super-admin/revenue', icon: TrendingUp, badge: (metrics?.estimatedMRR > 0 ? `₹${(metrics.estimatedMRR / 1000).toFixed(0)}k` : '₹0') },
    { label: 'Themes & Distribution', path: '/super-admin/themes', icon: Palette, badge: '21 Themes' },
    { label: 'Invoices & Distribution', path: '/super-admin/invoices', icon: FileText, badge: '6 Formats' },
    { label: 'Analytics Engine', path: '/super-admin/analytics', icon: BarChart3, badge: null },
    { label: 'Orders & GMV', path: '/super-admin/gmv', icon: ShoppingBag, badge: (metrics?.totalPlatformGMV > 0 ? `₹${metrics.totalPlatformGMV.toLocaleString('en-IN')}` : `${metrics?.totalPlatformOrders ?? 0} Orders`) },
    { label: 'Audit Logs', path: '/super-admin/audit-logs', icon: ShieldCheck, badge: 'Live' },
    { label: 'Merchants & Users', path: '/super-admin/merchants', icon: Users, badge: null },
    { label: 'Broadcasts', path: '/super-admin/notifications', icon: Bell, badge: null },
    { label: 'Feature Flags', path: '/super-admin/settings', icon: Sliders, badge: '7 Active' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans select-none" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Global Command Palette (Ctrl+K) */}
      <SuperAdminCommandPalette />

      {/* 2FA Modal */}
      <TwoFactorAuthModal />

      {/* Edit Profile Modal */}
      <EditAdminProfileModal isOpen={isEditProfileOpen} onClose={() => setEditProfileOpen(false)} />

      {/* Toast Notification */}
      {toast?.show && (
        <div className="fixed bottom-5 right-5 z-[120] animate-bounce-short">
          <div className="px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 text-xs font-semibold" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent)' }} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col h-full w-64 shrink-0 z-20 justify-between" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}>
        {/* Brand Header */}
        <div className="p-4 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <NavLink to="/super-admin/overview" className="flex items-center gap-2.5 group">
            <div className="flex flex-col">
              <img src="/images/go-julex-logo.png" alt="Go Julex" className="h-11 w-auto" />
              <span className="text-[9px] font-bold uppercase tracking-wider block leading-none" style={{ color: 'var(--accent)' }}>
                MASTER PORTAL
              </span>
            </div>
          </NavLink>
        </div>

        {/* Core Modules Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--accent)' }}>
            Master Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition group ${isActive ? 'font-bold' : ''}`
                }
                style={({ isActive }) => isActive ? {
                  backgroundColor: 'rgba(212,160,23,0.15)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(212,160,23,0.30)',
                } : {
                  color: 'var(--text-secondary)',
                }}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full transition" style={isActive ? { backgroundColor: 'var(--accent)', color: '#000' } : { backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)' }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Telemetry Card */}
        <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-sidebar)' }}>
          <div className="p-3 rounded-2xl space-y-2" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Platform Health
              </span>
              <span className="text-emerald-500 font-mono text-[10px] font-bold">99.99%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Estimated MRR:</span>
              <span className="font-bold font-mono" style={{ color: 'var(--accent)' }}>
                ₹{metrics.estimatedMRR.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full w-[88%]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-64 h-full z-10 flex flex-col justify-between animate-fade-in shadow-2xl" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="font-serif text-sm font-black" style={{ color: 'var(--text-primary)' }}>GO JULEX MASTER</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CENTER CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        {/* Impersonation Banner */}
        {impersonatedTenant && (
          <div className="shrink-0 px-4 py-2 text-xs shadow-xs" style={{ backgroundColor: 'rgba(212,160,23,0.15)', borderBottom: '1px solid rgba(212,160,23,0.30)', color: 'var(--text-primary)' }}>
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                </span>
                <span className="font-bold">⚠️ Impersonating:</span>
                <span className="font-bold underline" style={{ color: 'var(--accent)' }}>
                  {impersonatedTenant.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 text-black"
                  style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
                >
                  <Store className="w-3 h-3" /> Merchant Console →
                </button>
                <button
                  onClick={stopImpersonation}
                  className="px-3 py-1 rounded-xl font-bold text-[11px] transition flex items-center gap-1"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                >
                  <X className="w-3 h-3" /> Exit Impersonation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 shrink-0 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none z-10 transition-colors duration-200" style={{ backgroundColor: 'var(--bg-nav)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
          {/* Search Bar & Mobile Menu */}
          <div className="flex items-center gap-3.5 flex-1 max-w-xl">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Ctrl+K Search */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-muted)' }}
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span>Search stores, plans, metrics, or type actions...</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                  Ctrl K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Switchers, Theme Toggle & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl text-[11px] font-semibold" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
              <NavLink
                to="/"
                className="px-2.5 py-1 rounded-xl transition flex items-center gap-1"
                style={{ color: 'var(--text-secondary)' }}
                title="Open Public D2C Storefront"
              >
                <Globe className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Storefront
              </NavLink>
              <NavLink
                to="/admin"
                className="px-2.5 py-1 rounded-xl transition flex items-center gap-1"
                style={{ color: 'var(--text-secondary)' }}
                title="Open Merchant Admin Console"
              >
                <Store className="w-3 h-3" style={{ color: 'var(--accent)' }} /> Merchant
              </NavLink>
              <span className="px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold text-black" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
                <Zap className="w-3 h-3" /> Master
              </span>
            </div>

            {/* 2FA Status Pill */}
            <button
              onClick={() => set2FAModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[11px] font-semibold transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>2FA Active</span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeSwitcher />

            {/* Notification Bell */}
            <NavLink
              to="/super-admin/notifications"
              className="p-2 rounded-2xl transition relative cursor-pointer"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--accent)' }}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
            </NavLink>

            {/* Master Admin Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-2xl transition cursor-pointer"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}
              >
                <img
                  src={(activeAdmin?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80')}
                  alt={(activeAdmin?.name || 'Master Super Admin')}
                  className="w-7 h-7 rounded-xl object-cover"
                />
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{(activeAdmin?.name || 'Master Super Admin')}</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>{(activeAdmin?.role || 'Root Authority')}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-3xl p-2 z-20 text-xs space-y-1 animate-fade-in" style={{ backgroundColor: 'var(--bg-dropdown)', border: '1px solid var(--border-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{(activeAdmin?.name || 'Super Admin')}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{(activeAdmin?.email || 'admin@gojulex.com')}</p>
                    </div>

                    <button
                      onClick={() => { setProfileDropdownOpen(false); setEditProfileOpen(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      <span>Edit Admin Profile</span>
                    </button>

                    <button
                      onClick={() => { setProfileDropdownOpen(false); set2FAModalOpen(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Security & 2FA Setup</span>
                    </button>

                    <NavLink
                      to="/super-admin/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Sliders className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      <span>Platform Settings</span>
                    </NavLink>

                    <div className="border-t pt-1" style={{ borderColor: 'var(--border-subtle)' }}>
                      <NavLink
                        to="/admin/login"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-left transition font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Master Portal</span>
                      </NavLink>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE CENTER PAGE BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6" style={{ backgroundColor: 'var(--bg-page)' }}>
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
