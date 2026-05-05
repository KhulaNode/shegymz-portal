import Image from 'next/image';
import { requireProtectedMember } from '@/lib/protected-member';
import { KhulaSchedulerShell } from '@/components/khula-scheduler-shell';
import { PortalBrandHeader } from '@/components/portal-brand-header';

export default async function SchedulePage() {
  const member = await requireProtectedMember();

  return (
    <main className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Protected Schedule" />
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.5rem] border border-plum-100/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              Protected Schedule
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-plum-900 sm:text-5xl">
              Make space for yourself.
            </h1>
            <p className="mt-6 text-base leading-8 text-plum-800 sm:text-lg">
              Plan your sessions, protect your rhythm, and keep showing up for yourself inside the
              SheGymZ experience.
            </p>
            <div className="mt-8 rounded-[1.75rem] border border-plum-100 bg-[#faf7f4] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
                Your Time
              </p>
              <p className="mt-3 text-sm leading-7 text-plum-800">
                A calmer way to organise your week, your sessions, and your return to yourself.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_24px_80px_rgba(53,18,41,0.12)]">
            <Image
              src="/images/showcase2.jpeg"
              alt="SheGymZ schedule mood"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/68 via-plum-900/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/68">
                Your Rhythm
              </p>
              <p className="mt-3 max-w-md text-2xl font-semibold leading-tight">
                Space to plan, return, and keep showing up for yourself.
              </p>
            </div>
          </div>
        </section>
        <KhulaSchedulerShell />
      </div>
    </main>
  );
}
