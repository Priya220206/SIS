// =============================================================================
// SIM — Utility Functions
// =============================================================================

/** Merge CSS class names, filtering out falsy values */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format a number with locale-aware thousands separators */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Format a percentage value */
export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

/** Euclidean distance between two 2D points */
export function euclideanDistance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Get a human-readable relative time string */
export function timeAgo(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

/** Get the status color class based on stock status */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'in-stock': return 'text-emerald-400';
    case 'low': return 'text-amber-400';
    case 'critical': return 'text-orange-400';
    case 'stockout': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

/** Get the status background color class */
export function getStatusBg(status: string): string {
  switch (status) {
    case 'in-stock': return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
    case 'low': return 'bg-amber-400/15 text-amber-400 border-amber-400/30';
    case 'critical': return 'bg-orange-400/15 text-orange-400 border-orange-400/30';
    case 'stockout': return 'bg-red-400/15 text-red-400 border-red-400/30';
    default: return 'bg-slate-400/15 text-slate-400 border-slate-400/30';
  }
}

/** Scale store coordinates (meters) to canvas pixels */
export function storeToCanvas(
  coord: { x: number; y: number },
  scale: number,
  offset: { x: number; y: number } = { x: 0, y: 0 }
): { x: number; y: number } {
  return {
    x: coord.x * scale + offset.x,
    y: coord.y * scale + offset.y,
  };
}
