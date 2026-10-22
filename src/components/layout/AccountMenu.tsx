'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AccountMenu() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    void supabase.auth.getUser()
      .then(({ data, error: userError }) => {
        if (!isMounted) return;
        if (userError) {
          setError(userError.message);
          return;
        }
        setEmail(data.user?.email ?? '');
      })
      .catch((reason: unknown) => {
        if (isMounted) {
          setError(reason instanceof Error ? reason.message : 'Unable to load account details.');
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? '');
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    setIsSigningOut(true);
    setError('');

    try {
      const { error: signOutError } = await createClient().auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
        return;
      }

      router.replace('/login');
      router.refresh();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign out.');
    } finally {
      setIsSigningOut(false);
    }
  }

  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f3f1] text-[9px] font-medium text-[#0b837a] hover:ring-2 hover:ring-[#c8e5e1]"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-[var(--color-border-default)] bg-white p-2 shadow-lg">
          <p className="truncate px-2 py-2 text-[10px] text-[var(--color-text-secondary)]">
            {email || 'Store account'}
          </p>
          {error && (
            <p role="alert" className="px-2 py-1 text-[10px] text-[var(--color-accent-red)]">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={isSigningOut}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[10px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut size={13} />
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
