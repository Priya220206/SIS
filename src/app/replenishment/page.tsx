'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import TopBar from '@/components/layout/TopBar';
import { storeRequest, useStoreData } from '@/lib/store-context';
import { BACKROOM_POSITION, buildOptimizedRoute, getStoreDimensions } from '@/lib/store-data';
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
import StoreDataStatus from '@/components/data/StoreDataStatus';
import type { ShelfUnit, StoreZone, ReplenishmentTask } from '@/types';

const EMPTY_ZONES: StoreZone[] = [];
const EMPTY_SHELVES: ShelfUnit[] = [];
const EMPTY_TASKS: ReplenishmentTask[] = [];

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
  const { data, loading, error, refresh } = useStoreData();
  const [actionError, setActionError] = useState('');
  const storeZones = data?.zones ?? EMPTY_ZONES;
  const shelfUnits = data?.shelves ?? EMPTY_SHELVES;
  const replenishmentTasks = data?.replenishmentTasks ?? EMPTY_TASKS;
  const pendingTasks = replenishmentTasks.filter((task) => !task.completed);
  const completedCount = replenishmentTasks.length - pendingTasks.length;
  const optimizedRoute = useMemo(
    () => buildOptimizedRoute(pendingTasks, shelfUnits),
    [pendingTasks, shelfUnits]
  );
  const completedTasks = new Set(replenishmentTasks.filter((task) => task.completed).map((task) => task.id));

  const completeTask = async (taskId: string) => {
    try {
      setActionError('');
      await storeRequest(`/api/store/tasks/${encodeURIComponent(taskId)}`, 'PATCH');
      await refresh();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not complete the task.');
    }
  };

  const progress = replenishmentTasks.length ? (completedCount / replenishmentTasks.length) * 100 : 0;

  // Map task IDs in optimized order
  const orderedTasks = useMemo(() => {
    const taskById = new Map(pendingTasks.map((task) => [task.id, task]));
    return optimizedRoute.sequence.flatMap((taskId) => {
      const task = taskById.get(taskId);
      return task ? [task] : [];
    });
  }, [optimizedRoute.sequence, pendingTasks]);

  if (!data) return <StoreDataStatus loading={loading} error={error} />;

  return (
    <div className="min-h-screen">
      <TopBar title="Replenishment Hub" />

      <div className="page-content page-stack">
        <StoreDataStatus loading={loading} error={error} />
        {actionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{actionError}</p>}
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
              {completedCount} of {replenishmentTasks.length} items restocked
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
              storeDimensions={getStoreDimensions(storeZones)}
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
                if (!task) return null;
                const isCompleted = task.completed;

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
                      onChange={() => void completeTask(task.id)}
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
              {!optimizedRoute.directions.length && (
                <p className="rounded-lg bg-[var(--color-bg-input)] p-4 text-xs text-[var(--color-text-muted)]">
                  No pending replenishment tasks are in the database.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
