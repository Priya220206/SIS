'use client';

import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import { getStockStatus } from '@/types';
import { useStoreData } from '@/lib/store-context';
import StoreDataStatus from '@/components/data/StoreDataStatus';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ClipboardList,
  Package,
  Plus,
  ScanLine,
  ShoppingCart,
} from 'lucide-react';

const categoryColors = ['#0b8981', '#6298bd', '#9582ba', '#d2ad70', '#93bbb4', '#899ba8'];

export default function DashboardPage() {
  const { data, loading, error } = useStoreData();
  if (!data) return <StoreDataStatus loading={loading} error={error} />;

  const { inventoryItems, replenishmentTasks, zones: storeZones, shelves: shelfUnits } = data;
  const stockAlerts = inventoryItems
    .filter((item) => getStockStatus(item) !== 'in-stock')
    .map((item) => {
      const status = getStockStatus(item);
      return {
        id: item.id,
        productName: item.product.name,
        severity: status === 'stockout' ? 'stockout' : status === 'critical' ? 'critical' : 'warning',
        message: status === 'stockout'
          ? `${item.product.name} is out of stock on ${item.shelf.code}`
          : `${item.product.name} is low (${item.quantity}/${item.reorderPoint}) on ${item.shelf.code}`,
      };
    });
  const dashboardMetrics = {
    totalSKUs: new Set(inventoryItems.map((item) => item.productId)).size,
    itemsBelowReorder: stockAlerts.length,
    totalShelves: shelfUnits.length,
    spaceUtilization: shelfUnits.length
      ? Math.round(shelfUnits.reduce((sum, shelf) => sum + shelf.fillPercentage, 0) / shelfUnits.length)
      : 0,
  };
  const zoneUtilization = storeZones.map((zone) => {
    const zoneShelves = shelfUnits.filter((shelf) => shelf.zoneId === zone.id);
    return {
      zoneName: zone.name,
      utilization: zoneShelves.length
        ? Math.round(zoneShelves.reduce((sum, shelf) => sum + shelf.fillPercentage, 0) / zoneShelves.length)
        : 0,
      color: zone.color,
    };
  });

  const categories = Array.from(
    inventoryItems.reduce((counts, item) => {
      counts.set(item.product.category, (counts.get(item.product.category) ?? 0) + 1);
      return counts;
    }, new Map<string, number>())
  ).map(([name, count], index) => ({
    name,
    count,
    color: categoryColors[index % categoryColors.length],
  }));
  const categoryTotal = categories.reduce((sum, category) => sum + category.count, 0);
  let categoryStart = 0;
  const categoryGradient = categories
    .map((category) => {
      const end = categoryStart + (category.count / categoryTotal) * 100;
      const segment = `${category.color} ${categoryStart}% ${end}%`;
      categoryStart = end;
      return segment;
    })
    .join(', ');

  const cards = [
    {
      label: 'Total products',
      value: dashboardMetrics.totalSKUs.toLocaleString(),
      note: `${storeZones.length} categories`,
      icon: Package,
      color: '#4e8fba',
    },
    {
      label: 'Stock running low',
      value: `${dashboardMetrics.itemsBelowReorder} items`,
      note: 'Need attention',
      icon: AlertTriangle,
      color: '#d97724',
    },
    {
      label: 'Restock orders',
      value: replenishmentTasks.filter((task) => !task.completed).length.toString(),
      note: 'Ready to review',
      icon: ShoppingCart,
      color: '#0c9187',
    },
    {
      label: 'Store shelves',
      value: dashboardMetrics.totalShelves.toString(),
      note: `${dashboardMetrics.spaceUtilization}% average utilization`,
      icon: BarChart3,
      color: '#8f7ab4',
    },
  ];

  const maxUtilization = Math.max(...zoneUtilization.map((zone) => zone.utilization));

  return (
    <div className="min-h-screen">
      <TopBar title="Home" />

      <div className="page-content page-stack">
        <StoreDataStatus loading={loading} error={error} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[21px] font-medium tracking-tight text-[var(--color-text-primary)]">
              Your shop, at a glance
            </h1>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
              Everything you need for a well-stocked, happy shop.
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-white px-3 py-2 text-[10px] font-medium text-[var(--color-text-primary)]">
            <CalendarDays size={13} className="text-[var(--color-accent-cyan)]" />
            Live inventory
          </button>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4" aria-label="Store summary">
          {cards.map(({ label, value, note, icon: Icon, color }) => (
            <article key={label} className="glass-card min-h-[96px] p-3.5">
              <div className="flex items-start justify-between">
                <p className="text-[9px] text-[var(--color-text-secondary)]">{label}</p>
                <Icon size={14} style={{ color }} />
              </div>
              <p className="mt-2 text-[20px] font-medium leading-none text-[var(--color-text-primary)]">{value}</p>
              <p className="mt-2 text-[8px] text-[var(--color-text-muted)]">{note}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Quick actions">
          <Link
            href="/inventory"
            className="flex min-h-[52px] items-center gap-2 rounded-lg bg-[#0c8980] px-3 text-[10px] font-medium text-white transition-colors hover:bg-[#08776f]"
          >
            <Plus size={15} /> Add Product
          </Link>
          <Link href="/inventory" className="quick-action">
            <ScanLine size={15} /> Scan Barcode
          </Link>
          <Link href="/replenishment" className="quick-action">
            <ShoppingCart size={15} /> Restock Products
          </Link>
          <Link href="#shop-reports" className="quick-action">
            <BarChart3 size={15} /> View Reports
          </Link>
        </section>

        <section id="shop-reports" className="grid grid-cols-1 gap-3 md:grid-cols-[1.45fr_1fr]">
          <article className="glass-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[12px] font-medium text-[var(--color-text-primary)]">Needs your attention</h2>
                <p className="mt-1 text-[9px] text-[var(--color-text-muted)]">A little care today keeps your shop running smoothly.</p>
              </div>
              <Link href="/replenishment" className="flex items-center gap-1 text-[9px] font-medium text-[#0b8981]">
                View all alerts <ArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {stockAlerts.slice(0, 4).map((alert, index) => {
                const Icon = index % 2 === 0 ? Package : ClipboardList;
                const isUrgent = alert.severity !== 'warning';
                return (
                  <div key={alert.id} className="flex items-center gap-2.5 py-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eff8f6] text-[#168c81]">
                      <Icon size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9px] font-semibold text-[var(--color-text-primary)]">{alert.productName}</p>
                      <p className={`mt-0.5 truncate text-[8px] ${isUrgent ? 'text-[#c65a52]' : 'text-[#bd7629]'}`}>
                        {alert.message}
                      </p>
                    </div>
                    <Link href="/replenishment" className="rounded-md border border-[var(--color-border-default)] px-2 py-1 text-[8px] font-medium text-[var(--color-text-primary)] hover:bg-[#f6f9f9]">
                      Restock
                    </Link>
                  </div>
                );
              })}
              {!stockAlerts.length && (
                <p className="py-5 text-center text-[9px] text-[var(--color-text-muted)]">
                  No products are currently below their reorder point.
                </p>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-md bg-[#fff4e4] px-2.5 py-2 text-[8px] text-[#b96c22]">
              <CalendarDays size={12} />
              {stockAlerts.length} products need a stock check based on current quantities.
            </div>
          </article>

          <div className="grid gap-3">
            <article className="glass-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[12px] font-medium text-[var(--color-text-primary)]">Shelf utilization</h2>
                <span className="text-[8px] font-medium text-[#0b8981]">By category</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-[116px] flex-1 items-end justify-around gap-2 border-b border-[var(--color-border-subtle)] px-2">
                  {zoneUtilization.slice(0, 6).map((zone) => (
                    <div key={zone.zoneName} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                      <div className="flex h-[85px] w-full items-end">
                        <div
                          className="w-full rounded-t-[4px] bg-[#b9ded9]"
                          style={{ height: `${Math.max(10, (zone.utilization / maxUtilization) * 100)}%` }}
                          title={`${zone.zoneName}: ${zone.utilization}%`}
                        />
                      </div>
                      <span className="w-full truncate text-center text-[7px] text-[var(--color-text-muted)]">{zone.zoneName}</span>
                    </div>
                  ))}
                </div>
                <div className="relative flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(${categoryGradient})` }}
                  aria-label={`${categoryTotal} products across ${categories.length} categories`}
                >
                  <div className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{categoryTotal}</span>
                    <span className="text-[7px] text-[var(--color-text-muted)]">products</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {categories.slice(0, 4).map((category) => (
                  <div key={category.name} className="flex items-center gap-1.5 text-[8px] text-[var(--color-text-secondary)]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="flex-1 truncate">{category.name}</span>
                    <span>{Math.round((category.count / categoryTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-medium text-[var(--color-text-primary)]">Restock progress</h2>
                <span className="text-[8px] text-[var(--color-text-muted)]">
                  {replenishmentTasks.filter((task) => task.completed).length} completed
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf3f3]">
                <div
                  className="h-full rounded-full bg-[#0b8981]"
                  style={{
                    width: `${replenishmentTasks.length ? (replenishmentTasks.filter((task) => task.completed).length / replenishmentTasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 flex items-center gap-1 text-[8px] text-[var(--color-text-muted)]">
                <Check size={10} className="text-[#168c68]" />
                {replenishmentTasks.length} items in your restock queue
              </p>
            </article>
          </div>
        </section>

        <p className="flex items-center gap-1.5 text-[8px] text-[var(--color-text-muted)]">
          <Check size={11} className="text-[#198d69]" />
          Sales reflect paid bills only. Customer udhaar is managed separately.
        </p>
      </div>
    </div>
  );
}
