'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import TopBar from '@/components/layout/TopBar';
import {
  replenishmentTasks,
  optimizedRoute,
  storeZones,
  shelfUnits,
  STORE_DIMENSIONS,
  BACKROOM_POSITION,
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Route,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Footprints,
  Zap,
} from 'lucide-react';

// Dynamic import for route visualizer (uses Konva)
const RouteVisualizer = dynamic(
  () => import('@/components/replenishment/RouteVisualizer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] glass-card">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-cyan)] border-t-transparent animate-spin" />
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Replenishment Hub — Optimized route display with turn-by-turn instructions
// ---------------------------------------------------------------------------
export default function ReplenishmentPage() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const progress = (completedTasks.size / replenishmentTasks.length) * 100;

  // Map task IDs in optimized order
  const orderedTasks = useMemo(() => {
    return optimizedRoute.sequence.map(
      (taskId) => replenishmentTasks.find((t) => t.id === taskId)!
    );
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar title="Replenishment Hub" />

      <div className="page-content page-stack">
        <div>
          <h1 className="text-[21px] font-medium tracking-tight text-[var(--color-text-primary)]">Restock &amp; Orders</h1>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Plan a quick route and keep shelves stocked.</p>
        </div>

        {/* --- Route Stats Bar --- */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/15 flex items-center justify-center">
              <Route size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {optimizedRoute.totalDistance}m
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                Total Distance
              </p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {optimizedRoute.estimatedTime} min
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                Est. Time
              </p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/15 flex items-center justify-center">
              <MapPin size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {optimizedRoute.directions.length}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                Stops
              </p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/15 flex items-center justify-center">
              <Zap size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-400">
                {Math.round(progress)}%
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">
                Completed
              </p>
            </div>
          </div>
        </div>

        {/* --- Progress Bar --- */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              Route Progress
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {completedTasks.size} of {replenishmentTasks.length} items restocked
            </span>
          </div>
          <div className="progress-bar h-2">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: 'var(--gradient-success)',
              }}
            />
          </div>
        </div>

        {/* --- Route Map + Task List --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Route Visualization */}
          <div>
            <RouteVisualizer
              zones={storeZones}
              shelves={shelfUnits}
              route={optimizedRoute}
              completedTasks={completedTasks}
              storeDimensions={STORE_DIMENSIONS}
              backroomPosition={BACKROOM_POSITION}
            />
          </div>

          {/* Turn-by-turn Task List */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Footprints size={18} className="text-[var(--color-accent-cyan)]" />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Turn-by-Turn Route
              </h3>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {optimizedRoute.directions.map((dir, idx) => {
                const task = orderedTasks[idx];
                const isCompleted = completedTasks.has(task.id);

                return (
                  <div
                    key={dir.stepNumber}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-all',
                      isCompleted
                        ? 'bg-emerald-400/5 border-emerald-400/20 opacity-60'
                        : 'bg-[var(--color-bg-input)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-accent)]'
                    )}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox mt-0.5"
                    />

                    {/* Step number */}
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                        isCompleted
                          ? 'bg-emerald-400/20 text-emerald-400'
                          : 'bg-cyan-400/15 text-cyan-400'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        dir.stepNumber
                      )}
                    </div>

                    {/* Direction details */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium mb-0.5',
                          isCompleted
                            ? 'text-[var(--color-text-muted)] line-through'
                            : 'text-[var(--color-text-primary)]'
                        )}
                      >
                        {dir.productName}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
                        {dir.instruction}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <ArrowRight size={10} />
                          Shelf {dir.targetShelf}
                        </span>
                        <span>{dir.distance}m</span>
                        <span className="badge bg-cyan-400/10 text-cyan-400 border-cyan-400/20 text-[10px]">
                          ×{dir.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
