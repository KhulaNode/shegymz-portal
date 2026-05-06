'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

type Step = 'email' | 'no-membership' | 'otp' | 'verified' | 'account-created';
type VerifyOtpResponse = {
  error?: string;
  continuationExpiresInSeconds?: number;
};
type PasswordAccountResponse = {
  error?: string;
  loginEmail?: string;
};

const SIGNUP_AUTH_ERROR_MESSAGES: Record<string, string> = {
  'google-email-missing': 'Please use a Google account with an email address we can recognise.',
  'google-email-mismatch': 'Please use the same email you used when subscribing to SheGymZ.',
  'signup-gate-required': 'For your privacy, please begin by confirming your membership email.',
  'google-account-missing': 'Google did not complete sign-in. Please try again.',
  'google-account-already-linked': 'That Google account is already connected to another member account.',
};

function friendlySignupError(error: string | undefined, fallback: string = portalCopy.safeErrors.default) {
  const normalised = error?.toLowerCase() ?? '';

  if (normalised.includes('no active') || normalised.includes('membership')) {
    return portalCopy.signup.noMembershipTitle;
  }

  if (normalised.includes('verification code') || normalised.includes('secure code') || normalised.includes('challenge')) {
    return normalised.includes('expired') || normalised.includes('not found')
      ? portalCopy.safeErrors.expired
      : portalCopy.safeErrors.code;
  }

  if (normalised.includes('already exists')) {
    return portalCopy.safeErrors.accountExists;
  }

  if (normalised.includes('password') || normalised.includes('invalid')) {
    return portalCopy.safeErrors.passwordInvalid;
  }

  return fallback;
}

function formatCopy(template: string, values: Record<string, string | number | undefined>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}

function SignupPageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const authError = searchParams.get('error');
  const authErrorMessage = authError ? SIGNUP_AUTH_ERROR_MESSAGES[authError] : '';
  const nextParam = searchParams.get('next');
  const callbackUrl = nextParam?.startsWith('/') ? nextParam : '/schedule';
  const loginHref = nextParam?.startsWith('/')
    ? `/login?next=${encodeURIComponent(nextParam)}`
    : '/login?next=%2Fschedule';

  async function requestSecureCode() {
    const response = await fetch('/api/signup/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      email?: string;
      expiresInMinutes?: number;
    };

    if (!response.ok) {
      if (response.status === 403) {
        setStep('no-membership');
        return;
      }

      throw new Error(friendlySignupError(data.error, portalCopy.safeErrors.requestCode));
    }

    setStep('otp');
    setMessage(
      formatCopy(portalCopy.signup.codeSentMessage, {
        email: data.email ?? email,
        minutes: data.expiresInMinutes,
      }),
    );
  }

  async function handleRequestOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await requestSecureCode();
    } catch (err) {
      setError(err instanceof Error ? err.message : portalCopy.safeErrors.default);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await requestSecureCode();
    } catch (err) {
      setError(err instanceof Error ? err.message : portalCopy.safeErrors.default);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = (await response.json().catch(() => ({}))) as VerifyOtpResponse;
      if (!response.ok) {
        throw new Error(friendlySignupError(data.error, portalCopy.safeErrors.code));
      }

      setStep('verified');
      setMessage(portalCopy.signup.successText);
    } catch (err) {
      setError(err instanceof Error ? err.message : portalCopy.safeErrors.code);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePasswordAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(portalCopy.safeErrors.passwordMismatch);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/signup/create-password-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          password,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as PasswordAccountResponse;
      if (!response.ok) {
        throw new Error(friendlySignupError(data.error, portalCopy.safeErrors.createAccount));
      }

      setStep('account-created');
      setMessage(
        formatCopy(portalCopy.signup.accountReadyMessage, {
          email: data.loginEmail ?? email,
        }),
      );
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : portalCopy.safeErrors.default);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="portal-shell min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Create member account" />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative min-h-[340px] overflow-hidden rounded-[2rem] shadow-[0_32px_100px_rgba(53,18,41,0.28)] sm:rounded-[2.5rem] lg:min-h-[720px]">

          {/* Branded gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-plum-900 via-[#5c1f52] to-[#7d2d6c]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2e0e2e]/70 via-transparent to-transparent" />

          {/* Ambient glow orbs */}
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#9b3a72]/50 blur-[90px]" />
          <div aria-hidden className="pointer-events-none absolute -left-16 bottom-16 h-72 w-72 rounded-full bg-rose-400/25 blur-[80px]" />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-[#c45c80]/20 blur-[70px]" />

          {/* Sparkles */}
          <span aria-hidden className="pointer-events-none absolute right-8 top-10 select-none text-xl text-rose-300/55">✦</span>
          <span aria-hidden className="pointer-events-none absolute right-20 top-28 select-none text-xs text-white/20">✦</span>
          <span aria-hidden className="pointer-events-none absolute bottom-44 right-6 select-none text-sm text-rose-300/35">◆</span>
          <span aria-hidden className="pointer-events-none absolute left-6 top-16 select-none text-xs text-rose-200/25">✿</span>

          <div className="relative flex min-h-[340px] flex-col justify-between p-6 text-white sm:p-10 lg:min-h-[720px]">

            {/* Logo at top */}
            <div>
              <Image
                src="/images/logo.png"
                alt="SheGymZ"
                width={140}
                height={56}
                className="h-10 w-auto object-contain brightness-0 invert sm:h-12"
                priority
              />
            </div>

            {/* Content at bottom */}
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                <span className="text-rose-300">✦</span>
                Member onboarding
              </p>
              <h1 className="mt-4 max-w-xl text-[1.75rem] font-semibold leading-tight sm:text-4xl lg:text-5xl">
                <span className="bg-gradient-to-br from-white via-rose-100 to-rose-200 bg-clip-text text-transparent">
                  {portalCopy.signup.title}
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                {portalCopy.signup.subtitle}
              </p>

              <div className="mt-6 space-y-2.5 sm:mt-8 sm:max-w-lg sm:space-y-3">
                {[
                  { n: '1', text: portalCopy.signup.stepEmail, active: step === 'email' || step === 'no-membership' },
                  { n: '2', text: portalCopy.signup.stepCode, active: step === 'otp' },
                  { n: '3', text: portalCopy.signup.stepFinish, active: step === 'verified' || step === 'account-created' },
                ].map(({ n, text, active }) => (
                  <div
                    key={n}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-6 transition-all sm:py-4 sm:leading-7 border-rose-300/40 bg-white/18 text-white shadow-[0_8px_28px_rgba(181,64,106,0.18)] ${active ? 'ring-1 ring-rose-300/40' : ''}`}
                  >
                    <span className="mt-0.5 shrink-0 text-xs font-bold text-rose-300">{n}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-rose-300/20 bg-white/10 p-4 text-sm leading-7 text-white/75 backdrop-blur-sm sm:mt-8 sm:rounded-3xl sm:p-5">
                Already set up?{' '}
                <a href={loginHref} className="font-semibold text-rose-200 transition hover:text-white">
                  Use member sign-in
                </a>{' '}
                instead.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-8 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
            Member account
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-plum-900 sm:text-4xl">
            {step === 'otp' ? portalCopy.signup.codeTitle : portalCopy.signup.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-plum-800 sm:text-lg">
            {step === 'otp' ? portalCopy.signup.codeSubtitle : portalCopy.signup.subtitle}
          </p>

          {authErrorMessage && (
            <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-7 text-plum-800">
              {authErrorMessage}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-plum-900">
                  {portalCopy.signup.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-warmgray-300 bg-white px-4 py-3 text-base outline-none ring-0 transition focus:border-plum-700"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-7 text-plum-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800 disabled:opacity-60 sm:w-auto"
              >
                {isLoading ? portalCopy.signup.loading : portalCopy.signup.continueCta}
              </button>
            </form>
          )}

          {step === 'no-membership' && (
            <div className="mt-8 rounded-[2rem] border border-rose-200 bg-rose-50 p-6">
              <h3 className="text-2xl font-semibold leading-tight text-plum-900">
                {portalCopy.signup.noMembershipTitle}
              </h3>
              <p className="mt-4 text-base leading-8 text-plum-800">
                {portalCopy.signup.noMembershipBody}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                    setMessage('');
                  }}
                  className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800"
                >
                  {portalCopy.signup.tryAnotherEmail}
                </button>
                <Link
                  href={portalCopy.external.shegymzUrl}
                  className="rounded-full border border-warmgray-300 bg-white px-6 py-3 text-center text-sm font-semibold text-plum-900 transition hover:border-rose-300"
                >
                  {portalCopy.signup.goToSheGymZ}
                </Link>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
              {message && (
                <div className="rounded-2xl border border-warmgray-200 bg-warmgray-50 px-4 py-4 text-sm leading-7 text-plum-900">
                  {message}
                </div>
              )}

              <div>
                <label htmlFor="otpCode" className="mb-2 block text-sm font-semibold text-plum-900">
                  {portalCopy.signup.codeLabel}
                </label>
                <input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-2xl border border-warmgray-300 bg-white px-4 py-3 text-base tracking-[0.3em] outline-none transition focus:border-plum-700"
                  placeholder="000000"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-7 text-plum-800">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800 disabled:opacity-60"
                >
                  {isLoading ? portalCopy.signup.verifyLoading : portalCopy.signup.verifyCodeCta}
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="rounded-full border border-warmgray-300 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-rose-300 disabled:opacity-60"
                >
                  {portalCopy.signup.resendText}
                </button>
              </div>
            </form>
          )}

          {step === 'verified' && (
            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-900">
                {message}
              </div>
              <div className="rounded-[1.75rem] border border-warmgray-200 bg-warmgray-50 p-5 text-sm leading-7 text-plum-900">
                {portalCopy.signup.accountConnectedPrefix} <span className="font-semibold">{email}</span>.
              </div>
              <form onSubmit={handleCreatePasswordAccount} className="space-y-5 rounded-3xl border border-warmgray-200 bg-warmgray-50/80 p-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-plum-900">
                    {portalCopy.signup.fullNameLabel}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-warmgray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
                    placeholder={portalCopy.signup.fullNamePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-plum-900">
                    {portalCopy.signup.passwordLabel}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-warmgray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
                    placeholder={portalCopy.signup.passwordPlaceholder}
                    minLength={8}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-plum-900"
                  >
                    {portalCopy.signup.confirmPasswordLabel}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-warmgray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
                    placeholder={portalCopy.signup.confirmPasswordPlaceholder}
                    minLength={8}
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
                    {isLoading ? portalCopy.signup.createAccountLoading : portalCopy.signup.createPasswordCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl })}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-warmgray-300 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-rose-300 hover:bg-rose-50"
                  >
                    <GoogleMark />
                    {portalCopy.signup.googleFinishCta}
                  </button>
                </div>

                <p className="text-sm leading-7 text-plum-700">
                  {portalCopy.signup.googleHintPrefix} <span className="font-semibold">{email}</span>.
                </p>
              </form>
            </div>
          )}

          {step === 'account-created' && (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-900">
                {message}
              </div>
              <a
                href={loginHref}
                className="inline-flex rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800"
              >
                Sign in
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}
