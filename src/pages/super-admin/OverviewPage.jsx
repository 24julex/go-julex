import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { AddTenantModal } from '../../components/super-admin/AddTenantModal';
import { NewBroadcastModal } from '../../components/super-admin/NewBroadcastModal';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  Store,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  ArrowUpRight,
  ArrowRight,
  AlertTriangle,
  PlusCircle,
  Bell
} from 'lucide-react';

export const OverviewPage = () => {
  const {
    metrics,
    atRiskSubscriptions,
    auditLogs,
    signupVelocity7Days,
  } = useSuperAdmin();

  const [isAddTenantOpen, setAddTenantOpen] = useState(false);
  const [isBroadcastOpen, setBroadcastOpen] = useState(false);
  const navigate = useNavigate();

  // Pie chart data for store status distribution (Gold & Neutral palette)
  const statusDistributionData = [
    { name: 'Active Paid', value: (metrics?.activeStores ?? 0), color: '#D4A017' },
    { name: 'Trialing', value: (metrics?.trialingStores ?? 0), color: '#F5C842' },
    { name: 'Free Tier', value: (metrics?.freeStores ?? 0), color: '#94A3B8' },
    { name: 'Suspended', value: (metrics?.suspendedStores ?? 0), color: '#E2E8F0' },
  ];

  return (
    <div className="space-y-6">
      {/* Modals */}
      <AddTenantModal isOpen={isAddTenantOpen} onClose={() => setAddTenantOpen(false)} />
      <NewBroadcastModal isOpen={isBroadcastOpen} onClose={() => setBroadcastOpen(false)} />

      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Master Executive Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              Live SaaS Telemetry
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Global metrics across multi-tenant D2C storefronts, retail categories, and subscription pipelines.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBroadcastOpen(true)}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
          >
            <Bell className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Dispatch Broadcast
          </button>
          <button
            onClick={() => setAddTenantOpen(true)}
            className="px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Provision New Store
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Stores */}
        <div className="p-5 rounded-2xl border transition shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Total Stores
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-serif" style={{ color: 'var(--text-primary)' }}>
              {(metrics?.totalStores ?? 0)}
            </span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" /> +{(metrics?.recent7DaySignups ?? 0)} this wk
            </span>
          </div>

          <div className="mt-3 pt-3 grid grid-cols-4 gap-1 text-center text-[11px]" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">
              <div className="font-bold">{(metrics?.activeStores ?? 0)}</div>
              <div className="text-[10px]">Active</div>
            </div>
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20">
              <div className="font-bold">{(metrics?.trialingStores ?? 0)}</div>
              <div className="text-[10px]">Trial</div>
            </div>
            <div className="p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-card)' }}>
              <div className="font-bold">{(metrics?.freeStores ?? 0)}</div>
              <div className="text-[10px]">Free</div>
            </div>
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-500 font-medium border border-rose-500/20">
              <div className="font-bold">{(metrics?.suspendedStores ?? 0)}</div>
              <div className="text-[10px]">Susp.</div>
            </div>
          </div>
        </div>

        {/* KPI 2: Estimated MRR */}
        <div className="p-5 rounded-2xl border transition shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Normalized MRR
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: 'var(--accent)' }}>
              ₹{(metrics?.estimatedMRR ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/month</span>
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between text-[11px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>Monthly + (6Mo/6) + (1Yr/12)</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>100% Retained</span>
          </div>
        </div>

        {/* KPI 3: Estimated ARR */}
        <div className="p-5 rounded-2xl border transition shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Annualized ARR
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
              ₹{((metrics?.estimatedARR ?? 0)).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>ARR Run-Rate</span>
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between text-[11px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>MRR × 12 Multiplier</span>
            <span className="font-bold text-emerald-500">+28% YoY</span>
          </div>
        </div>

        {/* KPI 4: Platform GMV */}
        <div className="p-5 rounded-2xl border transition shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Platform GMV
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
              ₹{((metrics?.totalPlatformGMV ?? 0) / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({(metrics?.totalPlatformOrders ?? 0)} Orders)</span>
          </div>
        </div>
      </div>

      {/* 3. Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Velocity Bar Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>7-Day Tenant Signup & Conversion Velocity</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Daily store onboarding vs paid plan activations</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--accent)' }}>
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D4A017]" /> New Signups
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" /> Paid Conversions
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupVelocity7Days} margin={{ top: 10, right: 10, left: -16, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={{ stroke: 'rgba(150,150,150,0.25)' }} tickFormatter={(v) => String(v).split(',')[0]} interval="preserve-start-end" />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={40} label={{ value: 'Stores', angle: -90, position: 'insideLeft', offset: 18, style: { fontSize: 11, fill: 'var(--text-muted)' } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-card)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                  cursor={{ fill: 'rgba(212, 160, 23, 0.08)' }}
                />
                <Bar dataKey="signups" fill="#D4A017" radius={[4, 4, 0, 0]} name="New Store Signups" maxBarSize={26} />
                <Bar dataKey="conversions" fill="#10B981" radius={[4, 4, 0, 0]} name="Paid Conversions" maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Store Status Donut Chart */}
        <div className="lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Store Status Distribution</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active vs Trialing vs Suspended ratios</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-card)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-serif" style={{ color: 'var(--text-primary)' }}>{(metrics?.totalStores ?? 0)}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Stores</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {statusDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* At-Risk Watchlist */}
        <div className="lg:col-span-6 p-5 rounded-2xl border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>At-Risk Accounts Watchlist</h3>
            </div>
            <Link
              to="/super-admin/revenue"
              className="text-xs font-semibold flex items-center gap-1 transition"
              style={{ color: 'var(--accent)' }}
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {atRiskSubscriptions.slice(0, 3).map((risk) => (
              <div
                key={risk.id}
                className="p-3 rounded-2xl border transition flex items-center justify-between gap-3 text-xs"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
              >
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {risk.storeName}
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {risk.type === 'past_due' ? 'Card Failed' : 'Trial Ending'}
                    </span>
                  </div>
                  <p className="text-[11px] truncate max-w-sm" style={{ color: 'var(--text-muted)' }}>{risk.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                    ₹{risk.amountINR.toLocaleString('en-IN')}
                  </span>
                  <div className="text-[10px] font-semibold text-amber-500">
                    Due in {risk.daysRemainingOrOverdue}d
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Audit Feed */}
        <div className="lg:col-span-6 p-5 rounded-2xl border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Live Master Audit Stream</h3>
            </div>
            <Link
              to="/super-admin/audit-logs"
              className="text-xs font-semibold flex items-center gap-1 transition"
              style={{ color: 'var(--accent)' }}
            >
              Full Logs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl border flex items-start justify-between gap-3 text-xs"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={log.adminAvatar}
                    alt={log.adminName}
                    className="w-6 h-6 rounded-full object-cover mt-0.5 shrink-0"
                    style={{ border: '1px solid var(--border-card)' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{log.actionType}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)' }}>
                        @{log.targetTenantName}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{log.reason}</p>
                  </div>
                </div>
                <div className="text-[10px] shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
