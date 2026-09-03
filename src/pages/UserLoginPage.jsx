import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Store,
  Gem,
  Phone
} from 'lucide-react';

export const UserLoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  // Customers belong inside a store, not the Julex platform dashboard:
  // after login go to the store they came from (redirect param), the store
  // they last visited, or the default demo storefront.
  const defaultStorePath = (() => {
    try {
      const raw = localStorage.getItem('gojulex_active_store_profile') ||
                  localStorage.getItem('gojulex_store_profile_default');
      if (raw) {
        const s = JSON.parse(raw);
        const sub = (s?.subdomain || '').replace(/\.gojulex\.com$/, '');
        if (sub) return `/store/${sub}`;
      }
    } catch (e) {}
    return '/store/luxestudio';
  })();
  const redirectPath = searchParams.get('redirect') || defaultStorePath;

  const [activeTab, setActiveTab] = useState(initialTab);
  const { loginUser, registerUser, defaultCustomer } = useAuth();
  const navigate = useNavigate();

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email.trim(), password);
      if (result && result.success) {
        navigate(redirectPath);
      } else {
        setError(result?.message || 'Invalid email or password.');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim()
      });

      if (result && result.success) {
        setRegSuccess(true);
        setTimeout(() => {
          navigate(redirectPath);
        }, 1200);
      } else {
        setError(result?.message || 'Registration failed.');
        setLoading(false);
      }
    } catch (err) {
      setError('Registration connection error.');
      setLoading(false);
    }
  };

  const fillDemoCustomerCredentials = () => {
    setEmail(defaultCustomer.email);
    setPassword(defaultCustomer.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 flex items-center justify-center p-4 py-12">
      {/* Glow */}
      <div className="absolute w-[500px] h-[300px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-300 to-cyan-300 flex items-center justify-center shadow-lg shadow-sky-500/20 text-slate-950 font-black">
              <Gem className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="font-serif text-2xl font-black tracking-wider text-white">
            GO JULEX
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-sky-400 font-bold">
            Customer Storefront Account
          </p>
        </div>

        {/* Auth Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-obsidian-900/90 shadow-2xl space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-obsidian-950 border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {regSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Account created successfully! Redirecting...</span>
            </div>
          )}

          {/* SIGN IN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@gojulex.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-obsidian-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-obsidian-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-xs shadow-md shadow-sky-400/20 flex items-center justify-center gap-2 transition hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Storefront <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 1-Click Demo Fill */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={fillDemoCustomerCredentials}
                  className="w-full py-2 px-3 rounded-xl bg-obsidian-950 hover:bg-slate-800 border border-slate-700 text-xs text-sky-300 font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Auto-Fill Demo Customer (customer@gojulex.com)
                </button>
              </div>
            </form>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2 bg-obsidian-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2 bg-obsidian-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Phone (WhatsApp Delivery Alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full pl-10 pr-4 py-2 bg-obsidian-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-4 py-2 bg-obsidian-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-xs shadow-md shadow-sky-400/20 flex items-center justify-center gap-2 transition hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register Customer Account'}
              </button>
            </form>
          )}
        </div>

        {/* Merchant Portal Link */}
        <div className="text-center text-xs">
          <Link to="/admin/login" className="text-slate-400 hover:text-sky-300 transition">
            Are you a store merchant? Sign in to Merchant Admin →
          </Link>
        </div>
      </div>
    </div>
  );
};
