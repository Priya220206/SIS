'use client';

import { useState, useMemo, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import StoreCanvas from '@/components/floor-map/StoreCanvas';
import ShelfDetailPanel from '@/components/floor-map/ShelfDetailPanel';
import { useStoreData } from '@/lib/store-context';
import { getStoreDimensions } from '@/lib/store-data';
import { ShelfUnit, type InventoryItem, type StoreZone } from '@/types';
import { Eye, EyeOff, Thermometer, List, Map as MapIcon, PencilRuler } from 'lucide-react';
import Link from 'next/link';
import StoreDataStatus from '@/components/data/StoreDataStatus';

const EMPTY_ZONES: StoreZone[] = [];
const EMPTY_SHELVES: ShelfUnit[] = [];
const EMPTY_INVENTORY_ITEMS: InventoryItem[] = [];

// ---------------------------------------------------------------------------
// Floor Map Page — Interactive 2D store layout with heatmap overlay
// ---------------------------------------------------------------------------
export default function FloorMapPage() {
  const { data, loading, error } = useStoreData();
  const storeZones = data?.zones ?? EMPTY_ZONES;
  const shelfUnits = data?.shelves ?? EMPTY_SHELVES;
  const inventoryItems = data?.inventoryItems ?? EMPTY_INVENTORY_ITEMS;
  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [view, setView] = useState<'map' | 'list'>('map');
  const selectedShelf = shelfUnits.find((shelf) => shelf.id === selectedShelfId) ?? null;
  const storeDimensions = getStoreDimensions(storeZones);

  // Get inventory items for the selected shelf
  const selectedShelfInventory = useMemo(() => {
    if (!selectedShelf) return [];
    return inventoryItems.filter((item) => item.shelfId === selectedShelf.id);
  }, [selectedShelf, inventoryItems]);

  const handleShelfClick = useCallback((shelf: ShelfUnit) => {
    setSelectedShelfId((prev) => (prev === shelf.id ? null : shelf.id));
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedShelfId(null);
  }, []);

  if (!data) return <StoreDataStatus loading={loading} error={error} />;

  return (
    <div className="min-h-screen">
      <TopBar title="Interactive Floor Map" />

      <div className="page-content page-stack">
        <StoreDataStatus loading={loading} error={error} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[21px] font-medium tracking-tight text-[var(--color-text-primary)]">Shop Layout</h1>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Find products faster. Keep every shelf in order.</p>
          </div>
          <Link href="/layout-editor" className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-white px-3 py-2 text-[10px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]">
            <PencilRuler size={12} className="text-[var(--color-accent-cyan)]" /> Edit Layout
          </Link>
        </div>

        {/* --- Controls Bar --- */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-[#edf2f3] p-1">
            <button onClick={() => setView('map')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[9px] font-medium ${view === 'map' ? 'bg-white text-[#0b8981] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}>
              <MapIcon size={12} /> Map view
            </button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[9px] font-medium ${view === 'list' ? 'bg-white text-[#0b8981] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}>
              <List size={12} /> List view
            </button>
          </div>

          {view === 'map' && (
            <>
              <button
                onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[9px] font-medium transition-all ${
                  heatmapEnabled
                    ? 'border-orange-400/30 bg-orange-400/15 text-orange-400'
                    : 'border-[var(--color-border-default)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-accent-cyan)]'
                }`}
              >
                <Thermometer size={13} />
                {heatmapEnabled ? 'Heatmap on' : 'Heatmap off'}
              </button>

              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[9px] font-medium transition-all ${
                  showLabels
                    ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-400'
                    : 'border-[var(--color-border-default)] bg-white text-[var(--color-text-secondary)]'
                }`}
              >
                {showLabels ? <Eye size={13} /> : <EyeOff size={13} />}
                Labels
              </button>
            </>
          )}

          {/* Legend */}
          <div className="ml-auto flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            {heatmapEnabled ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Healthy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500" /> Low
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-500" /> Critical
                </span>
              </>
            ) : (
              storeZones.map((zone) => (
                <span key={zone.id} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: zone.color }}
                  />
                  {zone.name}
                </span>
              ))
            )}
          </div>
        </div>

        {/* --- Map + Detail Panel --- */}
        {view === 'map' ? (
          <div className="flex gap-4">
            <div className="min-w-0 flex-1">
              <StoreCanvas
                zones={storeZones}
                shelves={shelfUnits}
                selectedShelfId={selectedShelf?.id || null}
                heatmapEnabled={heatmapEnabled}
                showLabels={showLabels}
                onShelfClick={handleShelfClick}
                storeDimensions={storeDimensions}
              />
            </div>

            {selectedShelf && (
              <ShelfDetailPanel
                shelf={selectedShelf}
                items={selectedShelfInventory}
                zone={storeZones.find((z) => z.id === selectedShelf.zoneId)!}
                onClose={handleClosePanel}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(230px,1fr)]">
            <section className="glass-card p-3">
              <h2 className="mb-2 text-[11px] font-medium text-[var(--color-text-primary)]">Your shelves</h2>
              <div className="space-y-1.5">
                {shelfUnits.map((shelf) => {
                  const zone = storeZones.find((entry) => entry.id === shelf.zoneId)!;
                  const isSelected = selectedShelf?.id === shelf.id;
                  return (
                    <button key={shelf.id} onClick={() => handleShelfClick(shelf)} className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left ${isSelected ? 'border-[#0b8981] bg-[#edf8f6]' : 'border-transparent hover:bg-[#f6f9f9]'}`}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[9px] font-medium text-[#0b8981]">{shelf.code}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[9px] font-medium text-[var(--color-text-primary)]">{zone.name}</span>
                        <span className="block text-[8px] text-[var(--color-text-muted)]">{shelf.fillPercentage}% shelf capacity</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="glass-card p-3">
              <h2 className="mb-2 text-[11px] font-medium text-[var(--color-text-primary)]">Products on shelves</h2>
              {selectedShelf ? (
                <div className="space-y-2">
                  {selectedShelfInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md border border-[var(--color-border-subtle)] p-2.5">
                      <div>
                        <p className="text-[9px] font-medium text-[var(--color-text-primary)]">{item.product.name}</p>
                        <p className="mt-1 text-[8px] text-[var(--color-text-muted)]">{item.quantity} in stock · {item.product.sku}</p>
                      </div>
                      <span className="text-[9px] text-[#0b8981]">₹{item.product.price.toFixed(2)}</span>
                    </div>
                  ))}
                  {!selectedShelfInventory.length && <p className="py-4 text-center text-[9px] text-[var(--color-text-muted)]">No products assigned to this shelf.</p>}
                </div>
              ) : (
                <p className="rounded-md bg-[#f6f9f9] p-3 text-[9px] text-[var(--color-text-muted)]">Choose a shelf to see the products placed there.</p>
              )}
            </section>
            <section>
              {selectedShelf ? (
                <ShelfDetailPanel
                  shelf={selectedShelf}
                  items={selectedShelfInventory}
                  zone={storeZones.find((zone) => zone.id === selectedShelf.zoneId)!}
                  onClose={handleClosePanel}
                />
              ) : (
                <div className="rounded-lg bg-[#eaf5f3] p-4 text-[9px] leading-5 text-[#0b8981]">Select a shelf to check stock, location and restock details.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
