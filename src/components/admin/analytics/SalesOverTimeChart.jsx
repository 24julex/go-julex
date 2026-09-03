import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 rounded-3xl border shadow-2xl text-xs space-y-2.5 min-w-[240px]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="font-bold">{label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', borderColor: 'rgba(212,160,23,0.25)' }}>
            {data.ordersCount} Orders Placed
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Gross Sales:</span>
            <span>₹{Number(data.grossSales || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between font-bold" style={{ color: 'var(--accent)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>0% Platform Fee:</span>
            <span className="text-emerald-500 font-bold">₹0 (100% Retained)</span>
          </div>

          <div className="pt-2 border-t flex justify-between font-bold text-emerald-500 text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
            <span>(=) Net Revenue:</span>
            <span>₹{Number(data.netRevenue || data.grossSales || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SalesOverTimeChart = ({ orders = [], datePreset = 'Last 30 Days' }) => {
  const timeSeriesData = useMemo(() => {
    if (!orders || orders.length === 0) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
      return days.map((d) => ({
        date: d,
        grossSales: 0,
        netRevenue: 0,
        ordersCount: 0
      }));
    }

    const dateMap = new Map();
    orders.forEach((o) => {
      const dStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent';
      const amt = Number(o.totalINR || o.totalAmount || o.totalAmountINR || o.actualCostINR || 0);
      const existing = dateMap.get(dStr) || {
        date: dStr,
        grossSales: 0,
        netRevenue: 0,
        ordersCount: 0
      };
      existing.grossSales += amt;
      existing.netRevenue += amt;
      existing.ordersCount += 1;
      dateMap.set(dStr, existing);
    });

    return Array.from(dateMap.values());
  }, [orders]);

  const totalSalesInRange = useMemo(() => {
    return timeSeriesData.reduce((acc, curr) => acc + curr.grossSales, 0);
  }, [timeSeriesData]);

  return (
    <div className="p-6 rounded-3xl border space-y-6 shadow-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Gross & Net Sales Over Time
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ backgroundColor: 'rgba(212,160,23,0.12)', color: 'var(--accent)', borderColor: 'rgba(212,160,23,0.25)' }}>
              Real-Time Orders
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Total sales generated across all sales channels for {datePreset}.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider block font-bold" style={{ color: 'var(--text-muted)' }}>Total Sales</span>
          <span className="font-mono text-xl font-bold" style={{ color: 'var(--accent)' }}>
            ₹{totalSalesInRange.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A017" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="grossSales"
              stroke="#D4A017"
              strokeWidth={2.5}
              fill="url(#salesGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {orders.length === 0 && (
        <div className="p-4 rounded-2xl border text-center text-xs" style={{ backgroundColor: 'rgba(212,160,23,0.10)', borderColor: 'rgba(212,160,23,0.25)', color: 'var(--text-primary)' }}>
          ✨ No customer orders placed yet. Share your store link with customers to track live sales here!
        </div>
      )}
    </div>
  );
};
