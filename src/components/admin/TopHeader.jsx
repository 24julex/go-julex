import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  ExternalLink,
  ShieldCheck,
  Menu,
  Sparkles,
  Store,
  KeyRound,
  LogOut,
  User,
  Zap,
  Check,
  Layers,
  ArrowRight,
  FileText,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMerchantAdmin } from '../../context/MerchantAdminContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const TopHeader = ({ onToggleMobileNav, searchQuery, setSearchQuery }) => {
  const { demoStores, currentStore, switchStore, showToast } = useMerchantAdmin();
  const { currentUser, logout, isSuperAdmin, impersonatedTenant, stopImpersonation } = useAuth();
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const cleanSubdomain = (currentStore?.subdomain || 'auraliving').toLowerCase().replace(/\.gojulex\.com$/, '');
  const liveStoreUrl = `/store/${cleanSubdomain}`;
  const ownerDisplayName = (() => {
    let raw = currentUser?.name || currentStore?.ownerName || 'Store Owner';
    if (raw.includes('Eleanor') || raw.includes('Aditya') || raw.includes('Rajesh')) return 'Super Admin';
    return raw;
  })();
  const ownerDisplayEmail = currentUser?.email || currentStore?.ownerEmail || 'admin@gojulex.com';
  const ownerDisplayAvatar = currentUser?.avatar || currentStore?.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

  const getVerticalIcon = (vertical) => {
    switch (vertical) {
      case 'jewelry': return '💎';
      case 'shoes': return '👟';
      case 'clothes': return '👗';
      case 'millets_food': return '🌾';
      case 'gift_shop': return '🎁';
      case 'toy_shop': return '🧸';
      default: return '🛍️';
    }
  };

  return (
    <header
      className="h-16 shrink-0 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none z-10 transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-nav)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
    >
      {/* Left: Mobile Toggle & Store Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-xl transition cursor-pointer"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Store Switcher */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => isSuperAdmin && setStoreDropdownOpen(!storeDropdownOpen)}
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl transition text-left group shadow-xs ${isSuperAdmin ? 'cursor-pointer' : 'cursor-default'}`}
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}
            title={isSuperAdmin ? "Switch between stores (Super Admin)" : currentStore.name}
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {getVerticalIcon(currentStore.vertical)}
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs font-serif" style={{ color: 'var(--text-primary)' }}>
                  {currentStore.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)' }}>
                  {currentStore.status}
                </span>
              </div>
              <p className="text-[10px] truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>
                {currentStore.categoryLabel}
              </p>
            </div>

            {isSuperAdmin && (
              <ChevronDown className="w-3.5 h-3.5 transition shrink-0 ml-1" style={{ color: 'var(--text-muted)' }} />
            )}
          </button>

          {/* Impersonation Exit Badge */}
          {impersonatedTenant && (
            <button
              onClick={() => {
                stopImpersonation();
                navigate('/super-admin/overview');
              }}
              className="px-2.5 py-1.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/30 transition cursor-pointer"
              title="Exit Impersonation session and return to Super Admin Portal"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Exit Impersonation</span>
            </button>
          )}

          {/* Store Switcher Popup (Super Admin Only) */}
          {isSuperAdmin && storeDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-72 rounded-3xl shadow-2xl p-2 z-50 animate-fade-in space-y-1"
              style={{ backgroundColor: 'var(--bg-dropdown)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                  My Managed Stores
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{demoStores.length} Stores</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                {demoStores.map((store) => {
                  const isSelected = store.id === currentStore.id;
                  return (
                    <button
                      key={store.id}
                      onClick={() => {
                        switchStore(store.id);
                        setStoreDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left cursor-pointer"
                      style={isSelected ? { backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.25)' } : {}}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}>
                          {getVerticalIcon(store.vertical)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                            {store.name}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                            {store.categoryLabel}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* View Live Store */}
        <Link
          to={liveStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition text-black"
          style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View Live Store</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </Link>

        {/* Subscription Plan Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
          <span>0% Commission Plan</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, orders, customers..."
          className="w-full pl-10 pr-3 py-1.5 rounded-2xl text-xs transition focus:outline-none"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Right: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Button */}
        <ThemeSwitcher />

        {/* Notifications Bell */}
        <button
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            showToast('All orders and webhooks operating at 100% capacity', 'info');
          }}
          className="p-2 rounded-xl transition relative cursor-pointer"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--accent)' }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-2xl transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)' }}
          >
            <img
              src={ownerDisplayAvatar}
              alt={ownerDisplayName}
              className="w-7 h-7 rounded-xl object-cover"
              style={{ border: '1px solid var(--border-card)' }}
            />
            <div className="hidden lg:block text-left pr-1">
              <p className="font-bold text-xs leading-tight" style={{ color: 'var(--text-primary)' }}>
                {ownerDisplayName}
              </p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Store Owner'}
              </p>
            </div>
            <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-3xl shadow-2xl p-2 z-50 animate-fade-in space-y-1 text-xs"
              style={{ backgroundColor: 'var(--bg-dropdown)', border: '1px solid var(--border-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{ownerDisplayName}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{ownerDisplayEmail}</p>
              </div>

              <Link
                to={liveStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition text-black"
                style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
              >
                <Eye className="w-4 h-4" /> View Live Storefront
              </Link>

              <Link
                to="/admin/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition"
                style={{ color: 'var(--text-primary)' }}
              >
                <KeyRound className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Store Settings
              </Link>

              {impersonatedTenant && (
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    stopImpersonation();
                    navigate('/super-admin');
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 font-bold transition text-xs"
                >
                  <Zap className="w-4 h-4 text-amber-600" /> Return to Super Admin
                </button>
              )}

              <div className="pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate('/admin/login');
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-4 h-4" /> Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
