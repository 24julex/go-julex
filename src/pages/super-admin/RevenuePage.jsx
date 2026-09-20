import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';

export const RevenuePage = () => {
  const {
    metrics,
    mrrHistory,
    atRiskSubscriptions,
    resolveAtRisk,
    plans,
    tenants
  } = useSuperAdmin();

  const [activeWatchlistFilter, setActiveWatchlistFilter] = useState('all');

  // Plan mix data with gold/neutral palette
  const planMixData = [
    { name: '6-Month Growth (₹18k)', value: tenants.filter((t) => t.billingInterval === '6_months' && t.status === 'active').length, color: '#D4A017' },
    { name: '1-Year Enterprise (₹36k)', value: tenants.filter((t) => t.billingInterval === 'year' && t.status === 'active').length, color: '#F5C842' },
    { name: 'Monthly Flexible', value: tenants.filter((t) => t.billingInterval === 'month' && t.status === 'active').length, color: '#94A3B8' },
    { name: '14-Day Trials', value: tenants.filter((t) => t.status === 'trialing').length, color: '#E2E8F0' },
  ];

  const filteredAtRisk = atRiskSubscriptions.filter((item) => {
    if (activeWatchlistFilter === 'past_due') return item.type === 'past_due';
    if (activeWatchlistFilter === 'trial_expiring') return item.type === 'trial_expiring';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Revenue & Subscription Health
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              Normalized MRR Waterfall
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Tracking subscription run-rates, dunning retries, churn dynamics, and renewal pipelines.
          </p>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Normalized MRR
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono" style={{ color: 'var(--accent)' }}>
              ₹{(metrics?.estimatedMRR ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-500 font-bold">+18.4%</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Formula: Monthly + (6-Mo / 6) + (1-Yr / 12)
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Annualized ARR
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
              ₹{((metrics?.estimatedARR ?? 0)).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-500 font-bold">ARR Run-Rate</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Based on 5 active paid tenant stores
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Active Paid Accounts
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-serif" style={{ color: 'var(--text-primary)' }}>
              {(metrics?.activeStores ?? 0)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stores</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            0 high-intent trialing prospects
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            At-Risk Subscriptions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-500">
              {atRiskSubscriptions.length}
            </span>
            <span className="text-xs text-amber-500 font-semibold">Action Required</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Failed renewals & expiring trials without cards
          </p>
        </div>
      </div>

      {/* 3. 12-Month MRR Waterfall Chart */}
      <div className="p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              12-Month MRR Waterfall (New, Expansion, Churn & Ending MRR)
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Monthly revenue velocity breakdown in INR (₹)</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--accent)' }}>
              <span className="w-2.5 h-2.5 rounded bg-[#D4A017]" /> New MRR
            </span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded bg-[#F5C842]" /> Expansion
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-500">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Churn
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mrrHistory} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)',
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-card)'
                }}
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
              />
              <Bar dataKey="newMrr" stackId="a" fill="#D4A017" name="New MRR" radius={[0, 0, 0, 0]} />
              <Bar dataKey="expansionMrr" stackId="a" fill="#F5C842" name="Expansion MRR" radius={[6, 6, 0, 0]} />
              <Bar dataKey="churnMrr" stackId="b" fill="#F59E0B" name="Churn MRR" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Plan Mix & 0% Value Prop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Plan Mix Donut */}
        <div className="lg:col-span-6 p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Subscription Plan Mix</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Distribution across 6-Month, 1-Year and Trial accounts</p>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {planMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-card)',
                    borderRadius: '16px',
                    fontSize: '11px',
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value Prop */}
        <div className="lg:col-span-6 p-6 rounded-3xl border space-y-3 flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
              <DollarSign className="w-4 h-4" /> Go Julex 0% Platform Fee Model Advantage
            </span>
            <h3 className="font-bold text-lg font-serif" style={{ color: 'var(--text-primary)' }}>
              Why Retail D2C Brands Prefer Flat SaaS
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Legacy marketplaces charge 15%–30% per sale. Go Julex provides predictable 6-month & 1-year subscriptions with 0% platform cuts, ensuring 100% merchant margin retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
