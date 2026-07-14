import { prisma } from '@/lib/prisma'

export default async function MembersPage() {
  const members = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      membershipStatus: true,
      createdAt: true,
    },
  })

  type MemberRow = (typeof members)[number]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Members</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-400">
            <tr>
              {['Name', 'Email', 'Membership', 'Joined'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {members.map((m: MemberRow) => (
              <tr key={m.id} className="hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-white">{m.name ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{m.email}</td>
                <td className="px-4 py-3">
                  {m.membershipStatus ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.membershipStatus === 'ACTIVE'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {m.membershipStatus}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs">Unknown</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {m.createdAt.toLocaleDateString('en-ZA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500 text-sm">No members yet</p>
        )}
      </div>
    </div>
  )
}
