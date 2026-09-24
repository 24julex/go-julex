import React, { useState } from 'react';
import { AlertTriangle, KeyRound, Loader2, ArrowRight, X, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

// ============================================================================
// DELETE ACCOUNT — Settings › Danger Zone. Step 1 warns what will be lost
// and emails a 6-digit code; step 2 verifies it and permanently deletes the
// merchant account (and their entire store). The parent handles logout.
// ============================================================================
export const DeleteAccountModal = ({ open, onClose, onDeleted }) => {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [storeName, setStoreName] = useState(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const resetAll = () => {
    setStep(1); setCode(''); setError(''); setNotice(''); setDone(false); setBusy(false);
  };

  const handleClose = () => { if (busy) return; resetAll(); onClose && onClose(); };

  const handleSendCode = async () => {
    setError(''); setNotice('');
    setBusy(true);
    try {
      const res = await api.auth.requestDeleteCode();
      if (!res?.success) {
        setError(res?.message || 'Could not send the deletion code.');
      } else {
        setStoreName(res.storeName || null);
        setNotice(res.message + (res.devCode ? ` (Dev code: ${res.devCode})` : ''));
        setStep(2);
      }
    } catch (err) {
      setError(err?.message || 'Could not send the deletion code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.auth.confirmDeleteAccount(code.trim());
      if (!res?.success) {
        setError(res?.message || 'Could not delete the account.');
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err?.message || 'Could not delete the account. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleFinish = () => {
    resetAll();
    onDeleted && onDeleted();
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-obsidian-900 border border-rose-200 dark:border-rose-500/30 rounded-3xl shadow-2xl p-7 sm:p-8 space-y-5">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#94A3B8] hover:text-[#475569] hover:bg-black/5 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center space-y-5 py-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#0F172A] dark:text-slate-100">Account deleted</h3>
              <p className="text-sm text-[#475569] dark:text-slate-400">Your account{storeName ? ` and the store "${storeName}"` : ''} have been permanently removed. Sorry to see you go.</p>
            </div>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-[#A87A00] hover:bg-[#8A6200] text-white font-bold text-sm transition cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A] dark:text-slate-100">Delete your account</h3>
              {step === 1 ? (
                <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed">
                  This <strong>permanently deletes</strong> your account and your entire store — products, orders,
                  coupons, invoice settings and store logins. This cannot be undone. We'll email a 6-digit
                  verification code to confirm it's really you.
                </p>
              ) : (
                <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed">
                  Enter the 6-digit code we emailed you to delete everything permanently.
                </p>
              )}
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}
            {notice && step === 2 && !error && (
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 break-words">
                {notice}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="text-[11px] bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 space-y-1 text-rose-900">
                  <p className="font-bold">You will lose:</p>
                  <p>• Your login and account data</p>
                  <p>• Your store, products, and all orders</p>
                  <p>• Coupons, invoice settings and themes</p>
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</> : <><Trash2 className="w-4 h-4" /> Email me a deletion code</>}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full text-[11px] font-bold text-[#94A3B8] hover:text-[#475569] transition cursor-pointer"
                >
                  ← Keep my account
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#475569] dark:text-slate-400 block mb-1.5">6-Digit Deletion Code</label>
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-obsidian-850 border border-[#EFE2BC] rounded-xl text-[#0F172A] dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 font-mono tracking-[0.5em] text-center"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Permanently Delete Everything <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setNotice(''); }}
                  className="w-full text-[11px] font-bold text-[#94A3B8] hover:text-[#475569] transition cursor-pointer"
                >
                  ← Cancel and keep my account
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
