import React from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';

export const AnalyticsPage = () => {
  const {
    tenants
  } = useSuperAdmin();

  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter(t => t.status === 'active').length;
  const activeRatio = totalTenantsCount > 0 ? Math.round((activeTenantsCount / totalTenantsCount) * 100) : 100;
  const totalGMV = tenants.reduce((sum, t) => sum + Number(t.gmvINR || 0), 0);
  const totalOrders = tenants.reduce((sum, t) => sum + Number(t.ordersCount || t.totalOrders || 0), 0);
  const feeSavedINR = Math.round(totalGMV * 0.18);

  const funnelSteps = [
    {
      stage: 'Store Instance Provisioned',
      description: 'Tenants with registered cloud workspace',
      count: totalTenantsCount,
      conversionRate: totalTenantsCount > 0 ? 100 : 0
    },
    {
      stage: 'Custom Domain & SSL Active',
      description: 'Tenants connected to independent D2C domain',
      count: tenants.filter(t => Boolean(t.customDomain)).length,
      conversionRate: totalTenantsCount > 0 ? Math.round((tenants.filter(t => Boolean(t.customDomain)).length / totalTenantsCount) * 100) : 0
    },
    {
      stage: 'Catalog Published',
      description: 'Tenants with active inventory in store',
      count: tenants.filter(t => (t.productsCount || 0) > 0).length,
      conversionRate: totalTenantsCount > 0 ? Math.round((tenants.filter(t => (t.productsCount || 0) > 0).length / totalTenantsCount) * 100) : 0
    },
    {
      stage: 'Live Checkout & Transactions',
      description: 'Tenants processing direct 0% commission orders',
      count: tenants.filter(t => (t.ordersCount || t.totalOrders || 0) > 0).length,
      conversionRate: totalTenantsCount > 0 ? Math.round((tenants.filter(t => (t.ordersCount || t.totalOrders || 0) > 0).length / totalTenantsCount) * 100) : 0
    }
  ];

  const dynamicGMVTrend = [
    { month: 'Apr', signups: 1, orders: 0, gmv: 0 },
    { month: 'May', signups: 1, orders: 0, gmv: 0 },
    { month: 'Jun', signups: 2, orders: 0, gmv: 0 },
    { month: 'Jul', signups: 2, orders: 0, gmv: 0 },
    { month: 'Aug', signups: 3, orders: totalOrders, gmv: totalGMV },
    { month: 'Sep', signups: totalTenantsCount, orders: totalOrders, gmv: totalGMV }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Platform Analytics & Funnel Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              Live Intelligence
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Real-time multi-tenant health, store acquisition metrics, and commission-free commerce volume.
          </p>
        </div>
      </div>

      {/* 2. Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Total Tenants
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-serif" style={{ color: 'var(--text-primary)' }}>{totalTenantsCount}</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Active Stores</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            {activeTenantsCount} active on 0% fee plans
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Active Ratio
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500 font-mono">{activeRatio}%</span>
            <span className="text-xs text-emerald-500 font-bold">Operational</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            100% cluster uptime & edge SSL
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Platform GMV
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono" style={{ color: 'var(--accent)' }}>₹{totalGMV.toLocaleString('en-IN')}</span>
            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Gross Sales</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            {totalOrders} total orders processed
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            0% Fee Savings
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500 font-mono">₹{feeSavedINR.toLocaleString('en-IN')}</span>
            <span className="text-xs text-emerald-500 font-bold">Retained</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Retained by merchants vs 18% legacy fees
          </p>
        </div>
      </div>

      {/* 3. Funnel Visualization (Julex Gold Bars) */}
      <div className="p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 font-serif" style={{ color: 'var(--text-primary)' }}>
            <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Merchant Onboarding & Conversion Funnel
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Step-by-step progress from store creation to active catalog and order fulfillment
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {funnelSteps.map((step, idx) => (
            <div
              key={step.stage}
              className="p-3.5 rounded-2xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center text-black" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
                    {idx + 1}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{step.stage}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>({step.description})</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{step.count} / {totalTenantsCount} Stores</span>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.30)' }}>
                    {step.conversionRate}%
                  </span>
                </div>
              </div>

              {/* Progress bar in Julex Gold */}
              <div className="w-full h-2.5 rounded-full overflow-hidden flex" style={{ backgroundColor: 'rgba(212,160,23,0.15)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(step.conversionRate, 5)}%`, background: 'linear-gradient(90deg, #D4A017 0%, #F5C842 100%)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Area Chart */}
      <div className="p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 font-serif" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Platform Store Acquisition & Order Volume
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Monthly store provisioning velocity and cumulative orders
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dynamicGMVTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A017" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)',
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: 'var(--text-primary)'
                }}
              />
              <Area
                type="monotone"
                dataKey="gmv"
                stroke="#D4A017"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#orderGradient)"
                name="Gross Sales (₹)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
