'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, Store } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSigningIn(true);
    setError('');

    try {
      const { error: signInError } = await createClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f8] px-4 py-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-white shadow-[0_18px_60px_rgba(29,48,60,0.08)] md:grid-cols-2">
        <section className="hidden flex-col justify-between bg-[#0b837a] p-10 text-white md:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Store size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide">SIM</p>
              <p className="text-[10px] text-white/75">A place for everything.</p>
            </div>
          </div>
          <div className="max-w-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
              Spatial Inventory Management
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              Your shop, organized and ready for the day.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Sign in to manage products, check stock, and keep your shelves in sync.
            </p>
          </div>
          <p className="text-[10px] text-white/65">Secure sign-in for your store team</p>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10 md:py-14">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b837a] text-white">
                <Store size={18} />
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">SIM</span>
            </div>

            <div className="mb-7">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4f2] text-[#0b837a]">
                <LockKeyhole size={18} />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Sign in with your store account to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[var(--color-text-primary)]">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border-default)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[#0c9187] focus:ring-2 focus:ring-[#0c9187]/15"
                  placeholder="you@yourstore.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[var(--color-text-primary)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border-default)] bg-white px-3 py-2.5 pr-11 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[#0c9187] focus:ring-2 focus:ring-[#0c9187]/15"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-xs text-[#bd4e4e]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSigningIn}
                className="flex w-full items-center justify-center rounded-lg bg-[#0b837a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#08776f] disabled:cursor-wait disabled:opacity-60"
              >
                {isSigningIn ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
              New to SIM?{' '}
              <Link href="/signup" className="font-medium text-[#0b837a] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
