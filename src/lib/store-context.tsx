'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { InventoryItem, ReplenishmentTask, ShelfUnit, StoreZone } from '@/types';

export interface StoreData {
  zones: StoreZone[];
  shelves: ShelfUnit[];
  inventoryItems: InventoryItem[];
  replenishmentTasks: ReplenishmentTask[];
}

interface StoreDataContextValue {
  data: StoreData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StoreDataContext = createContext<StoreDataContextValue | null>(null);

export async function storeRequest(
  path: string,
  method = 'GET',
  body?: unknown
): Promise<void> {
  const response = await fetch(path, {
    method,
    cache: 'no-store',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json() as { success?: boolean; error?: string };
  if (!response.ok || result.success === false) {
    throw new Error(result.error || `Request failed (${response.status}).`);
  }
}

export function StoreDataProvider({
  children,
  enabled,
}: {
  children: React.ReactNode;
  enabled: boolean;
}) {
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const response = await fetch('/api/store', { cache: 'no-store' });
      const result = await response.json() as {
        success: boolean;
        data?: StoreData;
        error?: string;
      };
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || `Could not load store data (${response.status}).`);
      }
      setData(result.data);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load store data.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
      await refresh();
      if (!stopped) timeout = setTimeout(poll, 5000);
    };
    void poll();

    return () => {
      stopped = true;
      clearTimeout(timeout);
    };
  }, [enabled, refresh]);

  return (
    <StoreDataContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) throw new Error('useStoreData must be used inside StoreDataProvider.');
  return context;
}
