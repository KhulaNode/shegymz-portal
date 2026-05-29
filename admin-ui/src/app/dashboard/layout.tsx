import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/trainers', label: 'Trainers' },
  { href: '/dashboard/schedule-blocks', label: 'Schedule Blocks' },
  { href: '/dashboard/sessions', label: 'Sessions' },
  { href: '/dashboard/members', label: 'Members' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-800">
          <p className="text-white font-bold text-lg leading-tight">SheGymZ</p>
          <p className="text-pink-400 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2 truncate">{session.user?.email}</p>
          <Link
            href="/api/auth/signout"
            className="block text-xs text-zinc-400 hover:text-white"
          >
            Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
