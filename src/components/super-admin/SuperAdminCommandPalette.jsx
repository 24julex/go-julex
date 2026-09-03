import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  Search,
  LayoutDashboard,
  Store,
  CreditCard,
  TrendingUp,
  BarChart3,
  ShoppingBag,
  ShieldCheck,
  Users,
  Bell,
  Sliders,
  ArrowRight,
  UserCheck,
  PlusCircle,
  Zap,
  Lock,
  ExternalLink,
  X
} from 'lucide-react';

export const SuperAdminCommandPalette = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    tenants,
    impersonateTenant,
    showToast
  } = useSuperAdmin();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filtered tenants by name, domain, admin email
  const filteredTenants = tenants
    .filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        (t.admin?.email || t.ownerEmail || '').toLowerCase().includes(query.toLowerCase()) ||
        (t.customDomain && t.customDomain.toLowerCase().includes(query.toLowerCase())) ||
        t.subdomain.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  const navigationOptions = [
    { label: 'Overview & Telemetry', path: '/super-admin', icon: LayoutDashboard },
    { label: 'Tenant Directory', path: '/super-admin/tenants', icon: Store },
    { label: 'Subscription Plans', path: '/super-admin/plans', icon: CreditCard },
    { label: 'Revenue & MRR Waterfall', path: '/super-admin/revenue', icon: TrendingUp },
    { label: 'Orders & GMV Tracking', path: '/super-admin/gmv', icon: ShoppingBag },
    { label: 'Platform Analytics', path: '/super-admin/analytics', icon: BarChart3 },
    { label: 'Master Audit Logs', path: '/super-admin/audit-logs', icon: ShieldCheck },
    { label: 'Merchants & Staff', path: '/super-admin/merchants', icon: Users },
    { label: 'Broadcasts & Notices', path: '/super-admin/notifications', icon: Bell },
    { label: 'Feature Flags & Settings', path: '/super-admin/settings', icon: Sliders }
  ];

  const filteredNav = navigationOptions.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    {
      label: 'Provision New Store Tenant',
      action: () => navigate('/super-admin/tenants?action=new'),
      icon: PlusCircle
    },
    {
      label: 'Dispatch New Broadcast Alert',
      action: () => navigate('/super-admin/notifications?action=new'),
      icon: Bell
    },
    {
      label: 'Inspect At-Risk Subscriptions',
      action: () => navigate('/super-admin/revenue#watchlist'),
      icon: TrendingUp
    }
  ];

  const filteredActions = quickActions.filter((act) =>
    act.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectNav = (path) => {
    setCommandPaletteOpen(false);
    navigate(path);
  };

  const handleSelectTenant = (tenant) => {
    setCommandPaletteOpen(false);
    navigate(`/super-admin/tenants?tenantId=${tenant.id}`);
  };

  const handleImpersonate = (e, tenant) => {
    e.stopPropagation();
    setCommandPaletteOpen(false);
    impersonateTenant(tenant);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={() => setCommandPaletteOpen(false)} />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-white border border-[#FBCBCB] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#FBCBCB] bg-white">
          <Search className="w-5 h-5 text-[#9F1239] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores, plans, modules, or run actions... (ESC to exit)"
            className="w-full bg-transparent text-sm text-[#0F172A] placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-600 text-xs mr-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-4 text-xs divide-y divide-[#FBCBCB]/60">
          {/* Matched Tenants */}
          {filteredTenants.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#881337] px-2 flex items-center justify-between">
                <span>Matching Tenants</span>
                <span className="text-[#374151]">{filteredTenants.length} found</span>
              </div>
              <div className="space-y-1">
                {filteredTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    onClick={() => handleSelectTenant(tenant)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#fedddd] cursor-pointer group transition border border-transparent hover:border-[#FBCBCB]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={(tenant.logoUrl || tenant.logo || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80')}
                        alt={tenant.name}
                        className="w-8 h-8 rounded-xl object-cover border border-[#FBCBCB] shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-[#0F172A] group-hover:text-[#9F1239] flex items-center gap-2">
                          {tenant.name}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              tenant.status === 'active'
                                ? 'bg-[#EAF5EC] text-[#2D6A4F] border border-emerald-200'
                                : tenant.status === 'trialing'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : tenant.status === 'suspended'
                                ? 'bg-red-50 text-[#9B1C1C] border border-rose-200'
                                : 'bg-slate-100 text-[#374151] border border-stone-200'
                            }`}
                          >
                            {tenant.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#374151] flex items-center gap-2">
                          <span>{tenant.customDomain || tenant.subdomain}</span>
                          <span>•</span>
                          <span>{(tenant.admin?.email || tenant.ownerEmail || '')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleImpersonate(e, tenant)}
                        className="px-2.5 py-1 rounded-xl bg-[#fedddd] hover:bg-[#FECDD3] border border-[#F8B4B4] text-[#881337] text-[11px] font-medium transition flex items-center gap-1"
                        title="Impersonate (View as Merchant)"
                      >
                        <UserCheck className="w-3 h-3 text-[#9F1239]" /> Impersonate
                      </button>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#9F1239] group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="space-y-1.5 pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#881337] px-2">
                Quick Actions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredActions.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCommandPaletteOpen(false);
                        act.action();
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-2xl bg-white hover:bg-[#FEE2E2] cursor-pointer group transition border border-[#FBCBCB]"
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#fedddd] border border-[#F8B4B4] flex items-center justify-center text-[#9F1239] shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-[#0F172A] font-medium">{act.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Modules */}
          <div className="space-y-1.5 pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#881337] px-2">
              Platform Modules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filteredNav.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.path}
                    onClick={() => handleSelectNav(mod.path)}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#fedddd] cursor-pointer group transition border border-transparent hover:border-[#FBCBCB]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#fedddd] flex items-center justify-center text-[#881337] group-hover:text-[#0F172A] transition">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-[#374151] group-hover:text-[#0F172A] font-medium">
                        {mod.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#9F1239]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-white border-t border-[#FBCBCB] flex items-center justify-between text-[11px] text-[#374151]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-[#881337] border border-[#FBCBCB]">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-[#881337] border border-[#FBCBCB]">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-[#881337] border border-[#FBCBCB]">
                ENTER
              </kbd>{' '}
              to open
            </span>
          </div>
          <span className="text-[#9F1239] font-mono text-[10px]">Go Julex Master v2.4</span>
        </div>
      </div>
    </div>
  );
};
