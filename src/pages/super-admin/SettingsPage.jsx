import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export const SettingsPage = () => {
  const {
    featureFlags,
    toggleFeatureFlag,
    set2FAModalOpen,
    showToast,
    logAuditEvent
  } = useSuperAdmin();

  const [platformConfig, setPlatformConfig] = useState({
    platformName: 'Go Julex 0% Platform Fee D2C Commerce SaaS',
    defaultTrialDays: 14,
    defaultCurrency: 'INR (₹)',
    supportWebhookUrl: 'https://api.gojulex.com/webhooks/master-ops',
    sentryDsn: 'https://98829a@sentry.io/45012399',
    smtpHost: 'smtp.sendgrid.net',
    maintenanceMode: false
  });

  const handleSavePlatformConfig = (e) => {
    e.preventDefault();
    logAuditEvent(
      'Feature Flag Toggled',
      'Platform Configuration',
      'system',
      'Updated master platform settings and webhook endpoints'
    );
    showToast('Platform master settings saved successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Feature Flags & Master Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              System Control Plane
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage global runtime feature flags, multi-tenant infrastructure policies, and Super Admin security keys.
          </p>
        </div>
      </div>

      {/* 2. Global Feature Flags */}
      <div className="border rounded-3xl p-5 space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2 font-serif" style={{ color: 'var(--text-primary)' }}>
              <Sliders className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Global Runtime Feature Flags
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Instant toggle controls impacting all tenant instances in real-time
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border text-emerald-500 bg-emerald-500/10 border-emerald-500/30">
            {featureFlags.filter((f) => f.enabled).length} of {featureFlags.length} Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {featureFlags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 rounded-2xl border transition flex items-start justify-between gap-3 text-xs"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{flag.name}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
                    {flag.category}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{flag.description}</p>
                <div className="text-[10px] font-mono pt-1" style={{ color: 'var(--text-muted)' }}>
                  Key: <code style={{ color: 'var(--accent)' }}>{flag.key}</code> • Modified by {flag.updatedBy}
                </div>
              </div>

              {/* Toggle Switch: Julex Gold when active */}
              <button
                type="button"
                onClick={() => toggleFeatureFlag(flag.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  flag.enabled ? 'bg-amber-500' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    flag.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Security Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 border rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2 font-serif" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Super Admin Security Center & 2FA
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Time-based One-Time Password (TOTP) enforcement for root administrator operations.
            </p>
          </div>
          <button
            onClick={() => set2FAModalOpen(true)}
            className="w-full py-2.5 rounded-2xl font-bold text-xs text-black transition cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            Configure 2FA Authenticator App
          </button>
        </div>
      </div>
    </div>
  );
};
