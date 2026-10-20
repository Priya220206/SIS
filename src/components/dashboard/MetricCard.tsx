'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// MetricCard — Glassmorphic KPI card with icon, value, label, and trend
// ---------------------------------------------------------------------------
interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  glowClass?: string;
  accentColor?: string;
  pulse?: boolean;
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  glowClass = '',
  accentColor = 'var(--color-accent-cyan)',
  pulse = false,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5 relative overflow-hidden group flex flex-col justify-between min-h-[168px]',
        glowClass
      )}
    >
      {/* Background accent glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20 pointer-events-none"
        style={{ background: accentColor }}
      />

      {/* Header row: icon + trend badge */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner"
          style={{ background: `${accentColor}18` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>

        {trend ? (
          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full leading-none flex items-center gap-1 shrink-0 border',
              trend.positive
                ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20'
                : 'bg-red-400/15 text-red-400 border-red-400/20'
            )}
          >
            <span>{trend.positive ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </span>
        ) : (
          <div className="h-6" aria-hidden="true" />
        )}
      </div>

      {/* Value, Label, and Subtitle */}
      <div className="relative z-10 flex flex-col justify-end">
        <p
          className={cn(
            'text-3xl font-bold tracking-tight leading-tight',
            pulse && 'pulse-critical'
          )}
          style={{ color: accentColor }}
        >
          {value}
        </p>
        <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-1.5 truncate">
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
