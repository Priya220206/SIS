'use client';

import { AlertTriangle, AlertOctagon, AlertCircle } from 'lucide-react';
import { StockAlert } from '@/types';
import { cn, timeAgo } from '@/lib/utils';

// ---------------------------------------------------------------------------
// AlertsFeed — Live feed of stockout and low-stock alerts
// ---------------------------------------------------------------------------
interface AlertsFeedProps {
  alerts: StockAlert[];
  maxItems?: number;
}

const severityConfig = {
  stockout: {
    icon: AlertOctagon,
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    iconColor: 'text-red-400',
    label: 'STOCKOUT',
    labelBg: 'bg-red-400/15 text-red-400',
  },
  critical: {
    icon: AlertTriangle,
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    iconColor: 'text-orange-400',
    label: 'CRITICAL',
    labelBg: 'bg-orange-400/15 text-orange-400',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    iconColor: 'text-amber-400',
    label: 'LOW',
    labelBg: 'bg-amber-400/15 text-amber-400',
  },
};

export default function AlertsFeed({ alerts, maxItems = 8 }: AlertsFeedProps) {
  const displayAlerts = alerts.slice(0, maxItems);

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
          Active Alerts
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-400/15 text-red-400">
          {alerts.length} total
        </span>
      </div>

      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
        {displayAlerts.map((alert, idx) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-lg border transition-all hover:scale-[1.01]',
                config.bg,
                config.border,
                'animate-slide-in'
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <Icon size={16} className={cn('flex-shrink-0', config.iconColor)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('badge text-[10px] py-0', config.labelBg)}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {alert.zoneName} · {alert.shelfCode}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed truncate">
                  {alert.message}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  {timeAgo(alert.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
