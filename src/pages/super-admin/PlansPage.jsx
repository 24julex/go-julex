import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Plus, Edit, Trash2, Users, CheckCircle2, XCircle,
  Crown, RefreshCw, Loader2
} from 'lucide-react';

// ============================================================================
// SUPER ADMIN PLANS — reads/writes the REAL Plan table via the backend API.
// No mock data, no localStorage. Every action persists to the database.
// ============================================================================
export const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null); // { ...plan } | 'new' | null
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.all([
        api.plans.list().catch(() => null),
        api.superAdmin.getTenants().catch(() => null)
      ]);
      if (plansRes?.success) setPlans(plansRes.data || []);
      if (subsRes?.success) {
        const subs = (subsRes.data || []).map((t) => ({
          tenantName: t.name,
          planName: t.planName || t.planTier || null,
          status: t.status
        }));
        setSubscriptions(subs);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const countStores = (plan) => subscriptions.filter((s) =>
    s.planName && s.planName.toLowerCase() === plan.billingPeriod.toLowerCase()
  ).length;

  const handleDelete = async (planId) => {
    if (!window.confirm('Delete this plan? Stores already on it will keep access but it won\'t be available for new selections.')) return;
    setBusy(true);
    try {
      const res = await api.plans.deletePlan(planId);
      if (res?.success) load();
    } finally { setBusy(false); }
  };

  const handleSave = async (planData) => {
    setBusy(true);
    try {
      const res = planData._isNew
        ? await api.plans.createPlan(planData)
        : await api.plans.updatePlan(planData.id, planData);
      if (res?.success) {
        setEditModal(null);
        load();
      }
    } finally { setBusy(false); }
  };

  const periodLabel = (bp) => {
    if (bp === 'FREE') return 'free';
    if (bp === 'SIX_MONTH') return '6 months';
    if (bp === 'ONE_YEAR') return '1 year';
    if (bp === 'TWO_YEAR') return '2 years';
    return bp;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Subscription Plans
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              Live from Database
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage flat SaaS billing tiers. Changes apply instantly to the merchant billing page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border transition cursor-pointer" style={{ borderColor: 'var(--border-card)', color: 'var(--text-primary)' }} title="Refresh from database">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditModal({ _isNew: true, id: '', name: '', description: '', priceINR: 0, billingPeriod: 'SIX_MONTH', productLimit: null, customDomain: false, features: [], badge: '', isPopular: false, allowsPublish: true, sortOrder: 99 })}
            className="px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {!loading && plans.map((plan) => (
          <div
            key={plan.id}
            className="p-5 rounded-3xl border flex flex-col justify-between transition relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: plan.isPopular ? 'var(--accent)' : 'var(--border-card)',
              opacity: plan.isActive ? 1 : 0.5
            }}
          >
            {plan.isPopular && (
              <div className="absolute top-3 right-3">
                <Crown className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-base font-serif" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                {plan.badge && <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--accent)' }}>{plan.badge}</p>}
              </div>

              <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
                    {plan.priceINR === 0 ? 'Free' : `₹${plan.priceINR.toLocaleString('en-IN')}`}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/ {periodLabel(plan.billingPeriod)}</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>

              {/* Feature checklist */}
              <div className="space-y-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  {plan.allowsPublish ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                  <span>Publish Store Live</span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.customDomain ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                  <span>Custom Domain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{plan.productLimit ? `Max ${plan.productLimit} products` : 'Unlimited products'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>0% Platform Commission</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span><strong style={{ color: 'var(--text-primary)' }}>{countStores(plan)}</strong> stores</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditModal({ ...plan })}
                  className="px-3 py-1 rounded-xl font-semibold transition flex items-center gap-1 text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  disabled={busy}
                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editModal && (
        <PlanEditModal
          plan={editModal}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
          busy={busy}
        />
      )}
    </div>
  );
};

// Inline plan editor — saves directly to the database
const PlanEditModal = ({ plan, onSave, onClose, busy }) => {
  const [form, setForm] = useState(plan);
  const [featuresText, setFeaturesText] = useState((plan.features || []).join('\n'));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = 'w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:border-[#9F1239]';

  const handleSave = () => {
    const features = featuresText.split('\n').map((f) => f.trim()).filter(Boolean);
    onSave({ ...form, features });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{form._isNew ? 'Create Plan' : `Edit ${form.name}`}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
        </div>

        <div className="p-6 space-y-4 text-slate-900">
          {form._isNew && (
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Plan ID (unique)</label>
              <input value={form.id} onChange={(e) => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="plan_custom" className={inputCls} />
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Name</label>
            <input value={form.name || ''} onChange={(e) => set('name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Price (₹)</label>
              <input type="number" value={form.priceINR ?? 0} onChange={(e) => set('priceINR', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Billing Period</label>
              <select value={form.billingPeriod || 'SIX_MONTH'} onChange={(e) => set('billingPeriod', e.target.value)} className={inputCls}>
                <option value="FREE">Free</option>
                <option value="SIX_MONTH">6 Months</option>
                <option value="ONE_YEAR">1 Year</option>
                <option value="TWO_YEAR">2 Years</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Product Limit</label>
              <input type="number" value={form.productLimit ?? ''} onChange={(e) => set('productLimit', e.target.value ? Number(e.target.value) : null)} placeholder="empty = unlimited" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Badge</label>
              <input value={form.badge || ''} onChange={(e) => set('badge', e.target.value)} placeholder="Best Value" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.customDomain} onChange={(e) => set('customDomain', e.target.checked)} className="w-4 h-4" />
              Custom Domain
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPopular} onChange={(e) => set('isPopular', e.target.checked)} className="w-4 h-4" />
              Popular
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.allowsPublish} onChange={(e) => set('allowsPublish', e.target.checked)} className="w-4 h-4" />
              Allow Publish
            </label>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Features (one per line)</label>
            <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} className={inputCls + ' font-mono text-xs'} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={busy || (form._isNew && !form.id) || !form.name} className="px-5 py-2 rounded-xl bg-[#9F1239] hover:bg-[#881337] text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
            {busy ? 'Saving…' : 'Save to Database'}
          </button>
        </div>
      </div>
    </div>
  );
};
