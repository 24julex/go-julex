import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  ShoppingBag,
  TrendingUp,
  Crown
} from 'lucide-react';

export const GMVPage = () => {
  const { metrics, tenants, platformGMVTrend } = useSuperAdmin();

  const [timeRange, setTimeRange] = useState('1Y');
  const formatGMV = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const topTenantsLeaderboard = [...tenants].sort((a, b) => (b.gmvINR || 0) - (a.gmvINR || 0));

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Orders & Platform GMV Tracking
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', border: '1px solid rgba(212,160,23,0.25)' }}>
              {formatGMV(metrics?.totalPlatformGMV)} Processed
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Real-time multi-tenant aggregate transaction volume, retail orders, and merchant earnings.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 border rounded-2xl text-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          {['30D', '90D', '1Y', 'ALL'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                timeRange === range ? 'text-black' : ''
              }`}
              style={timeRange === range ? {
                background: 'linear-gradient(135deg, #D4A017, #F5C842)',
              } : {
                color: 'var(--text-secondary)',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top 4 GMV Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Total Platform GMV
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
              {formatGMV(metrics?.totalPlatformGMV)}
            </span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Cumulative gross order value across all stores
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Total Orders Processed
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-serif" style={{ color: 'var(--accent)' }}>
              {(metrics?.totalPlatformOrders ?? 0)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Orders</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            100% direct maker-to-consumer dispatch
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Merchant 0% Fee Savings
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500 font-mono">
              ₹{(metrics?.totalFeeSavedINR ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Savings vs 18% legacy marketplace take rates
          </p>
        </div>

        <div className="p-5 rounded-3xl border shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Average Order Value (AOV)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono" style={{ color: 'var(--text-primary)' }}>
              ₹{metrics?.totalPlatformOrders ? Math.round(metrics.totalPlatformGMV / metrics.totalPlatformOrders).toLocaleString('en-IN') : '3,120'}
            </span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Across all active product verticals
          </p>
        </div>
      </div>

      {/* 3. Trajectory Area Chart */}
      <div className="p-5 rounded-3xl border space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2 font-serif" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Platform GMV Velocity Trajectory (INR ₹)
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>12-Month platform transaction growth curve</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={platformGMVTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A017" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                  color: 'var(--text-primary)'
                }}
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Gross Sales']}
              />
              <Area
                type="monotone"
                dataKey="gmv"
                stroke="#D4A017"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gmvGradient)"
                name="GMV (₹)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Top Performing Merchant Stores Leaderboard */}
      <div className="border rounded-3xl p-5 space-y-4 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h3 className="font-bold text-sm font-serif" style={{ color: 'var(--text-primary)' }}>Top Grossing Merchant Leaderboard</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topTenantsLeaderboard.slice(0, 4).map((tenant, idx) => (
            <div
              key={tenant.id}
              className="p-4 rounded-2xl border space-y-2 relative overflow-hidden"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-card)' }}
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full font-black text-xs flex items-center justify-center text-black" style={{ background: 'linear-gradient(135deg, #D4A017, #F5C842)' }}>
                  #{idx + 1}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(212,160,23,0.15)', color: 'var(--accent)' }}>
                  0% Fee Plan
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{tenant.name}</h4>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tenant.category}</p>
              </div>
              <div className="pt-2 border-t flex items-baseline justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Gross Sales:</span>
                <span className="font-bold font-mono text-sm" style={{ color: 'var(--accent)' }}>
                  ₹{(tenant.gmvINR ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
