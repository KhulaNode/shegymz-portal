'use client';

import { Suspense } from 'react';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

type Step = 'email' | 'otp' | 'verified' | 'account-created';
type VerifyOtpResponse = {
  error?: string;
  continuationExpiresInSeconds?: number;
};
type PasswordAccountResponse = {
  error?: string;
  loginEmail?: string;
};

const SIGNUP_AUTH_ERROR_MESSAGES: Record<string, string> = {
  'google-email-missing': 'Google did not return an email address for this account. Use a Google account with a visible email address.',
  'google-email-mismatch':
    'That Google account does not match the paid-member email that passed OTP. Sign in with the same email used for payment and OTP.',
  'signup-gate-required':
    'Google signup must start from the OTP-passed signup flow. Begin again with the paid-member email and verification code.',
  'google-account-missing':
    'Google sign-in did not return a usable account identity. Please try again.',
  'google-account-already-linked':
    'That Google account is already linked to a different portal user. Use the correct paid-member email or log in to the existing account.',
};

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
  const callbackUrl = nextParam?.startsWith('/') ? nextParam : '/portal';
  const loginHref = nextParam?.startsWith('/')
    ? `/login?next=${encodeURIComponent(nextParam)}`
    : '/login';

  async function handleRequestOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
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
        throw new Error(data.error ?? 'Could not start portal verification');
      }

      setStep('otp');
      setMessage(
        `Verification code sent to ${data.email}. It expires in ${data.expiresInMinutes} minutes.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start portal verification');
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
        throw new Error(data.error ?? 'Verification failed');
      }

      setStep('verified');
      setMessage(
        `Verification passed. Your signup session is locked to this paid-member email for the next ${Math.floor((data.continuationExpiresInSeconds ?? 0) / 60)} minutes.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePasswordAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password confirmation does not match');
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
        throw new Error(data.error ?? 'Could not create your portal account');
      }

      setStep('account-created');
      setMessage(
        `Portal account created for ${data.loginEmail ?? email}. Use this same paid-member email on the login screen.`,
      );
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your portal account');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,223,241,0.55),_transparent_42%),linear-gradient(180deg,#fcfaf8_0%,#f5f1ec_100%)] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-plum-900 p-8 text-white shadow-[0_24px_80px_rgba(53,18,41,0.18)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
            First-Time Signup
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Turn a paid SheGymZ membership into a verified portal account.
          </h1>
          <p className="mt-5 text-base leading-8 text-white/82 sm:text-lg">
            Signup is intentionally tight. The portal checks the paid-member email first, sends
            a verification code, then locks account creation to that exact email.
          </p>

          <div className="mt-8 space-y-3">
            <div className={`rounded-2xl border px-4 py-4 text-sm ${step === 'email' ? 'border-white/20 bg-white/14 text-white' : 'border-white/10 bg-white/8 text-white/72'}`}>
              1. Confirm the paid-member email before OTP is sent.
            </div>
            <div className={`rounded-2xl border px-4 py-4 text-sm ${step === 'otp' ? 'border-white/20 bg-white/14 text-white' : 'border-white/10 bg-white/8 text-white/72'}`}>
              2. Verify the OTP and bind the signup session to that email.
            </div>
            <div className={`rounded-2xl border px-4 py-4 text-sm ${(step === 'verified' || step === 'account-created') ? 'border-white/20 bg-white/14 text-white' : 'border-white/10 bg-white/8 text-white/72'}`}>
              3. Finish account creation with password or Google.
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/8 p-5 text-sm leading-7 text-white/80">
            Already onboarded? Use the{' '}
            <a href={loginHref} className="font-semibold text-white">
              returning-member login
            </a>{' '}
            instead of restarting signup.
          </div>
        </section>

        <section className="rounded-[2rem] border border-plum-100/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
            Portal Signup
          </p>
          <h2 className="mt-4 text-3xl font-bold text-plum-900 sm:text-4xl">
            Verify first. Create the account after the portal trusts the email.
          </h2>
          <p className="mt-4 text-base leading-8 text-plum-800 sm:text-lg">
            This keeps `1 email = 1 user = 1 subscription` intact from payment through protected access.
          </p>

          {authErrorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
              {authErrorMessage}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-plum-900">
                  Membership Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-plum-200 bg-sand/35 px-4 py-3 text-base outline-none ring-0 transition focus:border-plum-700"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isLoading ? 'Checking membership...' : 'Check membership and send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
              <div className="rounded-2xl border border-plum-100 bg-sand px-4 py-4 text-sm leading-7 text-plum-900">
                {message}
              </div>

              <div>
                <label htmlFor="otpCode" className="mb-2 block text-sm font-semibold text-plum-900">
                  6-digit verification code
                </label>
                <input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-2xl border border-plum-200 bg-sand/35 px-4 py-3 text-base tracking-[0.3em] outline-none transition focus:border-plum-700"
                  placeholder="000000"
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
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtpCode('');
                    setError('');
                    setMessage('');
                  }}
                  className="rounded-full border border-plum-300 px-6 py-3 text-sm font-semibold text-plum-900"
                >
                  Start over
                </button>
              </div>
            </form>
          )}

          {step === 'verified' && (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                {message}
              </div>
              <div className="rounded-3xl border border-plum-100 bg-sand/65 p-5 text-sm leading-7 text-plum-900">
                Verified member identity:
                <br />
                <span className="font-semibold">{email}</span>
                <br />
                This is now the only email allowed for portal account creation.
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

              {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isLoading ? 'Creating account...' : 'Create account with password'}
                </button>
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl })}
                  className="rounded-full border border-plum-300 px-6 py-3 text-sm font-semibold text-plum-900"
                >
                  Continue with Google
                </button>
              </div>

              <p className="text-sm text-plum-700">
                Google signup is allowed only for <span className="font-semibold">{email}</span>.
                Direct Google entry without this OTP-passed signup gate will be rejected.
              </p>
              </form>
            </div>
          )}

          {step === 'account-created' && (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                {message}
              </div>
              <a
                href={loginHref}
                className="inline-flex rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Continue to login
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
