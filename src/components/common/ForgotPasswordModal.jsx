import React, { useState } from 'react';
import { Mail, Lock, KeyRound, Loader2, ArrowRight, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

// ============================================================================
// FORGOT PASSWORD — email → 6-digit email code → new password → sign in.
// Step 1 asks for the account email and sends the code; step 2 verifies the
// code together with the new password (the backend expires the code on use).
// ============================================================================
export const ForgotPasswordModal = ({ open, onClose, initialEmail = '', onResetSuccess }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [done, setDone] = useState(false);

  if (!open) return null;

  const resetAll = () => {
    setStep(1); setCode(''); setNewPassword(''); setConfirmPassword('');
    setError(''); setNotice(''); setDone(false); setBusy(false);
  };

  const handleClose = () => { resetAll(); onClose && onClose(); };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.auth.forgotPassword(email.trim());
      if (!res?.success) {
        setError(res?.message || 'Could not send the reset code.');
      } else {
        setNotice(res.message + (res.devCode ? ` (Dev code: ${res.devCode})` : ''));
        setStep(2);
      }
    } catch (err) {
      setError(err?.message || 'Could not send the reset code. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.auth.resetPassword(email.trim(), code.trim(), newPassword);
      if (!res?.success) {
        setError(res?.message || 'Could not reset the password.');
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err?.message || 'Could not reset the password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDone = () => {
    const finalEmail = email.trim();
    handleClose();
    onResetSuccess && onResetSuccess(finalEmail);
  };

  const inputCls = 'w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#8A6200] focus:ring-2 focus:ring-rose-100 font-medium transition';

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FFFDF5] dark:bg-obsidian-900 border border-[#EFE2BC] dark:border-obsidian-700 rounded-3xl shadow-2xl p-7 sm:p-8 space-y-5">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#94A3B8] hover:text-[#475569] dark:hover:text-slate-200 hover:bg-black/5 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center space-y-5 py-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#0F172A] dark:text-slate-100">Password updated</h3>
              <p className="text-sm text-[#475569] dark:text-slate-400">Your new password is ready. Sign in with it now.</p>
            </div>
            <button
              type="button"
              onClick={handleDone}
              className="w-full py-3 rounded-xl bg-[#A87A00] hover:bg-[#8A6200] text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              Back to Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A87A00]/10 border border-[#A87A00]/25 text-[10px] font-bold uppercase tracking-wider text-[#8A6200] dark:text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" /> {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A] dark:text-slate-100">
                {step === 1 ? 'Reset your password' : 'Enter code & new password'}
              </h3>
              <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed">
                {step === 1
                  ? 'Enter the email address of your account — we will send a 6-digit verification code.'
                  : `We sent a 6-digit code to ${email}. Enter it below with your new password.`}
              </p>
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}
            {notice && step === 2 && !error && (
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-3.5 py-2.5 break-words">
                {notice}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your account email"
                      className={inputCls}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-[#A87A00] hover:bg-[#8A6200] text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</> : <>Send Verification Code <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1.5">6-Digit Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      autoFocus
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className={inputCls + ' tracking-[0.5em] text-center font-mono'}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter the new password"
                      className={inputCls}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-[#A87A00] hover:bg-[#8A6200] text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : <>Set New Password <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setNotice(''); }}
                  className="w-full text-[11px] font-bold text-[#94A3B8] hover:text-[#475569] dark:hover:text-slate-200 transition cursor-pointer"
                >
                  ← Wrong email? Go back
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
