import Image from 'next/image';
import Link from 'next/link';
import { requireProtectedMember } from '@/lib/protected-member';
import { KhulaSchedulerShell } from '@/components/khula-scheduler-shell';
import { PortalBrandHeader } from '@/components/portal-brand-header';

export default async function SchedulePage() {
  await requireProtectedMember();

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Mina Scheduler" />
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.5rem] border border-white/75 bg-white/92 p-8 shadow-[0_28px_90px_rgba(53,18,41,0.09)] backdrop-blur-xl sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              Mina Scheduler
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-plum-900 sm:text-5xl">
              Make space for yourself.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-plum-800 sm:text-lg">
              Manage your sessions and stay up to date with your SheGymZ schedule.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/portal"
                className="inline-flex justify-center rounded-full border border-plum-200 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-plum-400"
              >
                Back to your SheGymZ space
              </Link>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[2.5rem] shadow-[0_28px_90px_rgba(53,18,41,0.13)]">
            <Image
              src="/images/showcase2.jpeg"
              alt="SheGymZ schedule mood"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 via-plum-900/24 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/68">
                Your rhythm
              </p>
              <p className="mt-3 max-w-md text-2xl font-semibold leading-tight">
                Plan your sessions with a little more ease and a lot more intention.
              </p>
            </div>
          </div>
        </section>
        <KhulaSchedulerShell />
      </div>
    </main>
  );
}
