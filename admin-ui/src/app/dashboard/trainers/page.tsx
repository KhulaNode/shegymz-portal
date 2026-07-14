import { prisma } from '@/lib/prisma'
import { createTrainer, toggleTrainerActive } from './actions'

export default async function TrainersPage() {
  const trainers = await prisma.trainerProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { scheduleBlocks: true, trainingSessions: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trainers</h1>
      </div>

      {/* Create form */}
      <form action={createTrainer} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-zinc-200">Add trainer</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="displayName" placeholder="Display name *" required
            className="input-field" />
          <input name="email" type="email" placeholder="Email"
            className="input-field" />
          <input name="bio" placeholder="Bio"
            className="input-field" />
        </div>
        <button type="submit"
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-sm font-medium transition-colors">
          Create trainer
        </button>
      </form>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-400">
            <tr>
              {['Name', 'Email', 'Blocks', 'Sessions', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {trainers.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-white font-medium">{t.displayName}</td>
                <td className="px-4 py-3 text-zinc-400">{t.email ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{t._count.scheduleBlocks}</td>
                <td className="px-4 py-3 text-zinc-400">{t._count.trainingSessions}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.active ? 'bg-green-900 text-green-300' : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleTrainerActive.bind(null, t.id, !t.active)}>
                    <button type="submit"
                      className="text-xs text-zinc-400 hover:text-white underline">
                      {t.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trainers.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500 text-sm">No trainers yet</p>
        )}
      </div>
    </div>
  )
}