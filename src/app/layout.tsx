import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

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
        <div className="app-shell">
          {/* Persistent Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="main-content" id="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
