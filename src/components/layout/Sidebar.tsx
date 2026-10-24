'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Package,
  RotateCcw,
  PencilRuler,
  ChevronLeft,
  ChevronRight,
  Store,
  Headset,
  CircleCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStoreData } from '@/lib/store-context';

// ---------------------------------------------------------------------------
// Navigation Items Configuration
// ---------------------------------------------------------------------------
const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/inventory', label: 'My Products', icon: Package },
  { href: '/floor-map', label: 'Shop Layout', icon: Map },
  { href: '/replenishment', label: 'Restock & Orders', icon: RotateCcw },
];

// ---------------------------------------------------------------------------
// Sidebar Component
// ---------------------------------------------------------------------------
export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data, error, loading } = useStoreData();
  const pendingTasks = data?.replenishmentTasks.filter((task) => !task.completed).length ?? 0;
  const connectionStatus = error ? 'Database unavailable' : loading ? 'Connecting to Turso' : 'Turso connected';

  // Keep main-content margin in sync with sidebar width
  useEffect(() => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      const sidebarWidth = collapsed ? '68px' : '160px';
      mainEl.style.marginLeft = sidebarWidth;
      mainEl.style.width = `calc(100% - ${sidebarWidth})`;
    }
  }, [collapsed]);

  return (
    <aside
      className={cn(
        'sidebar fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[160px]'
      )}
    >
      {/* --- Logo / Brand --- */}
      <div className={cn('flex items-center gap-2 px-3 py-4', collapsed && 'justify-center px-2')}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Store size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-slide-in min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
              SIM
            </h1>
            <p className="text-[7px] font-medium text-[var(--color-text-muted)] whitespace-nowrap">
              A place for everything.
            </p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="mx-2 mb-2 rounded-lg bg-[#f4f7f8] px-2.5 py-2">
          <p className="truncate text-[9px] font-medium text-[var(--color-text-primary)]">Store workspace</p>
          <p className="mt-0.5 truncate text-[8px] text-[var(--color-text-muted)]">{connectionStatus}</p>
        </div>
      )}

      {/* --- Navigation --- */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-0')}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={15}
                className="flex-shrink-0"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {!collapsed && (
                <span className="animate-slide-in whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {!collapsed && item.href === '/replenishment' && (
                <span className="ml-auto rounded bg-[#fff0dc] px-1 text-[8px] font-medium text-[#b7691f]">
                  {pendingTasks}
                </span>
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <>
            <p className="px-2 pt-5 pb-1 text-[7px] uppercase tracking-wide text-[var(--color-text-muted)]">Optional tools</p>
            <Link
              href="/layout-editor"
              className={cn('nav-item', pathname === '/layout-editor' && 'active')}
            >
              <PencilRuler size={15} />
              <span className="whitespace-nowrap">Edit store layout</span>
            </Link>
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="mx-2 mb-2 rounded-lg bg-[#f0f8f6] p-2">
          <div className="mb-1 flex items-center gap-1.5 text-[#0d837a]">
            <Headset size={13} />
            <span className="text-[9px] font-semibold">A little help, anytime.</span>
          </div>
          <p className="text-[8px] leading-4 text-[var(--color-text-muted)]">We&apos;re here in English &amp; Hindi.</p>
          <button className="mt-1 text-[8px] font-medium text-[#0d837a]">Contact support →</button>
        </div>
      )}

      <div className="flex items-center gap-1.5 px-3 py-3 text-[8px] text-[var(--color-text-muted)]">
        <CircleCheck size={11} className="text-[#198d69]" />
        {!collapsed && <span className="whitespace-nowrap">{error ? 'Database sync error' : 'Database refresh · 5 seconds'}</span>}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-2 top-5 hidden h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-white text-[var(--color-text-muted)] shadow-sm md:flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
