import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

const adminNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/trainers', label: 'Trainers' },
  { href: '/dashboard/schedule-blocks', label: 'Schedule Blocks' },
  { href: '/dashboard/sessions', label: 'Sessions' },
  { href: '/dashboard/members', label: 'Members' },
  { href: '/dashboard/users', label: 'Users' },
]

const trainerNav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/schedule-blocks', label: 'My Schedule' },
  { href: '/dashboard/sessions', label: 'My Sessions' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const nav = isAdmin ? adminNav : trainerNav

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
          <div>
            <p className="text-lg font-bold leading-tight text-zinc-900 dark:text-white">SheGymZ</p>
            <p className="mt-0.5 text-xs text-pink-600 dark:text-pink-400">{isAdmin ? 'Admin Panel' : 'Trainer Portal'}</p>
          </div>
          <ThemeToggle className="-mr-1 -mt-1" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{session.user.name}</p>
          <p className="mb-2 truncate text-xs text-zinc-500 dark:text-zinc-500">{session.user.email}</p>
          <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs ${isAdmin ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'}`}>
            {session.user.role}
          </span>
          <Link href="/api/auth/signout" className="block text-xs text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
            Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
