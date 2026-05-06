'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.88c2.27-2.09 3.56-5.17 3.56-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.07.72-2.43 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.55.38-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.78 1.27 5.37l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.09c.95-2.85 3.6-4.95 6.73-4.95Z"
      />
    </svg>
  );
}

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
    <main className="portal-shell min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Returning member" />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="relative min-h-[260px] overflow-hidden rounded-[2rem] border border-plum-900/10 bg-gradient-to-br from-[#6f466f] via-[#5d395f] to-[#452948] shadow-[0_32px_100px_rgba(53,18,41,0.28)] sm:min-h-[360px] sm:rounded-[2.5rem] lg:min-h-[650px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,181,195,0.07),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.03),_transparent_28%)]" />

          {/* Ambient glow orbs */}
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#9b3a72]/50 blur-[90px]" />
          <div aria-hidden className="pointer-events-none absolute -left-16 bottom-16 h-72 w-72 rounded-full bg-rose-400/25 blur-[80px]" />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-[#c45c80]/20 blur-[70px]" />

          {/* Sparkles */}
          <span aria-hidden className="pointer-events-none absolute right-8 top-10 select-none text-xl text-rose-300/55">✦</span>
          <span aria-hidden className="pointer-events-none absolute right-20 top-28 select-none text-xs text-white/20">✦</span>
          <span aria-hidden className="pointer-events-none absolute bottom-16 right-6 select-none text-sm text-rose-300/35">◆</span>
          <span aria-hidden className="pointer-events-none absolute left-6 top-16 select-none text-xs text-rose-200/25">✿</span>
          <span aria-hidden className="pointer-events-none absolute bottom-24 left-10 select-none text-base text-white/15">✦</span>

          {/* Logo — centered, responsive */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt=""
              aria-hidden="true"
              className="relative h-auto w-[55%] max-w-[220px] opacity-70 sm:w-[70%] sm:max-w-xs lg:w-[80%] lg:max-w-sm"
              style={{ mixBlendMode: 'luminosity' }}
            />
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-8 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-10">
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
                className="w-full rounded-2xl border border-warmgray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
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
                className="w-full rounded-2xl border border-warmgray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
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
                {isLoading ? portalCopy.login.loading : portalCopy.login.emailButton}
              </button>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-warmgray-300 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-rose-300 hover:bg-rose-50"
              >
                <GoogleMark />
                {portalCopy.login.googleButton}
              </button>
            </div>
          </form>

          <div className="mt-8 rounded-[1.75rem] border border-warmgray-200 bg-warmgray-50 p-5 text-sm leading-7 text-plum-800">
            {portalCopy.login.helper}{' '}
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
