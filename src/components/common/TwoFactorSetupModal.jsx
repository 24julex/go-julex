import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Smartphone, KeyRound, Copy, Check, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// TWO-FACTOR SETUP MODAL — real TOTP (Google Authenticator / any authenticator
// app). Enable flow: server generates a secret -> merchant scans the QR ->
// entering one valid code activates 2FA. Disable flow: one valid code turns
// it off. The session is re-synced on success so every surface reflects the
// new state immediately.
// ============================================================================
export const TwoFactorSetupModal = ({ open, onClose }) => {
  const { currentUser, refreshSession } = useAuth();
  const alreadyEnabled = Boolean(currentUser?.twoFactorEnabled);

  const [secret, setSecret] = useState(null);
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || alreadyEnabled) return;
    let cancelled = false;
    setLoadingSecret(true); setError('');
    api.auth.setup2fa()
      .then((res) => {
        if (cancelled) return;
        if (res?.success) { setSecret(res.secret); setOtpauthUrl(res.otpauthUrl); }
        else setError(res?.message || 'Could not start 2FA setup.');
      })
      .catch(() => { if (!cancelled) setError('Could not reach the server.'); })
      .finally(() => { if (!cancelled) setLoadingSecret(false); });
    return () => { cancelled = true; };
  }, [open, alreadyEnabled]);

  if (!open) return null;

  const reset = () => {
    setSecret(null); setOtpauthUrl(null); setCode(''); setError(''); setDone('');
  };

  const handleClose = () => { reset(); onClose && onClose(); };

  const submitCode = async () => {
    const clean = code.replace(/\D/g, '');
    if (clean.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return; }
    setBusy(true); setError('');
    try {
      const res = alreadyEnabled
        ? await api.auth.disable2fa(clean)
        : await api.auth.enable2fa(clean);
      if (res?.success) {
        setDone(res.message || 'Two-factor authentication updated.');
        await refreshSession();
        setTimeout(handleClose, 1400);
      } else {
        setError(res?.message || 'That code was not accepted. Try again.');
      }
    } catch (e) {
      setError('Could not reach the server. Please try again.');
    } finally { setBusy(false); }
  };

  const copySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh', backgroundColor: '#0F172A', border: '1px solid rgba(212,160,23,0.3)' }}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-5 shrink-0" style={{ background: 'linear-gradient(135deg,#1a1a2e,#0F172A)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)' }}>
              <ShieldCheck className="w-4.5 h-4.5" style={{ color: '#D4A017' }} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: '#D4A017' }}>Account Security</p>
              <h2 className="font-serif text-base font-black text-white leading-tight">
                {alreadyEnabled ? 'Turn Off 2FA' : 'Two-Factor Authentication'}
              </h2>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200">
          {done ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }}>
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-white">{done}</p>
            </div>
          ) : alreadyEnabled ? (
            <>
              <div className="flex items-start gap-2.5 p-3 rounded-2xl" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <KeyRound className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <p className="text-[11px] leading-relaxed text-rose-200">
                  Enter a current 6-digit code from your authenticator app to turn off two-factor authentication. Your account will be protected by password only.
                </p>
              </div>
              <CodeInput code={code} setCode={setCode} onSubmit={submitCode} busy={busy} />
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5 p-3 rounded-2xl" style={{ backgroundColor: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.25)' }}>
                <Smartphone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#D4A017' }} />
                <p className="text-[11px] leading-relaxed text-amber-100/90">
                  Open Google Authenticator (or any authenticator app), choose <strong>Add account → Scan QR code</strong>, then enter the 6-digit code it shows.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 py-2">
                {loadingSecret || !otpauthUrl ? (
                  <div className="h-40 w-40 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(212,160,23,0.35)' }}>
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-white">
                    <QRCodeSVG value={otpauthUrl} size={148} level="M" />
                  </div>
                )}
                <button onClick={copySecret} disabled={!secret} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer hover:bg-white/10 transition disabled:opacity-50" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,160,23,0.3)', color: '#F5C842' }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Secret copied' : 'Copy secret key manually'}
                </button>
                {secret && <p className="text-[9px] font-mono text-slate-500 break-all text-center max-w-[260px]">{secret}</p>}
              </div>

              <CodeInput code={code} setCode={setCode} onSubmit={submitCode} busy={busy} />
            </>
          )}

          {error && <p className="text-[11px] font-bold text-rose-400 pt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
};

const CodeInput = ({ code, setCode, onSubmit, busy }) => (
  <div>
    <label className="text-[10px] font-bold text-amber-300 block mb-1.5">Verification code</label>
    <div className="flex gap-2">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
        placeholder="6-digit code"
        inputMode="numeric"
        autoFocus
        className="w-full px-3 py-2.5 rounded-xl text-sm bg-white text-slate-900 font-mono font-bold tracking-[0.3em] focus:outline-none focus:border-[#9F1239] border"
      />
      <button
        onClick={onSubmit}
        disabled={busy}
        className="px-4 py-2.5 rounded-xl font-black text-xs text-black transition transform active:scale-98 cursor-pointer disabled:opacity-60 shrink-0"
        style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
      >
        {busy ? '…' : 'Verify'}
      </button>
    </div>
  </div>
);
