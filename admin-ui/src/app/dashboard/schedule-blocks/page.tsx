import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createScheduleBlock, deleteScheduleBlock, toggleBlockActive } from './actions'

function minsToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export default async function ScheduleBlocksPage() {
  const session = await getServerSession(authOptions)
  const isTrainer = session?.user.role === 'TRAINER'
  const trainerId = session?.user.trainerId ?? null

  const [trainers, blocks] = await Promise.all([
    prisma.trainerProfile.findMany({ where: { active: true }, orderBy: { displayName: 'asc' } }),
    prisma.trainerScheduleBlock.findMany({
      where: isTrainer && trainerId ? { trainerProfileId: trainerId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        trainerProfile: { select: { displayName: true } },
        _count: { select: { generatedSlots: true } },
      },
    }),
  ])

  const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
  const TIMEZONES = ['Africa/Johannesburg', 'UTC', 'Africa/Lagos', 'Africa/Nairobi']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isTrainer ? 'My Schedule' : 'Schedule Blocks'}</h1>

      {/* Create form */}
      <form action={createScheduleBlock} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Add schedule block</h2>
        <div className="grid grid-cols-3 gap-3">
          {isTrainer ? (
            <input type="hidden" name="trainerProfileId" value={trainerId ?? ''} />
          ) : (
            <div className="col-span-1">
              <label className="label">Trainer *</label>
              <select name="trainerProfileId" required className="input-field w-full">
                <option value="">Select trainer</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Type *</label>
            <select name="scheduleType" required className="input-field w-full">
              <option value="RECURRING">Recurring (weekly)</option>
              <option value="ONE_OFF">One-off (specific date)</option>
            </select>
          </div>
          <div>
            <label className="label">Day of week</label>
            <select name="dayOfWeek" className="input-field w-full">
              <option value="">— for one-off —</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Specific date</label>
            <input name="specificDate" type="date" className="input-field w-full" />
          </div>
          <div>
            <label className="label">Start time *</label>
            <input name="startTime" type="time" defaultValue="10:00" required className="input-field w-full" />
          </div>
          <div>
            <label className="label">End time *</label>
            <input name="endTime" type="time" defaultValue="13:00" required className="input-field w-full" />
          </div>
          <div>
            <label className="label">Slot duration (min) *</label>
            <input name="slotDurationMinutes" type="number" defaultValue="60" min="15" max="480" required className="input-field w-full" />
          </div>
          <div>
            <label className="label">Timezone</label>
            <select name="timezone" className="input-field w-full">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500">
          Create block
        </button>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              {['Trainer', 'Type', 'Day / Date', 'Time range', 'Duration', 'Slots', 'Active', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {blocks.map((b) => (
              <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-zinc-900 dark:text-white">{b.trainerProfile.displayName}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${b.scheduleType === 'RECURRING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'}`}>
                    {b.scheduleType === 'RECURRING' ? 'Recurring' : 'One-off'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {b.scheduleType === 'RECURRING' ? b.dayOfWeek : b.specificDate?.toISOString().split('T')[0] ?? '—'}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{minsToTime(b.startMinutes)} – {minsToTime(b.endMinutes)}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{b.slotDurationMinutes}m</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{b._count.generatedSlots}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${b.active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                    {b.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <form action={toggleBlockActive.bind(null, b.id, !b.active)}>
                    <button type="submit" className="text-xs text-zinc-600 underline hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
                      {b.active ? 'Disable' : 'Enable'}
                    </button>
                  </form>
                  <form action={deleteScheduleBlock.bind(null, b.id)}>
                    <button type="submit" className="text-xs text-red-600 underline hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blocks.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500 text-sm">No schedule blocks yet</p>
        )}
      </div>
    </div>
  )
}
