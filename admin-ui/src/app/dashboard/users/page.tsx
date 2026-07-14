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
      <form action={createUserAction} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-zinc-200">Add user</h2>
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
        <button type="submit" className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-sm font-medium transition-colors">
          Create user
        </button>
      </form>

      {/* User list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-400">
            <tr>
              {['Name', 'Email', 'Role', 'Trainer ID', 'Created', 'Reset Password', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-white">{u.name}</td>
                <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-pink-900 text-pink-300' : 'bg-zinc-700 text-zinc-300'
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
                    <button type="submit" className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500">
                      Reset
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteUserAction.bind(null, u.id)}>
                    <button type="submit" className="text-xs text-red-400 hover:text-red-300">
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
