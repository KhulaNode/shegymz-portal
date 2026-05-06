import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { LogoutButton } from '@/components/logout-button';
import Link from 'next/link';
import Image from 'next/image';
import { requireProtectedMember } from '@/lib/protected-member';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  await requireProtectedMember();

  return (
    <main className="portal-shell min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent={portalCopy.dashboard.title} />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[2.5rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-8 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              {portalCopy.dashboard.memberHomeLabel}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-plum-900 sm:text-5xl">
              {portalCopy.dashboard.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-plum-800 sm:text-lg">
              {portalCopy.dashboard.subtitle}
            </p>
            {session?.user?.email && (
              <p className="mt-5 rounded-full border border-warmgray-200 bg-warmgray-50 px-5 py-3 text-sm text-plum-800 sm:inline-flex">
                {portalCopy.dashboard.signedInAs}{' '}
                <span className="font-semibold text-plum-900">&nbsp;{session.user.email}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/schedule"
                className="inline-flex justify-center rounded-full bg-rose-300 px-6 py-3 text-sm font-semibold text-plum-900 shadow-[0_14px_34px_rgba(74,44,74,0.12)] transition hover:bg-rose-200"
              >
                {portalCopy.dashboard.schedulerCta}
              </Link>
              <LogoutButton className="justify-center" />
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[2.5rem] border border-rose-200/60 bg-gradient-to-br from-[#f8eef2] via-[#f6f0f5] to-[#f1e7ef] shadow-[0_28px_90px_rgba(74,44,74,0.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(217,136,154,0.12),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(107,61,107,0.08),_transparent_38%)]" />
            <Image
              src="/images/logo.png"
              alt="SheGymZ"
              fill
              className="object-contain p-12 opacity-[0.06] saturate-0 sm:p-16"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/84 via-plum-900/18 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/68">
                Member-only space
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                {portalCopy.dashboard.atmosphereTitle}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Link
            href="/schedule"
            className="group rounded-[2.1rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-7 shadow-[0_20px_70px_rgba(74,44,74,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_86px_rgba(74,44,74,0.11)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              {portalCopy.dashboard.bookingsLabel}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-plum-900">
              {portalCopy.dashboard.schedulerTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-plum-800">
              {portalCopy.dashboard.schedulerDescription}
            </p>
            <span className="mt-6 inline-flex rounded-full bg-plum-900 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-plum-800">
              {portalCopy.dashboard.schedulerCta}
            </span>
          </Link>

          <div className="rounded-[2.1rem] border border-warmgray-200/90 bg-warmgray-50/92 p-7 shadow-[0_20px_70px_rgba(74,44,74,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
                  Membership
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-plum-900">
                  {portalCopy.dashboard.membershipTitle}
                </h2>
              </div>
              <span className="rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-plum-900">
                {portalCopy.dashboard.membershipPill}
              </span>
            </div>
            <p className="mt-4 text-base leading-8 text-plum-800">
              {portalCopy.dashboard.membershipDescription}
            </p>
            <p className="mt-5 inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-plum-900">
              {portalCopy.dashboard.statusLabel}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
