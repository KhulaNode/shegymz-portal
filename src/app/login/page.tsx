'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  'account-missing': 'Please create your member account before signing in.',
  AccessDenied: 'This area is for active SheGymZ members. Please use the email connected to your membership.',
  CredentialsSignin: portalCopy.login.error,
  OAuthAccountNotLinked: 'Please use the Google account connected to your SheGymZ member account.',
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nextParam = searchParams.get('next');
  const callbackUrl = nextParam?.startsWith('/') ? nextParam : '/schedule';
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
      setError(LOGIN_ERROR_MESSAGES[result?.error ?? 'CredentialsSignin'] ?? portalCopy.login.error);
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Returning Member" />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="relative min-h-[360px] overflow-hidden rounded-[2.5rem] shadow-[0_28px_90px_rgba(53,18,41,0.13)] lg:min-h-[650px]">
          <Image
            src="/images/IMG_3757.jpeg"
            alt="SheGymZ member space"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-plum-900/84 via-plum-900/48 to-plum-900/18" />
          <div className="relative flex min-h-[360px] flex-col justify-end p-8 text-white sm:p-10 lg:min-h-[650px]">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/68">
              Welcome in
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              {portalCopy.login.title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/84 sm:text-lg">
              {portalCopy.login.subtitle}
            </p>
            <div className="mt-8 grid gap-3 sm:max-w-lg">
              <div className="rounded-2xl border border-white/14 bg-white/10 px-4 py-4 text-sm leading-7 text-white/84">
                Your schedule, bookings, and member-only experience are waiting inside.
              </div>
              {nextParam?.startsWith('/') && (
                <div className="rounded-2xl border border-white/18 bg-white/14 px-4 py-4 text-sm leading-7 text-white">
                  Sign in and we will take you straight back to your member-only space.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-white/75 bg-white/92 p-8 shadow-[0_28px_90px_rgba(53,18,41,0.09)] backdrop-blur-xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
            Sign in
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-plum-900 sm:text-4xl">
            {portalCopy.login.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-plum-800 sm:text-lg">
            {portalCopy.login.subtitle}
          </p>

          {routeErrorMessage && (
            <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-7 text-plum-800">
              {routeErrorMessage}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-plum-900">
                Membership email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-plum-200 bg-sand/40 px-4 py-3 text-base outline-none transition focus:border-plum-700"
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
                className="w-full rounded-2xl border border-plum-200 bg-sand/40 px-4 py-3 text-base outline-none transition focus:border-plum-700"
                placeholder="Your password"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-7 text-plum-800">
                {error}
              </div>
            )}

            <div className="grid gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800 disabled:opacity-60"
              >
                {isLoading ? 'Signing you in...' : portalCopy.login.emailButton}
              </button>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
                className="rounded-full border border-plum-200 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-plum-400 hover:bg-plum-50"
              >
                {portalCopy.login.googleButton}
              </button>
            </div>
          </form>

          <div className="mt-8 rounded-[1.75rem] border border-plum-100 bg-[#faf7f4] p-5 text-sm leading-7 text-plum-800">
            New to the portal?{' '}
            <Link
              href={nextParam?.startsWith('/') ? `/signup?next=${encodeURIComponent(nextParam)}` : '/signup'}
              className="font-semibold text-plum-900"
            >
              {portalCopy.nav.signup}
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
