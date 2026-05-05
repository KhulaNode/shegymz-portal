'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  'account-missing':
    'This sign-in completed, but there is no portal account for the paid-member email yet. Start with first-time signup.',
  AccessDenied:
    'That sign-in path was rejected. Use the same paid-member email that cleared portal signup.',
  CredentialsSignin:
    'Login failed. Use the same paid-member email and the password set during signup.',
  OAuthAccountNotLinked:
    'That Google account is not linked to this portal user. Use the paid-member email account that completed signup.',
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nextParam = searchParams.get('next');
  const callbackUrl = nextParam?.startsWith('/') ? nextParam : '/portal';
  const routeError = searchParams.get('error');
  const routeErrorMessage = routeError ? LOGIN_ERROR_MESSAGES[routeError] : '';

  async function handleCredentialsLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsLoading(false);

    if (!result || result.error) {
      setError(
        LOGIN_ERROR_MESSAGES[result?.error ?? 'CredentialsSignin'] ??
          'Login failed. Use the same paid-member email and the password set during signup.',
      );
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,223,241,0.55),_transparent_42%),linear-gradient(180deg,#fcfaf8_0%,#f5f1ec_100%)] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] bg-plum-900 p-8 text-white shadow-[0_24px_80px_rgba(53,18,41,0.18)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
            Returning Members
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Step back into your SheGymZ portal without reopening signup.
          </h1>
          <p className="mt-5 text-base leading-8 text-white/82 sm:text-lg">
            Use the same paid-member email that cleared payment and signup. If you were sent here
            from a protected page, successful login will take you back there.
          </p>
          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/80">
              Email remains the identity anchor for membership checks and protected access.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/80">
              Google and password login both return to the same protected destination.
            </div>
            {nextParam?.startsWith('/') && (
              <div className="rounded-2xl border border-white/15 bg-white/12 px-4 py-4 text-sm text-white">
                Protected destination waiting after login: <span className="font-semibold">{nextParam}</span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-plum-100/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
            Login
          </p>
          <h2 className="mt-4 text-3xl font-bold text-plum-900 sm:text-4xl">
            Enter the portal with your existing member account.
          </h2>
          <p className="mt-4 text-base leading-8 text-plum-800 sm:text-lg">
            First time here? Start with OTP-verified signup before you try to log in.
          </p>

          {routeErrorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
              {routeErrorMessage}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-plum-900">
                Paid-member email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-plum-200 bg-sand/35 px-4 py-3 text-base outline-none transition focus:border-plum-700"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-plum-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-plum-200 bg-sand/35 px-4 py-3 text-base outline-none transition focus:border-plum-700"
                placeholder="Your password"
                required
              />
            </div>

            {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isLoading ? 'Logging in...' : 'Login with password'}
              </button>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
                className="rounded-full border border-plum-300 px-6 py-3 text-sm font-semibold text-plum-900"
              >
                Continue with Google
              </button>
            </div>
          </form>

          <div className="mt-8 rounded-3xl border border-plum-100 bg-sand/55 p-5 text-sm leading-7 text-plum-800">
            Need a portal account first?{' '}
            <Link
              href={nextParam?.startsWith('/') ? `/signup?next=${encodeURIComponent(nextParam)}` : '/signup'}
              className="font-semibold text-plum-900"
            >
              Complete first-time signup
            </Link>
            .
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
