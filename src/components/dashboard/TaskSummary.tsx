'use client';

import { ReplenishmentTask } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// TaskSummary — Compact summary of pending replenishment tasks
// ---------------------------------------------------------------------------
interface TaskSummaryProps {
  tasks: ReplenishmentTask[];
  maxItems?: number;
}

const priorityConfig = {
  high:   { color: 'text-red-400',    bg: 'bg-red-400/15 text-red-400 border-red-400/30',    dot: 'bg-red-400' },
  medium: { color: 'text-amber-400',  bg: 'bg-amber-400/15 text-amber-400 border-amber-400/30', dot: 'bg-amber-400' },
  low:    { color: 'text-blue-400',   bg: 'bg-blue-400/15 text-blue-400 border-blue-400/30',   dot: 'bg-blue-400' },
};

export default function TaskSummary({ tasks, maxItems = 6 }: TaskSummaryProps) {
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const progress = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
          Pending Tasks
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            {completed.length}/{tasks.length}
          </span>
          <CheckCircle2 size={14} className="text-emerald-400" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-4">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            background: 'var(--gradient-success)',
          }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-2">
        {pending.slice(0, maxItems).map((task, idx) => {
          const config = priorityConfig[task.priority];
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3.5 rounded-lg bg-[var(--color-bg-input)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-accent)] transition-all animate-slide-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {task.productName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-[var(--color-text-muted)]" />
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {task.fromLocation}
                  </span>
                  <ArrowRight size={8} className="text-[var(--color-text-muted)]" />
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {task.toShelfCode}
                  </span>
                </div>
              </div>
              <span className={cn('badge text-[10px]', config.bg)}>
                ×{task.quantity}
              </span>
            </div>
          );
        })}
      </div>

      {pending.length > maxItems && (
        <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
          +{pending.length - maxItems} more tasks
        </p>
      )}
    </div>
  );
}
