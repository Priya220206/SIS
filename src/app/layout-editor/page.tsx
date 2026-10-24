'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import TopBar from '@/components/layout/TopBar';
import { storeRequest, useStoreData } from '@/lib/store-context';
import { getStoreDimensions } from '@/lib/store-data';
import { ShelfUnit } from '@/types';
import { Save, RotateCcw, Grid3x3, Plus, Trash2, Move } from 'lucide-react';
import StoreDataStatus from '@/components/data/StoreDataStatus';
import type { StoreZone } from '@/types';

const EMPTY_ZONES: StoreZone[] = [];
const EMPTY_SHELVES: ShelfUnit[] = [];

// Dynamic import for editor canvas
const EditorCanvas = dynamic(
  () => import('@/components/layout-editor/EditorCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] glass-card">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-cyan)] border-t-transparent animate-spin" />
      </div>
    ),
  }
);

// ---------------------------------------------------------------------------
// Layout Editor Page — Drag-and-drop shelf arrangement
// ---------------------------------------------------------------------------
export default function LayoutEditorPage() {
  const { data, loading, error, refresh } = useStoreData();
  const storeZones = data?.zones ?? EMPTY_ZONES;
  const shelfUnits = data?.shelves ?? EMPTY_SHELVES;
  const [draftShelves, setDraftShelves] = useState<ShelfUnit[] | null>(null);
  const editedShelves = draftShelves ?? shelfUnits;
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleShelfMove = useCallback(
    (shelfId: string, newPos: { x: number; y: number }) => {
      setDraftShelves((prev) =>
        (prev ?? shelfUnits).map((s) =>
          s.id === shelfId
            ? {
                ...s,
                position: snapToGrid
                  ? {
                      x: Math.round(newPos.x * 2) / 2, // snap to 0.5m
                      y: Math.round(newPos.y * 2) / 2,
                    }
                  : newPos,
              }
            : s
        )
      );
      setHasChanges(true);
    },
    [snapToGrid, shelfUnits]
  );

  const handleReset = () => {
    setDraftShelves(null);
    setHasChanges(false);
    setSelectedShelf(null);
  };

  const handleSave = async () => {
    try {
      setSaveError('');
      await storeRequest('/api/store/shelves', 'PUT', { shelves: editedShelves });
      await refresh();
      setDraftShelves(null);
      setHasChanges(false);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Could not save the layout.');
    }
  };

  const handleDeleteShelf = () => {
    if (selectedShelf) {
      setDraftShelves((prev) => (prev ?? shelfUnits).filter((s) => s.id !== selectedShelf));
      setSelectedShelf(null);
      setHasChanges(true);
    }
  };

  const handleAddShelf = () => {
    const newShelf: ShelfUnit = {
      id: crypto.randomUUID(),
      code: `N-${crypto.randomUUID().slice(0, 8)}`,
      zoneId: storeZones[0]?.id ?? '',
      position: { x: 20, y: 15 },
      dimensions: { width: 3, height: 1.2 },
      totalCapacity: 100,
      fillPercentage: 0,
    };
    setDraftShelves((prev) => [...(prev ?? shelfUnits), newShelf]);
    setSelectedShelf(newShelf.id);
    setHasChanges(true);
  };

  const selectedShelfData = editedShelves.find((s) => s.id === selectedShelf);

  if (!data) return <StoreDataStatus loading={loading} error={error} />;

  return (
    <div className="min-h-screen">
      <TopBar title="Layout Editor" />

      <div className="page-content page-stack">
        <StoreDataStatus loading={loading} error={error} />
        {saveError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{saveError}</p>}
        <div>
          <h1 className="text-[21px] font-medium tracking-tight text-[var(--color-text-primary)]">Edit shop layout</h1>
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Arrange shelves and keep every aisle easy to navigate.</p>
        </div>

        {/* --- Toolbar --- */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleAddShelf}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/25 transition-all"
            >
              <Plus size={16} />
              Add Shelf
            </button>

            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                snapToGrid
                  ? 'bg-purple-400/15 text-purple-400 border-purple-400/30'
                  : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]'
              }`}
            >
              <Grid3x3 size={16} />
              Snap to Grid
            </button>

            {selectedShelf && (
              <button
                onClick={handleDeleteShelf}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-400/15 text-red-400 border border-red-400/30 hover:bg-red-400/25 transition-all"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              {hasChanges && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved changes
                </span>
              )}

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:border-[var(--color-accent-cyan)] transition-all"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button
                onClick={() => void handleSave()}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  hasChanges
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border border-[var(--color-border-default)] cursor-not-allowed'
                }`}
              >
                <Save size={16} />
                Save Layout
              </button>
            </div>
          </div>
        </div>

        {/* --- Editor + Properties Panel --- */}
        <div className="flex gap-4">
          <div className="flex-1">
            <EditorCanvas
              zones={storeZones}
              shelves={editedShelves}
              selectedShelfId={selectedShelf}
              snapToGrid={snapToGrid}
              storeDimensions={getStoreDimensions(storeZones)}
              onShelfSelect={setSelectedShelf}
              onShelfMove={handleShelfMove}
            />
          </div>

          {/* Properties Panel */}
          {selectedShelfData && (
            <div className="w-72 flex-shrink-0 panel-animate">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <Move size={16} className="text-[var(--color-accent-cyan)]" />
                  Shelf Properties
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                      Code
                    </label>
                    <input
                      type="text"
                      value={selectedShelfData.code}
                      readOnly
                      className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                      Zone
                    </label>
                    <select
                      value={selectedShelfData.zoneId}
                      onChange={(e) => {
                        setDraftShelves((prev) =>
                          (prev ?? shelfUnits).map((s) =>
                            s.id === selectedShelf ? { ...s, zoneId: e.target.value } : s
                          )
                        );
                        setHasChanges(true);
                      }}
                      className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-cyan)]"
                    >
                      {storeZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                        X (m)
                      </label>
                      <input
                        type="number"
                        value={selectedShelfData.position.x}
                        readOnly
                        className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                        Y (m)
                      </label>
                      <input
                        type="number"
                        value={selectedShelfData.position.y}
                        readOnly
                        className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                        Width (m)
                      </label>
                      <input
                        type="number"
                        value={selectedShelfData.dimensions.width}
                        step={0.5}
                        onChange={(e) => {
                          setDraftShelves((prev) =>
                            (prev ?? shelfUnits).map((s) =>
                              s.id === selectedShelf
                                ? { ...s, dimensions: { ...s.dimensions, width: parseFloat(e.target.value) || 1 } }
                                : s
                            )
                          );
                          setHasChanges(true);
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-accent-cyan)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                        Height (m)
                      </label>
                      <input
                        type="number"
                        value={selectedShelfData.dimensions.height}
                        step={0.1}
                        onChange={(e) => {
                          setDraftShelves((prev) =>
                            (prev ?? shelfUnits).map((s) =>
                              s.id === selectedShelf
                                ? { ...s, dimensions: { ...s.dimensions, height: parseFloat(e.target.value) || 0.5 } }
                                : s
                            )
                          );
                          setHasChanges(true);
                        }}
                        className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-accent-cyan)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                      Capacity (units)
                    </label>
                    <input
                      type="number"
                      value={selectedShelfData.totalCapacity}
                      onChange={(e) => {
                        setDraftShelves((prev) =>
                          (prev ?? shelfUnits).map((s) =>
                            s.id === selectedShelf
                              ? { ...s, totalCapacity: parseInt(e.target.value) || 0 }
                              : s
                          )
                        );
                        setHasChanges(true);
                      }}
                      className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-accent-cyan)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
