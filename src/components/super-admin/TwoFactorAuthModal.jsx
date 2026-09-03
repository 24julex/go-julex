import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  ShieldCheck,
  QrCode,
  Key,
  Copy,
  Check,
  Lock,
  Smartphone,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';

export const TwoFactorAuthModal = () => {
  const { is2FAModalOpen, set2FAModalOpen, activeAdmin, showToast, logAuditEvent } = useSuperAdmin();
  const [totpCode, setTotpCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

  if (!is2FAModalOpen) return null;

  const secretKey = 'GOJULEX-ADMIN-9988-SECURE-2026';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast('2FA Secret Key copied to clipboard!', 'info');
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (totpCode.trim().length !== 6) {
      showToast('Please enter a valid 6-digit code', 'warning');
      return;
    }

    setStep(3);
    logAuditEvent(
      '2FA Configured',
      'Super Admin Account',
      'master_admin',
      'Configured Time-based One-Time Password (TOTP) 2FA'
    );
    showToast('Two-Factor Authentication successfully verified & active!', 'success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-fade-in text-[#0F172A]">
      <div className="fixed inset-0" onClick={() => set2FAModalOpen(false)} />

      <div className="relative w-full max-w-md bg-white border border-[#FBCBCB] rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FBCBCB] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF5EC] border border-emerald-200 flex items-center justify-center text-[#2D6A4F]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif">Super Admin 2FA Security</h3>
              <p className="text-[11px] text-[#374151]">TOTP Multi-Factor Authentication</p>
            </div>
          </div>
          <button
            onClick={() => set2FAModalOpen(false)}
            className="p-1 rounded-xl hover:bg-[#fedddd] text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-[#0F172A]">
          {step === 1 && (
            <>
              <div className="p-3 rounded-2xl bg-[#fedddd] border border-[#F8B4B4] text-[#881337] flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 shrink-0 mt-0.5 text-[#9F1239]" />
                <p>
                  Scan this QR code with Google Authenticator, Authy, or 1Password to protect master administrative operations.
                </p>
              </div>

              {/* Simulated QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl mx-auto w-48 h-48 border border-[#FBCBCB] shadow-xs">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-white">
                  {[...Array(36)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35) &&
                        i !== 14 &&
                        i !== 21
                          ? 'bg-[#0F172A]'
                          : 'bg-[#FFE4E6]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Manual Secret Key */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                  Manual Entry Key
                </label>
                <div className="flex items-center justify-between p-2.5 bg-white border border-[#FBCBCB] rounded-2xl font-mono text-[11px] text-[#9F1239]">
                  <span>{secretKey}</span>
                  <button
                    onClick={handleCopyKey}
                    className="p-1 rounded hover:bg-[#FEE2E2] text-[#881337] transition"
                    title="Copy Secret"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs transition shadow-xs"
              >
                Proceed to Verify Code →
              </button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-[#374151]">
                Enter the 6-digit verification code generated by your Authenticator app for{' '}
                <strong className="text-[#0F172A]">Go Julex Super Admin</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3 text-center tracking-[0.5em] text-xl font-mono bg-white border border-[#FBCBCB] rounded-2xl text-[#0F172A] focus:outline-none focus:border-[#BE123C]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-2xl bg-white hover:bg-[#FEE2E2] text-[#881337] border border-[#FBCBCB] font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold transition shadow-xs"
                >
                  Verify & Activate
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#EAF5EC] border border-emerald-200 text-[#2D6A4F] flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-[#0F172A] text-base font-serif">2FA Active & Enforced</h4>
                <p className="text-xs text-[#374151] mt-1">
                  Your master account is protected by hardware/software TOTP. High-privilege actions will require instant verification.
                </p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#FBCBCB] text-left space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#881337]">
                  Emergency Backup Codes
                </span>
                <p className="font-mono text-[11px] text-[#0F172A] select-all">
                  9821-4402 • 7712-0091 • 5410-8832 • 3390-1120
                </p>
              </div>

              <button
                onClick={() => set2FAModalOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold transition shadow-xs"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
