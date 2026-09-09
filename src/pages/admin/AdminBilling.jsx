import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckCircle2, CreditCard, Clock, AlertTriangle } from 'lucide-react';

// ============================================================================
// BILLING — merchant dashboard page. Shows the REAL plan catalogue from the
// database. The merchant picks a plan; the payment step honestly reports
// "gateway being configured". Publishing is gated until billing is complete.
// ============================================================================
export const AdminBilling = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.plans.list().catch(() => null),
      api.storeStatus.get().catch(() => null)
    ]).then(([plansRes, statusRes]) => {
      if (plansRes?.success) setPlans(plansRes.data || []);
      if (statusRes?.success) setStatus(statusRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const choosePlan = async (plan) => {
    setBusy(true); setMessage('');
    try {
      const res = await api.plans.select(plan.id);
      if (res?.success) {
        setSelected(plan);
        setMessage(res.message || 'Plan selected.');
        // refresh status
        const st = await api.storeStatus.get().catch(() => null);
        if (st?.success) setStatus(st.data);
      }
    } catch (e) {
      setMessage('Could not select plan.');
    } finally { setBusy(false); }
  };

  const periodLabel = (p) => {
    if (p.billingPeriod === 'FREE') return '';
    if (p.billingPeriod === 'SIX_MONTH') return '/ 6 months';
    if (p.billingPeriod === 'ONE_YEAR') return '/ year';
    if (p.billingPeriod === 'TWO_YEAR') return '/ 2 years';
    return '';
  };

  const sub = status?.subscription;

  return (
    <div className="space-y-6 pb-16 text-[#0F172A]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#FBCBCB] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#9F1239]" /> Billing & Plans
          </h1>
          <p className="text-xs text-[#374151] mt-1">
            Choose a Go Julex plan to publish your store live. You can build and explore everything for free — payment is only needed to go live.
          </p>
        </div>
      </div>

      {/* Current status */}
      {status && (
        <div className={'p-4 rounded-2xl border space-y-1.5 ' + (status.canPublish ? 'border-emerald-200 bg-emerald-50' : 'border-amber-300 bg-amber-50')}>
          <div className="flex items-center gap-2">
            {status.canPublish ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
            <p className="text-sm font-black">
              {status.canPublish ? 'Your store is authorized to publish' : 'Your store is not live yet'}
            </p>
          </div>
          <p className="text-xs opacity-80">
            {status.canPublish
              ? 'You have an active plan. Publish your store from the theme builder when you\'re ready.'
              : sub?.plan?.name
                ? `Plan selected: ${sub.plan.name} — payment pending. Your store setup is saved; publishing unlocks once payment is completed.`
                : 'No plan selected yet. Pick a plan below to get started.'}
          </p>
        </div>
      )}

      {/* Plans grid */}
      {loading && <p className="text-xs text-stone-500">Loading plans…</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!loading && plans.map((plan) => {
          const isCurrent = sub?.plan?.id === plan.id;
          return (
            <div
              key={plan.id}
              className={'p-5 rounded-3xl border-2 space-y-3 flex flex-col ' + (isCurrent ? 'border-[#D4A017] bg-[#FFFDF5]' : 'border-[#FBCBCB] bg-white')}
            >
              {plan.badge && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#fedddd] text-[#881337]">{plan.badge}</span>
              )}
              <h3 className="font-serif font-black text-sm">{plan.name}</h3>
              <p className="font-mono font-black text-xl text-[#9F1239]">
                {plan.priceINR === 0 ? 'Free' : `₹${plan.priceINR.toLocaleString('en-IN')}`}
                <span className="text-[10px] text-stone-500 font-sans font-bold">{periodLabel(plan)}</span>
              </p>
              <p className="text-[11px] text-[#374151] leading-snug">{plan.description}</p>
              <ul className="text-[10.5px] text-[#475569] space-y-0.5 flex-1">
                {plan.features.slice(0, 4).map((f, i) => <li key={i}>✓ {f}</li>)}
              </ul>
              <button
                onClick={() => choosePlan(plan)}
                disabled={busy || isCurrent || status?.canPublish}
                className={'w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ' + (isCurrent ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-[#9F1239] hover:bg-[#881337] text-white disabled:opacity-50')}
              >
                {isCurrent ? 'Current Plan' : status?.canPublish ? 'Active' : plan.priceINR === 0 ? 'Select (Preview Only)' : 'Choose Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment step */}
      {selected && (
        <div className="p-5 rounded-2xl border border-[#F5C842] bg-[#FFFDF5] space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <p className="font-bold text-sm">Payment for {selected.name} ({selected.priceINR === 0 ? 'Free' : `₹${selected.priceINR.toLocaleString('en-IN')}`})</p>
          </div>
          <p className="text-xs text-[#374151] leading-relaxed">
            Your plan choice has been saved. <strong>Payment gateway is currently being configured.</strong>
            You can continue building your store — publishing becomes available once payment processing is enabled.
            Nothing has been charged.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold transition cursor-pointer">Continue Building</button>
          </div>
        </div>
      )}

      {message && <p className="text-xs font-bold text-[#9F1239]">{message}</p>}
    </div>
  );
};
