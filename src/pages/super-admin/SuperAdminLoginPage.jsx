import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Zap,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const SuperAdminLoginPage = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@gojulex.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuperAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide master administrator credentials.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginAdmin(email.trim(), password);
      if (result && result.success) {
        if (result.user?.role === 'SUPER_ADMIN') {
          navigate('/super-admin');
        } else {
          setError('Access Denied. This account does not have Master Super Admin privileges.');
          setLoading(false);
        }
      } else {
        setError(result?.message || 'Invalid master administrator credentials.');
        setLoading(false);
      }
    } catch (err) {
      setError('Authentication connection error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fedddd] text-[#0F172A] flex items-center justify-center p-4 font-sans selection:bg-rose-200 selection:text-rose-900">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 mx-auto flex items-center justify-center text-slate-950 font-script font-bold text-3xl shadow-lg shadow-amber-500/20">
            GJ
          </div>
          <h1 className="brand-gojulex-logo text-4xl sm:text-5xl tracking-normal">
            Go Julex
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            Master Super Admin Gateway
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FBCBCB] shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-3">
            <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#9F1239]" /> Root Authority Portal
            </span>
            <span className="text-[10px] bg-[#fedddd] text-[#881337] px-2 py-0.5 rounded-full border border-[#F8B4B4] font-bold">
              Level 0 Escrow
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSuperAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">
                Master Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gojulex.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#475569] block mb-1.5">
                Master Security Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#FBCBCB] rounded-xl text-[#0F172A] text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#9F1239] focus:ring-2 focus:ring-rose-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs shadow-lg shadow-rose-900/20 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Master Token...
                </>
              ) : (
                <>
                  Access Master Admin Console <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-[#FBCBCB] flex items-center justify-center gap-2 text-[11px] text-[#475569]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dedicated Root Access • 256-Bit Escrow Security</span>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/admin/login"
            className="text-xs text-[#881337] font-semibold hover:underline transition"
          >
            ← Switch to Merchant Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
};
