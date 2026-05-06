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
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Your SheGymZ Space" />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[2.5rem] border border-white/75 bg-white/92 p-8 shadow-[0_28px_90px_rgba(53,18,41,0.09)] backdrop-blur-xl sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              Member home
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-plum-900 sm:text-5xl">
              {portalCopy.dashboard.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-plum-800 sm:text-lg">
              {portalCopy.dashboard.subtitle}
            </p>
            {session?.user?.email && (
              <p className="mt-5 rounded-full border border-plum-100 bg-[#faf7f4] px-5 py-3 text-sm text-plum-800 sm:inline-flex">
                Signed in as <span className="font-semibold text-plum-900">&nbsp;{session.user.email}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/schedule"
                className="inline-flex justify-center rounded-full bg-rose-300 px-6 py-3 text-sm font-semibold text-plum-900 shadow-[0_14px_34px_rgba(53,18,41,0.12)] transition hover:bg-rose-200"
              >
                {portalCopy.dashboard.schedulerCta}
              </Link>
              <LogoutButton className="justify-center" />
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[2.5rem] shadow-[0_28px_90px_rgba(53,18,41,0.13)]">
            <Image
              src="/images/IMG_3757.jpeg"
              alt="SheGymZ member area"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/74 via-plum-900/24 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/68">
                Member-only space
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                Private, calm access to your SheGymZ rhythm.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Link
            href="/schedule"
            className="group rounded-[2.1rem] border border-white/75 bg-white/94 p-7 shadow-[0_20px_70px_rgba(53,18,41,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_86px_rgba(53,18,41,0.11)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              Bookings
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

          <div className="rounded-[2.1rem] border border-plum-100/80 bg-[#faf7f4]/92 p-7 shadow-[0_20px_70px_rgba(53,18,41,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
                  Membership
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-plum-900">
                  {portalCopy.dashboard.membershipTitle}
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                {portalCopy.dashboard.statusLabel}
              </span>
            </div>
            <p className="mt-4 text-base leading-8 text-plum-800">
              {portalCopy.dashboard.membershipDescription}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
