'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

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
  'google-email-mismatch': 'Please use the same email you used when joining SheGymZ.',
  'signup-gate-required': 'For your privacy, please begin by confirming your membership email.',
  'google-account-missing': 'Google did not complete sign-in. Please try again.',
  'google-account-already-linked': 'That Google account is already connected to another member account.',
};

function friendlySignupError(error: string | undefined, fallback = portalCopy.safeErrors.default) {
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

      throw new Error(friendlySignupError(data.error, 'We could not send your secure code just now. Please try again.'));
    }

    setStep('otp');
    setMessage(`We sent a secure code to ${data.email ?? email}. It expires in ${data.expiresInMinutes} minutes.`);
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
        throw new Error(friendlySignupError(data.error, 'We could not create your member account just now. Please try again.'));
      }

      setStep('account-created');
      setMessage(`Your member account is ready for ${data.loginEmail ?? email}. You can sign in now.`);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : portalCopy.safeErrors.default);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Create Member Account" />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative min-h-[380px] overflow-hidden rounded-[2.5rem] shadow-[0_28px_90px_rgba(53,18,41,0.13)] lg:min-h-[720px]">
          <Image
            src="/images/showcase1.jpeg"
            alt="SheGymZ member onboarding"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-plum-900/86 via-plum-900/55 to-plum-900/18" />
          <div className="relative flex min-h-[380px] flex-col justify-end p-8 text-white sm:p-10 lg:min-h-[720px]">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/68">
              Member onboarding
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              {portalCopy.signup.title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/84 sm:text-lg">
              {portalCopy.signup.subtitle}
            </p>

            <div className="mt-8 space-y-3 sm:max-w-lg">
              <div className={`rounded-2xl border px-4 py-4 text-sm leading-7 ${step === 'email' || step === 'no-membership' ? 'border-white/22 bg-white/14 text-white' : 'border-white/10 bg-white/8 text-white/72'}`}>
                1. Share the email you used when joining SheGymZ.
              </div>
              <div className={`rounded-2xl border px-4 py-4 text-sm leading-7 ${step === 'otp' ? 'border-white/22 bg-white/14 text-white' : 'border-white/10 bg-white/8 text-white/72'}`}>
                2. Enter the secure code we send to your inbox.
              </div>
              <div className={`rounded-2xl border px-4 py-4 text-sm leading-7 ${step === 'verified' || step === 'account-created' ? 'border-white/22 bg-white/14 text-white' : 'border-white/10 bg-white/8 text-white/72'}`}>
                3. Finish your member account with a password or Google.
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/12 bg-white/10 p-5 text-sm leading-7 text-white/82">
              Already set up? Use the{' '}
              <a href={loginHref} className="font-semibold text-white">
                member sign-in
              </a>{' '}
              instead.
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-white/75 bg-white/92 p-8 shadow-[0_28px_90px_rgba(53,18,41,0.09)] backdrop-blur-xl sm:p-10">
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
                  className="w-full rounded-2xl border border-plum-200 bg-sand/40 px-4 py-3 text-base outline-none ring-0 transition focus:border-plum-700"
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
            <div className="mt-8 rounded-[2rem] border border-rose-100 bg-rose-50/80 p-6">
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
                  className="rounded-full border border-plum-200 bg-white px-6 py-3 text-center text-sm font-semibold text-plum-900 transition hover:border-plum-400"
                >
                  {portalCopy.signup.goToSheGymZ}
                </Link>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
              {message && (
                <div className="rounded-2xl border border-plum-100 bg-[#faf7f4] px-4 py-4 text-sm leading-7 text-plum-900">
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
                  className="w-full rounded-2xl border border-plum-200 bg-sand/40 px-4 py-3 text-base tracking-[0.3em] outline-none transition focus:border-plum-700"
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
                  {isLoading ? 'Checking your code...' : portalCopy.signup.verifyCodeCta}
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="rounded-full border border-plum-200 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-plum-400 disabled:opacity-60"
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
              <div className="rounded-[1.75rem] border border-plum-100 bg-[#faf7f4] p-5 text-sm leading-7 text-plum-900">
                Your account will be connected to <span className="font-semibold">{email}</span>.
              </div>
              <form onSubmit={handleCreatePasswordAccount} className="space-y-5 rounded-3xl border border-plum-100 bg-sand/25 p-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-plum-900">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-plum-200 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-plum-900">
                    Create password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-plum-200 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-plum-900"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-plum-200 bg-white px-4 py-3 text-base outline-none transition focus:border-plum-700"
                    placeholder="Repeat password"
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
                    {isLoading ? 'Creating your account...' : 'Create account with password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => signIn('google', { callbackUrl })}
                    className="rounded-full border border-plum-200 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-plum-400 hover:bg-plum-50"
                  >
                    Continue with Google
                  </button>
                </div>

                <p className="text-sm leading-7 text-plum-700">
                  For your privacy, use the Google account connected to <span className="font-semibold">{email}</span>.
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
