import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cancelSession, markAttendance } from './actions'

function fmt(d: Date) {
  return d.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isTrainer = session?.user.role === 'TRAINER'
  const trainerId = session?.user.trainerId ?? null

  const { tab } = await searchParams
  const view = tab === 'past' ? 'past' : 'upcoming'
  const now = new Date()

  const trainerFilter = isTrainer && trainerId ? { trainerProfileId: trainerId } : {}

  const sessions = await prisma.trainingSession.findMany({
    where: {
      ...trainerFilter,
      ...(view === 'upcoming'
        ? { status: 'SCHEDULED', startsAt: { gt: now } }
        : { startsAt: { lte: now } }),
    },
    orderBy: { startsAt: view === 'upcoming' ? 'asc' : 'desc' },
    take: 100,
    include: {
      memberUser: { select: { name: true, email: true } },
      trainerProfile: { select: { displayName: true } },
      attendance: true,
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isTrainer ? 'My Sessions' : 'Sessions'}</h1>

      <div className="flex gap-2">
        {(['upcoming', 'past'] as const).map((t) => (
          <a
            key={t}
            href={`/dashboard/sessions${t === 'past' ? '?tab=past' : ''}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === t ? 'bg-pink-600 text-white' : 'bg-zinc-200 text-zinc-600 hover:text-zinc-950 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </a>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              {['Member', 'Trainer', 'Starts at', 'Status', 'Attendance', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <p className="text-zinc-900 dark:text-white">{s.memberUser.name ?? '—'}</p>
                  <p className="text-zinc-500 text-xs">{s.memberUser.email}</p>
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{s.trainerProfile.displayName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">{fmt(s.startsAt)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    s.status === 'CANCELLED_BY_MEMBER' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {s.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {s.attendance ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      s.attendance.outcome === 'ATTENDED' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      s.attendance.outcome === 'MISSED' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                    }`}>
                      {s.attendance.outcome}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 flex gap-3 items-center">
                  {s.status === 'SCHEDULED' && s.startsAt > now && (
                    <form action={cancelSession.bind(null, s.id)}>
                      <button type="submit" className="text-xs text-red-600 underline hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">Cancel</button>
                    </form>
                  )}
                  {s.status === 'SCHEDULED' && s.startsAt <= now && !s.attendance && (
                    <form action={markAttendance} className="flex gap-2 items-center">
                      <input type="hidden" name="sessionId" value={s.id} />
                      <select name="outcome" className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <option value="ATTENDED">Attended</option>
                        <option value="MISSED">Missed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <button type="submit" className="rounded bg-pink-600 px-2 py-1 text-xs text-white hover:bg-pink-500">Save</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500 text-sm">No sessions</p>
        )}
      </div>
    </div>
  )
}
