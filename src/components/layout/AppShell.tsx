'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <div className={isAuthPage ? 'app-shell auth-shell' : 'app-shell'}>
      {!isAuthPage && <Sidebar />}
      <main
        className={isAuthPage ? 'main-content auth-main-content' : 'main-content'}
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
