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
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">{s.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
