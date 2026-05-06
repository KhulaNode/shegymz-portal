import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { LogoutButton } from '@/components/logout-button';
import Link from 'next/link';
import Image from 'next/image';
import { requireProtectedMember } from '@/lib/protected-member';
import { portalCopy } from '@/content/portal-copy';

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  await requireProtectedMember();

  return (
    <main className="portal-shell min-h-screen px-5 py-6 sm:px-8 lg:px-10">

      {/* ── Signed-in header ─────────────────────────────── */}
      <header className="mb-5 sm:mb-8">
        <div className="mx-auto flex max-w-6xl flex-row items-center justify-between gap-3 rounded-[1.5rem] sm:rounded-[2rem] border border-warmgray-200/80 bg-[#fffaf8]/96 px-4 py-3 shadow-[0_18px_60px_rgba(74,44,74,0.08)] sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="SheGymZ"
              width={132}
              height={52}
              className="h-9 w-auto object-contain sm:h-10"
              priority
            />
            <span className="hidden truncate text-sm font-medium text-plum-900/90 sm:block">
              {portalCopy.dashboard.title}
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">

        {/* ── Top section: welcome + atmosphere image ──────── */}
        <section className="grid gap-5 sm:gap-6 lg:grid-cols-[1.12fr_0.88fr]">

          {/* Welcome card */}
          <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-6 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              {portalCopy.dashboard.memberHomeLabel}
            </p>
            <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-plum-900 sm:mt-4 sm:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-br from-plum-900 via-[#9b3a72] to-[#c45c80] bg-clip-text text-transparent">
                {portalCopy.dashboard.title}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-plum-800 sm:text-base sm:leading-8">
              {portalCopy.dashboard.subtitle}
            </p>
            {session?.user?.email && (
              <p className="mt-4 rounded-full border border-warmgray-200 bg-warmgray-50 px-4 py-2.5 text-sm text-plum-800 sm:mt-5 sm:inline-flex sm:px-5 sm:py-3">
                {portalCopy.dashboard.signedInAs}{' '}
                <span className="font-semibold text-plum-900">&nbsp;{session.user.email}</span>
              </p>
            )}
          </div>

          {/* Atmosphere image card */}
          <div className="relative min-h-[220px] overflow-hidden rounded-[2rem] sm:min-h-[320px] sm:rounded-[2.5rem] shadow-[0_28px_90px_rgba(74,44,74,0.12)]">
            <Image
              src="/images/showcase2.jpeg"
              alt="SheGymZ member space"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/90 via-[#7d2d6c]/28 to-transparent" />
            {/* Sparkles */}
            <span aria-hidden className="pointer-events-none absolute right-6 top-8 select-none text-lg text-rose-300/55">✦</span>
            <span aria-hidden className="pointer-events-none absolute right-14 top-20 select-none text-xs text-white/20">✦</span>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Member-only space
              </p>
              <p className="mt-2 text-lg font-semibold leading-tight sm:mt-3 sm:text-2xl">
                {portalCopy.dashboard.atmosphereTitle}
              </p>
            </div>
          </div>
        </section>

        {/* ── Bottom section: bookings first on mobile ─────── */}
        <section className="grid gap-5 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Bookings / Schedule — first on mobile, first on desktop */}
          <Link
            href="/schedule"
            className="group order-1 rounded-[2rem] sm:rounded-[2.1rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-6 shadow-[0_20px_70px_rgba(74,44,74,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_86px_rgba(74,44,74,0.11)] sm:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              {portalCopy.dashboard.bookingsLabel}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-plum-900 sm:mt-4 sm:text-3xl">
              {portalCopy.dashboard.schedulerTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-plum-800 sm:mt-4 sm:text-base sm:leading-8">
              {portalCopy.dashboard.schedulerDescription}
            </p>
            <span className="mt-5 inline-flex rounded-full bg-gradient-to-r from-plum-900 via-[#7d2d6c] to-[#b5406a] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(74,44,74,0.22)] transition group-hover:shadow-[0_12px_32px_rgba(74,44,74,0.30)]">
              {portalCopy.dashboard.schedulerCta}
            </span>
          </Link>

          {/* Membership — second on mobile */}
          <div className="order-2 rounded-[2rem] sm:rounded-[2.1rem] border border-warmgray-200/90 bg-warmgray-50/92 p-6 shadow-[0_20px_70px_rgba(74,44,74,0.06)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
                  Membership
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-plum-900 sm:mt-4 sm:text-3xl">
                  {portalCopy.dashboard.membershipTitle}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-plum-900 sm:px-4 sm:py-2">
                {portalCopy.dashboard.membershipPill}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-plum-800 sm:mt-4 sm:text-base sm:leading-8">
              {portalCopy.dashboard.membershipDescription}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-plum-900 sm:mt-5">
              {portalCopy.dashboard.statusLabel}
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
