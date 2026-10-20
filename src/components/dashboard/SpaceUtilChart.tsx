'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { ZoneUtilization, StockTrend } from '@/types';

// ---------------------------------------------------------------------------
// SpaceUtilChart — Bar chart of zone utilization + Area chart of stock trends
// ---------------------------------------------------------------------------
interface SpaceUtilChartProps {
  zoneData: ZoneUtilization[];
  trendData: StockTrend[];
}

/* Custom tooltip styling */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-[var(--color-border-default)]">
      <p className="font-semibold text-[var(--color-text-primary)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          {entry.name}: {entry.value}
          {entry.name === 'utilization' ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export default function SpaceUtilChart({ zoneData, trendData }: SpaceUtilChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--dashboard-gap, 28px)' }}>
      {/* --- Zone Utilization Bar Chart --- */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 tracking-tight">
          Space Utilization by Zone
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={zoneData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis
              dataKey="zoneName"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="utilization"
              name="utilization"
              radius={[6, 6, 0, 0]}
              fill="url(#barGradient)"
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- Stock Level Trends Area Chart --- */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 tracking-tight">
          Stock Level Trends (7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="areaAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="areaOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="areaRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="inStock"  name="In Stock"  stroke="#10b981" fill="url(#areaGreen)"  strokeWidth={2} />
            <Area type="monotone" dataKey="low"      name="Low"       stroke="#f59e0b" fill="url(#areaAmber)"  strokeWidth={2} />
            <Area type="monotone" dataKey="critical"  name="Critical"  stroke="#f97316" fill="url(#areaOrange)" strokeWidth={2} />
            <Area type="monotone" dataKey="stockout"  name="Stockout"  stroke="#ef4444" fill="url(#areaRed)"    strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
