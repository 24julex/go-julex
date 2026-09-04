import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  ShoppingBag,
  Heart,
  User,
  Shield,
  Menu,
  X,
  Search,
  LogIn,
  LogOut,
  Layers,
  Store,
  Percent,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logoutUser, isAuthenticated } = useAuth();
  const { getCartCount, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-nav)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
      {/* 0% Platform Fee Announcement Banner */}
      <div className="py-1.5 px-4 text-center text-black font-medium text-[11px]" style={{ background: 'linear-gradient(135deg, #D4A017 0%, #F5C842 100%)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/15 text-black font-bold text-[10px] uppercase tracking-wider">
            <Percent className="w-2.5 h-2.5" /> 0% Platform Fee
          </span>
          <span className="hidden sm:inline">Merchants keep 100% of revenue. Flat predictable SaaS subscriptions.</span>
          <Link to="/plans" className="text-black font-bold underline ml-1 hover:opacity-80">
            View 6-Mo & 1-Yr Plans →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <img src="/images/go-julex-logo.png" alt="Go Julex" className="h-12 w-auto" />
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}>
                  0% FEE
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-bold" style={{ color: 'var(--accent)' }}>
                D2C Commerce Cloud
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
            <Link
              to="/"
              className={`transition-colors ${isCurrentPath('/') ? 'font-bold' : ''}`}
              style={{ color: isCurrentPath('/') ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className={`transition-colors ${isCurrentPath('/catalog') ? 'font-bold' : ''}`}
              style={{ color: isCurrentPath('/catalog') ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              Artisan Catalog
            </Link>
            <Link
              to="/plans"
              className={`transition-colors flex items-center gap-1.5 ${isCurrentPath('/plans') || isCurrentPath('/pricing') ? 'font-bold' : ''}`}
              style={{ color: isCurrentPath('/plans') ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> 0% Fee SaaS Plans
            </Link>
            <Link
              to="/orders"
              className={`transition-colors ${isCurrentPath('/orders') ? 'font-bold' : ''}`}
              style={{ color: isCurrentPath('/orders') ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              Tracking
            </Link>
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 text-[11px]"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Merchant
            </Link>
            <Link
              to="/super-admin"
              className="px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-[11px] shadow-xs text-black"
              style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
            >
              <Zap className="w-3.5 h-3.5" /> Super Admin
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative min-w-[200px] lg:min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artisan goods, brands..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl transition focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher />

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-2xl relative transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--accent)' }}
              title="Saved Items"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-black text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2.5 rounded-2xl relative transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--accent)' }}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-black text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/orders"
                  className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl text-xs font-semibold"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] text-black" style={{ backgroundColor: 'var(--accent)' }}>
                    {currentUser.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[90px] truncate">{currentUser.name}</span>
                </Link>
                <button
                  onClick={logoutUser}
                  className="p-2.5 rounded-2xl transition cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--accent)' }}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 text-black"
                style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
              >
                <LogIn className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl transition cursor-pointer"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t px-5 py-6 space-y-5 animate-fade-in" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artisan goods, brands..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl transition focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            />
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          </form>

          <nav className="flex flex-col gap-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-xl transition">
              Home
            </Link>
            <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-xl transition">
              Artisan Catalog
            </Link>
            <Link to="/plans" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-xl transition flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <Zap className="w-4 h-4" /> 0% Fee SaaS Plans
            </Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-xl transition">
              Order Tracking
            </Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)' }}>
              <Shield className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Merchant Console
            </Link>
            <Link to="/super-admin" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-xl font-bold flex items-center gap-2 text-black" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
              <Zap className="w-4 h-4" /> Super Admin Master Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
