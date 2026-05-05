import { requireProtectedMember } from '@/lib/protected-member';
import { KhulaSchedulerShell } from '@/components/khula-scheduler-shell';

export default async function SchedulePage() {
  const member = await requireProtectedMember();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,223,241,0.45),_transparent_40%),linear-gradient(180deg,#fcfaf8_0%,#f5f1ec_100%)] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] bg-plum-900 p-8 text-white shadow-[0_24px_80px_rgba(53,18,41,0.18)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
            Protected Schedule
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Member schedule access is now part of the portal flow.
          </h1>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <p className="text-base leading-8 text-white/82 sm:text-lg">
              This schedule only opens after the portal validates both the session and the active
              paid-member email behind <span className="font-semibold text-white">{member.email}</span>.
              The route stays fast by caching successful membership checks briefly instead of
              re-running the heavy provider lookup on every protected render.
            </p>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
                Portal Contract
              </p>
              <p className="mt-3 text-sm leading-7 text-white/82">
                Auth first. Membership second. Schedule surface third. That sequence stays intact
                even as deeper booking behavior is added later.
              </p>
            </div>
          </div>
        </section>
        <KhulaSchedulerShell />
      </div>
    </main>
  );
}
