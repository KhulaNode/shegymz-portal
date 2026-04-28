'use client';

import { FormEvent, useState } from 'react';

type Step = 'email' | 'otp' | 'verified';

export default function SignupPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Verification failed');
      }

      setStep('verified');
      setMessage('Verification passed. Milestone 3 will unlock Google or password account creation here.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-plum-100 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
          First-Time Signup
        </p>
        <h1 className="mb-4 text-4xl font-bold text-plum-900">Membership check and OTP gate</h1>
        <p className="mb-6 text-lg leading-8 text-plum-800">
          Portal signup starts with the same email used during SheGymZ payment. The portal
          checks active Paystack membership before it sends an OTP.
        </p>

        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-plum-900">
                Membership Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-plum-200 px-4 py-3 text-base outline-none ring-0 transition focus:border-plum-700"
                placeholder="you@example.com"
                required
              />
            </div>

            {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-plum-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? 'Checking membership...' : 'Check membership and send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="rounded-2xl bg-sand px-4 py-3 text-sm text-plum-900">{message}</div>

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
                className="w-full rounded-2xl border border-plum-200 px-4 py-3 text-base tracking-[0.3em] outline-none transition focus:border-plum-700"
                placeholder="000000"
                required
              />
            </div>

            {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-plum-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
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
                className="rounded-2xl border border-plum-300 px-5 py-3 text-sm font-semibold text-plum-900"
              >
                Start over
              </button>
            </div>
          </form>
        )}

        {step === 'verified' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              {message}
            </div>
            <div className="rounded-2xl bg-sand p-5 text-sm leading-7 text-plum-900">
              Next milestone:
              <br />
              1. open Google signup after this gate
              <br />
              2. open email/password account creation after this gate
              <br />
              3. keep direct login for returning members only
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
