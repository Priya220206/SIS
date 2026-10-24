'use client';

export default function StoreDataStatus({
  loading,
  error,
}: {
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <p role="status" className="p-6 text-sm text-[var(--color-text-muted)]">Connecting to the store database…</p>;
  }
  if (error) {
    return <p role="alert" className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }
  return null;
}
