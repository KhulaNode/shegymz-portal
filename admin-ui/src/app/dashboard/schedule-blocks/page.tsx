import { prisma } from '@/lib/prisma'
import { createScheduleBlock, deleteScheduleBlock, toggleBlockActive } from './actions'

function minsToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export default async function ScheduleBlocksPage() {
  const [trainers, blocks] = await Promise.all([
    prisma.trainerProfile.findMany({ where: { active: true }, orderBy: { displayName: 'asc' } }),
    prisma.trainerScheduleBlock.findMany({
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
      <h1 className="text-2xl font-bold">Schedule Blocks</h1>

      {/* Create form */}
      <form action={createScheduleBlock} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-zinc-200">Add schedule block</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="label">Trainer *</label>
            <select name="trainerProfileId" required className="input-field w-full">
              <option value="">Select trainer</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
            </select>
          </div>
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
        <button type="submit"
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-sm font-medium transition-colors">
          Create block
        </button>
      </form>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-400">
            <tr>
              {['Trainer', 'Type', 'Day / Date', 'Time range', 'Duration', 'Slots', 'Active', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {blocks.map((b) => (
              <tr key={b.id} className="hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-white">{b.trainerProfile.displayName}</td>
                <td className="px-4 py-3 text-zinc-400">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    b.scheduleType === 'RECURRING' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                  }`}>
                    {b.scheduleType === 'RECURRING' ? 'Recurring' : 'One-off'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {b.scheduleType === 'RECURRING'
                    ? b.dayOfWeek
                    : b.specificDate?.toISOString().split('T')[0] ?? '—'}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {minsToTime(b.startMinutes)} – {minsToTime(b.endMinutes)}
                </td>
                <td className="px-4 py-3 text-zinc-400">{b.slotDurationMinutes}m</td>
                <td className="px-4 py-3 text-zinc-400">{b._count.generatedSlots}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    b.active ? 'bg-green-900 text-green-300' : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {b.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <form action={toggleBlockActive.bind(null, b.id, !b.active)}>
                    <button type="submit" className="text-xs text-zinc-400 hover:text-white underline">
                      {b.active ? 'Disable' : 'Enable'}
                    </button>
                  </form>
                  <form action={deleteScheduleBlock.bind(null, b.id)}>
                    <button type="submit" className="text-xs text-red-400 hover:text-red-300 underline"
                      onClick={(e) => { if (!confirm('Delete this block and its future slots?')) e.preventDefault() }}>
                      Delete
                    </button>
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
