import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllUsers } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { createUserAction, deleteUserAction, resetPasswordAction } from './actions'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'ADMIN') redirect('/dashboard')

  const [users, trainers] = await Promise.all([
    getAllUsers(),
    prisma.trainerProfile.findMany({ orderBy: { displayName: 'asc' } }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Users</h1>

      {/* Create user form */}
      <form action={createUserAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Add user</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Name</label>
            <input name="name" required placeholder="Display name" className="input-field w-full" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required placeholder="user@example.com" className="input-field w-full" />
          </div>
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" required minLength={8} placeholder="Min 8 chars" className="input-field w-full" />
          </div>
          <div>
            <label className="label">Role</label>
            <select name="role" required className="input-field w-full">
              <option value="ADMIN">ADMIN</option>
              <option value="TRAINER">TRAINER</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Trainer profile (required for TRAINER role)</label>
            <select name="trainerId" className="input-field w-full">
              <option value="">— none (admin) —</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.displayName} ({t.id})</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500">
          Create user
        </button>
      </form>

      {/* User list */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              {['Name', 'Email', 'Role', 'Trainer ID', 'Created', 'Reset Password', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-zinc-900 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{u.trainerId ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{u.createdAt.toISOString().split('T')[0]}</td>
                <td className="px-4 py-3">
                  <form action={resetPasswordAction} className="flex gap-2 items-center">
                    <input type="hidden" name="id" value={u.id} />
                    <input name="password" type="password" minLength={8} placeholder="New password" className="input-field w-32 text-xs" />
                    <button type="submit" className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-500 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-white">
                      Reset
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteUserAction.bind(null, u.id)}>
                    <button type="submit" className="text-xs text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500 text-sm">No users yet</p>
        )}
      </div>
    </div>
  )
}
