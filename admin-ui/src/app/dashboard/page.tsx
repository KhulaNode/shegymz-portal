import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const [trainers, slots, sessions, members] = await Promise.all([
    prisma.trainerProfile.count({ where: { active: true } }),
    prisma.trainerAvailabilitySlot.count({
      where: { status: 'AVAILABLE', startsAt: { gt: new Date() } },
    }),
    prisma.trainingSession.count({
      where: { status: 'SCHEDULED', startsAt: { gt: new Date() } },
    }),
    prisma.user.count(),
  ])

  const stats = [
    { label: 'Active trainers', value: trainers },
    { label: 'Available slots', value: slots },
    { label: 'Upcoming sessions', value: sessions },
    { label: 'Total members', value: members },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
