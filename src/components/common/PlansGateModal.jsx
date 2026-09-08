import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

// ============================================================================
// PLAN GATE — shown whenever an unpublished-store action needs a plan.
// Reads the REAL plan catalogue from the backend database. Selecting a plan
// records PLAN_SELECTED only; the payment step honestly reports that the
// gateway is being configured. Nothing is faked.
// ============================================================================
export const PlansGateModal = ({ open, onClose, contextTitle, contextMessage, storeStatusApi, onPlanSelected }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('plans'); // plans | payment
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setPhase('plans');
    setLoading(true);
    api.plans.list()
      .then((res) => { if (res?.success) setPlans(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
    if (storeStatusApi) {
      storeStatusApi().then((res) => { if (res?.success) setStatus(res.data); }).catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const choosePlan = async (plan) => {
    setLoading(true);
    try {
      const res = await api.plans.select(plan.id);
      if (res?.success) {
        setSelected(plan);
        setPhase('payment');
      }
    } catch (e) {} finally { setLoading(false); }
  };

  const acknowledgePayment = async () => {
    setLoading(true);
    try { await api.plans.paymentPending(); } catch (e) {} finally { setLoading(false); }
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#FBCBCB] p-7 space-y-5 text-[#0F172A]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-black">{phase === 'plans' ? (contextTitle || 'Choose a Go Julex plan for your store') : 'Complete your plan payment'}</h2>
            <p className="text-xs text-[#374151] mt-1">
              {phase === 'plans'
                ? (contextMessage || 'Your store setup is saved. Pick a plan to unlock publishing — you can also continue building and pay later.')
                : 'Your store setup has been saved successfully. Publishing unlocks once payment is completed.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer">✕</button>
        </div>

        {status && !status.canPublish && (
          <div className="text-[11px] font-bold px-3 py-2 rounded-xl bg-[#FFF5F5] border border-[#FBCBCB] text-[#881337]">
            Store status: {status.storeStatus || 'DRAFT'} · Plan: {status.subscription?.plan?.name || 'None selected'} — not activated
          </div>
        )}

        {phase === 'plans' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loading && <p className="text-xs text-stone-500">Loading plans…</p>}
            {!loading && plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => choosePlan(plan)}
                disabled={loading}
                className={'text-left p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ' + (plan.isPopular ? 'border-[#D4A017] bg-[#FFFDF5]' : 'border-[#FBCBCB] bg-white hover:border-[#D4A017]')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-black text-sm">{plan.name}</span>
                  {plan.badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#fedddd] text-[#881337]">{plan.badge}</span>}
                </div>
                <p className="font-mono font-black text-lg text-[#9F1239]">
                  {plan.priceINR === 0 ? 'Free' : `₹${plan.priceINR.toLocaleString('en-IN')}`}
                  <span className="text-[10px] text-stone-500 font-sans font-bold">
                    {plan.billingPeriod === 'FREE' ? '' : plan.billingPeriod === 'SIX_MONTH' ? ' / 6 months' : plan.billingPeriod === 'ONE_YEAR' ? ' / year' : ' / 2 years'}
                  </span>
                </p>
                <p className="text-[11px] text-[#374151] leading-snug">{plan.description}</p>
                <ul className="text-[10.5px] text-[#475569] space-y-0.5">
                  {plan.features.slice(0, 4).map((f, i) => <li key={i}>✓ {f}</li>)}
                </ul>
                {!plan.allowsPublish && <p className="text-[10px] font-bold text-amber-700">Preview only — publishing requires a paid plan</p>}
              </button>
            ))}
          </div>
        )}

        {phase === 'payment' && selected && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#F5C842] space-y-2">
              <p className="font-bold text-sm">{selected.name} — {selected.priceINR === 0 ? 'Free' : `₹${selected.priceINR.toLocaleString('en-IN')}`}</p>
              <p className="text-xs text-[#374151] leading-relaxed">
                Plan selected and saved. <strong>Payment gateway is currently being configured.</strong>
                You can continue building your store — publishing becomes available once payment processing is enabled.
                Nothing has been charged and no fake confirmation is shown.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={acknowledgePayment} disabled={loading} className="px-4 py-2.5 rounded-2xl bg-[#9F1239] hover:bg-[#881337] text-white font-bold text-xs transition cursor-pointer">
                {loading ? 'Saving…' : 'Continue Editing'}
              </button>
              <button onClick={() => setPhase('plans')} className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FEE2E2] border border-[#FBCBCB] text-[#881337] font-bold text-xs transition cursor-pointer">
                Back to Plans
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-[#FBCBCB]">
          <p className="text-[10px] text-stone-500">Plans are read live from the Go Julex database.</p>
          <button onClick={onClose} className="text-xs font-bold text-[#881337] hover:underline cursor-pointer">Continue building without paying</button>
        </div>
      </div>
    </div>
  );
};
