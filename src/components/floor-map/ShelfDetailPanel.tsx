'use client';

import { X, Package, MapPin, TrendingDown } from 'lucide-react';
import { ShelfUnit, InventoryItem, StoreZone, getStockStatus } from '@/types';
import { cn, getStatusBg } from '@/lib/utils';

// ---------------------------------------------------------------------------
// ShelfDetailPanel — Slide-out panel showing shelf info and products
// ---------------------------------------------------------------------------
interface ShelfDetailPanelProps {
  shelf: ShelfUnit;
  items: InventoryItem[];
  zone: StoreZone;
  onClose: () => void;
}

export default function ShelfDetailPanel({
  shelf,
  items,
  zone,
  onClose,
}: ShelfDetailPanelProps) {
  return (
    <div className="w-80 flex-shrink-0 panel-animate">
      <div className="glass-card p-5 h-full">
        {/* --- Header --- */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              Shelf {shelf.code}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: zone.color }}
              />
              <span className="text-xs text-[var(--color-text-muted)]">
                {zone.name} Zone
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-input)] transition-colors"
          >
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* --- Shelf Stats --- */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[var(--color-bg-input)] rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-[var(--color-accent-cyan)]">
              {shelf.fillPercentage}%
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
              Capacity Used
            </p>
          </div>
          <div className="bg-[var(--color-bg-input)] rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-[var(--color-text-primary)]">
              {items.length}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
              Products
            </p>
          </div>
        </div>

        {/* --- Location Info --- */}
        <div className="flex items-center gap-2 mb-4 text-xs text-[var(--color-text-muted)]">
          <MapPin size={12} />
          <span>
            Position: ({shelf.position.x}m, {shelf.position.y}m) ·{' '}
            {shelf.dimensions.width}m × {shelf.dimensions.height}m
          </span>
        </div>

        {/* --- Product List --- */}
        <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Products on Shelf
        </h4>

        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {items.map((item) => {
            const status = getStockStatus(item);
            return (
              <div
                key={item.id}
                className="bg-[var(--color-bg-input)] border border-[var(--color-border-subtle)] rounded-lg p-3 hover:border-[var(--color-border-accent)] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {item.product.sku}
                    </p>
                  </div>
                  <span className={cn('badge text-[10px]', getStatusBg(status))}>
                    {status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Quantity bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(item.quantity / item.capacity) * 100}%`,
                        background:
                          status === 'in-stock'
                            ? '#10b981'
                            : status === 'low'
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono whitespace-nowrap">
                    {item.quantity}/{item.capacity}
                  </span>
                </div>

                {/* Reorder point indicator */}
                {item.quantity <= item.reorderPoint && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400">
                    <TrendingDown size={10} />
                    Reorder point: {item.reorderPoint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
