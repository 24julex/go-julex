import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { AddPlanModal } from '../../components/super-admin/AddPlanModal';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const PlansPage = () => {
  const { plans, deletePlan, tenants } = useSuperAdmin();

  const [isAddPlanOpen, setAddPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setAddPlanOpen(true);
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setAddPlanOpen(true);
  };

  const plansWithCounts = plans.map((plan) => {
    const matchingTenants = tenants.filter(
      (t) => t.planId === plan.id || t.planName.toLowerCase() === plan.name.toLowerCase()
    );
    const count = matchingTenants.length;
    const totalRev = count * plan.priceINR;
    return {
      ...plan,
      subscribersCount: count,
      revenueGeneratedINR: totalRev
    };
  });

  return (
    <div className="space-y-6">
      {/* Add / Edit Plan Modal */}
      <AddPlanModal
        isOpen={isAddPlanOpen}
        onClose={() => setAddPlanOpen(false)}
        editingPlan={editingPlan}
      />

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Subscription Plans & Entitlements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              0% Platform Fee SaaS
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Configure flat SaaS subscription billing tiers, feature flags, multi-channel sync quotas, and JSON entitlements.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition text-black cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
        >
          <Plus className="w-4 h-4" /> Add Subscription Plan
        </button>
      </div>

      {/* 2. Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plansWithCounts.map((plan) => (
          <div
            key={plan.id}
            className="p-5 rounded-3xl border flex flex-col justify-between transition relative overflow-hidden group shadow-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: plan.isPopular ? 'var(--accent)' : 'var(--border-card)',
            }}
          >
            {plan.badge && (
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)' }}>
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base font-serif" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plan.tagline}</p>
              </div>

              <div className="p-3.5 rounded-2xl border space-y-1.5" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
                    ₹{plan.priceINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    / {plan.interval.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <span>Normalized MRR:</span>
                  <span className="font-bold font-mono" style={{ color: 'var(--accent)' }}>
                    ₹{plan.normalizedMRR.toLocaleString('en-IN')}/mo
                  </span>
                </div>
              </div>

              {/* Entitlements Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                  JSON Entitlements Policy
                </span>
                <div className="space-y-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-2">
                    {plan.features.customDomain ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span>Custom Domain SSL & DNS Routing</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {plan.features.whatsappSync ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span>WhatsApp Catalog Auto-Sync</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {plan.features.instagramApi ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    )}
                    <span>Meta & Instagram Shopping API</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      Max Products: <strong style={{ color: 'var(--text-primary)' }}>{plan.features.maxProducts}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      Platform Commission: <strong style={{ color: 'var(--accent)' }}>{plan.features.platformFeePercent}% Fee</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Plan Actions */}
            <div className="mt-5 pt-4 border flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>{plan.subscribersCount}</strong> active stores
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEdit(plan)}
                  className="px-3 py-1 rounded-xl font-semibold transition flex items-center gap-1 text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Archive Plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
