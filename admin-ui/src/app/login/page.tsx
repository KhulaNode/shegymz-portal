'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <ThemeToggle className="absolute right-5 top-5" />
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">SheGymZ</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Admin &amp; Trainer Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Password</label>
            <input
              name="password"
              type="password"
              required
              className="input-field w-full"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-pink-600 py-2 font-medium text-white transition-colors hover:bg-pink-500 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
