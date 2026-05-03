'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleCredentialsLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/portal',
    });

    setIsLoading(false);

    if (!result || result.error) {
      setError('Login failed. Use the same paid-member email and the password set during signup.');
      return;
    }

    router.push(result.url ?? '/portal');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-sand px-6 py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-plum-100 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
          Returning Members
        </p>
        <h1 className="mb-4 text-4xl font-bold text-plum-900">Login to the portal</h1>
        <p className="mb-6 text-lg leading-8 text-plum-800">
          Use the same email that was used for SheGymZ payment and portal signup.
        </p>

        <form onSubmit={handleCredentialsLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-plum-900">
              Paid-member email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-plum-200 px-4 py-3 text-base outline-none transition focus:border-plum-700"
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
              className="w-full rounded-2xl border border-plum-200 px-4 py-3 text-base outline-none transition focus:border-plum-700"
              placeholder="Your password"
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
              {isLoading ? 'Logging in...' : 'Login with password'}
            </button>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/portal' })}
              className="rounded-2xl border border-plum-300 px-5 py-3 text-sm font-semibold text-plum-900"
            >
              Continue with Google
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
