'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Store } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setIsSigningUp(true);

    try {
      const { data, error: signupError } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.session) {
        router.replace('/dashboard');
        router.refresh();
        return;
      }

      setConfirmationSent(true);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to create your account. Please try again.');
    } finally {
      setIsSigningUp(false);
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
              A better-organized shop starts here.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Create your store account to manage products, check stock, and keep your shelves in sync.
            </p>
          </div>
          <p className="text-[10px] text-white/65">Set up your account in a few moments</p>
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
                Create your account
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Sign up to get started with your store.
              </p>
            </div>

            {confirmationSent ? (
              <div role="status" className="rounded-xl border border-[#cde9e5] bg-[#f0f8f6] p-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Check your email
                </h3>
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                  If email confirmation is enabled, follow the link we sent to {email.trim()} to finish creating your account. You can then sign in.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex text-xs font-medium text-[#0b837a] hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium text-[var(--color-text-primary)]">
                      Email address
                    </label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
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
                    <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium text-[var(--color-text-primary)]">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-[var(--color-border-default)] bg-white px-3 py-2.5 pr-11 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[#0c9187] focus:ring-2 focus:ring-[#0c9187]/15"
                        placeholder="At least 8 characters"
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

                  <div>
                    <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-medium text-[var(--color-text-primary)]">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-lg border border-[var(--color-border-default)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[#0c9187] focus:ring-2 focus:ring-[#0c9187]/15"
                      placeholder="Enter your password again"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-xs text-[#bd4e4e]">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="flex w-full items-center justify-center rounded-lg bg-[#0b837a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#08776f] disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSigningUp ? 'Creating account…' : 'Create account'}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-[#0b837a] hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
