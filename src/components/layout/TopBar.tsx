'use client';

import { Search, Bell, Languages, ScanLine } from 'lucide-react';
import { stockAlerts } from '@/data/mockData';

// ---------------------------------------------------------------------------
// TopBar — Persistent header with search and notifications
// ---------------------------------------------------------------------------
export default function TopBar({ title }: { title: string }) {
  const criticalCount = stockAlerts.filter(
    (a) => a.severity === 'stockout' || a.severity === 'critical'
  ).length;

  return (
    <header aria-label={title} className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] bg-white px-5 sm:px-6">
      {/* --- Page Title --- */}
      <div>
        <h1 className="text-[13px] font-medium text-[var(--color-text-primary)] tracking-tight">
          Good Morning, Shopkeeper!
        </h1>
        <p className="mt-0.5 text-[9px] text-[var(--color-text-muted)]">
          Monday, 19 October 2026
        </p>
      </div>

      {/* --- Actions --- */}
      <div className="flex min-w-0 shrink items-center gap-3">
        {/* Search */}
        <div className="relative hidden min-w-[180px] max-w-[300px] flex-1 md:block">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="Search products, barcode or shelf"
            className="w-full rounded-lg border border-[var(--color-border-default)] bg-[#f7f9fa] py-2 pl-8 pr-8 text-[9px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-cyan)] focus:outline-none"
          />
          <ScanLine size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-accent-cyan)]" />
        </div>

        {/* Notifications */}
        <button aria-label={`${criticalCount} notifications`} className="relative rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-input)]">
          <Bell size={15} />
          {criticalCount > 0 && (
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500">
            </span>
          )}
        </button>

        <button className="hidden items-center gap-1 text-[9px] text-[var(--color-text-primary)] sm:flex">
          <Languages size={13} className="text-[var(--color-text-muted)]" />
          English / हिन्दी <span className="text-[var(--color-text-muted)]">⌄</span>
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e7f3f1] text-[9px] font-medium text-[#0b837a]">RS</div>
      </div>
    </header>
  );
}
