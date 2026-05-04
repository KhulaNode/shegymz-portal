import { requireProtectedMember } from '@/lib/protected-member';
import { KhulaSchedulerShell } from '@/components/khula-scheduler-shell';

export default async function MinaPage() {
  const member = await requireProtectedMember();

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-plum-100 bg-plum-900 p-8 text-white shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Protected Scheduler Surface
          </p>
          <h1 className="mb-4 text-4xl font-bold">KhulaScheduler is now inside the member gate</h1>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <p className="text-lg leading-8 text-white/85">
              This scheduler only opens after the portal validates both the session and the
              active paid-member email behind <span className="font-semibold">{member.email}</span>.
              The route stays fast by caching successful membership checks briefly instead of
              re-running the heavy provider lookup on every protected render.
            </p>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Phase 1 Note
              </p>
              <p className="mt-3 text-sm leading-7 text-white/85">
                The scheduler is now mounted as an owned in-portal surface. Deeper booking logic
                and persistence can layer in later without reopening the access-control seam.
              </p>
            </div>
          </div>
        </section>
        <KhulaSchedulerShell />
      </div>
    </main>
  );
}
