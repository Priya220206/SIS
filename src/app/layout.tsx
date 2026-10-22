import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

// ---------------------------------------------------------------------------
// Root Metadata
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: 'SIM — Spatial Inventory Management',
  description:
    'Spatial Inventory Management & Replenishment Optimization System for retail stores. Prevent stockouts, reduce travel time, optimize space.',
};

// ---------------------------------------------------------------------------
// Root Layout — Persistent sidebar + scrollable main content
// Uses a flex layout with the sidebar as a fixed-width element and
// the main content area taking the remaining space.
// ---------------------------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
