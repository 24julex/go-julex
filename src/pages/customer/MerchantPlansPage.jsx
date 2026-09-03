import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GOJULEX_SAAS_PLANS } from '../../data/initialData';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Calculator,
  Store,
  CreditCard,
  Truck,
  Globe,
  Award
} from 'lucide-react';

export const MerchantPlansPage = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(250000);
  const [selectedPlanId, setSelectedPlanId] = useState('plan-1yr');
  const [subscribedPlan, setSubscribedPlan] = useState(null);

  const legacyCommissionRate = 0.18;
  const legacyMonthlyCut = monthlyRevenue * legacyCommissionRate;
  const legacyAnnualCut = legacyMonthlyCut * 12;

  const selectedPlan = GOJULEX_SAAS_PLANS.find((p) => p.id === selectedPlanId) || GOJULEX_SAAS_PLANS[1];
  const gojulexAnnualCost = selectedPlan.id === 'plan-6mo' ? selectedPlan.priceINR * 2 : selectedPlan.priceINR;
  const netAnnualSavings = Math.max(0, legacyAnnualCut - gojulexAnnualCost);

  const handleSelectPlan = (plan) => {
    setSubscribedPlan(plan);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in transition-colors duration-200" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Top Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest"
          style={{ background: 'linear-gradient(135deg, #E040FB 0%, #FF6B9D 100%)' }}
        >
          <Percent className="w-3.5 h-3.5" /> 0% Platform & Transaction Fee Guarantee
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
          Keep <span className="gold-gradient-text">100% of Your Revenue</span>. No Hidden Cuts.
        </h1>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Traditional marketplaces take up to 20% from every sale. <strong style={{ color: 'var(--text-primary)' }}>Go Julex</strong> operates on flat, predictable SaaS subscriptions so independent brands, artisans, and sellers keep every single rupee they earn.
        </p>
      </div>

      {/* Calculator */}
      <div className="p-6 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden space-y-8" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
              <Calculator className="w-4 h-4" /> Interactive ROI Calculator
            </span>
            <h3 className="font-serif text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Calculate Your 0% Fee Savings
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Estimated Net Annual Savings</span>
            <span className="text-3xl font-black font-mono text-emerald-500">
              +₹{Math.round(netAnnualSavings).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            <span>Monthly Store Gross Revenue:</span>
            <span className="font-mono text-base" style={{ color: 'var(--accent)' }}>₹{monthlyRevenue.toLocaleString('en-IN')}/mo</span>
          </div>
          <input
            type="range"
            min="25000"
            max="2000000"
            step="25000"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', accentColor: 'var(--accent)' }}
          />
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span>₹25,000/mo</span>
            <span>₹5,000,000/mo</span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {GOJULEX_SAAS_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className="p-8 rounded-3xl border shadow-xl relative cursor-pointer transition-all duration-300 flex flex-col justify-between"
              style={isSelected ? {
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--accent)',
                boxShadow: 'var(--shadow-card)',
              } : {
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-card)',
              }}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-black text-[10px] font-extrabold uppercase tracking-widest shadow-xs" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
                  Best Value 0% Fee
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-serif text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plan.tagline}</p>
                <div className="py-2">
                  <span className="text-4xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
                    ₹{plan.priceINR.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>/{plan.billingCycle}</span>
                </div>
                <ul className="space-y-2.5 pt-4 text-xs" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
                  {(plan.features || []).map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className="mt-8 w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition text-black cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
              >
                Choose {plan.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
