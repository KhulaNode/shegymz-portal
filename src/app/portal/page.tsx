import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { LogoutButton } from '@/components/logout-button';
import Link from 'next/link';
import { protectedMemberConfig, requireProtectedMember } from '@/lib/protected-member';

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  const member = await requireProtectedMember();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,223,241,0.45),_transparent_40%),linear-gradient(180deg,#fcfaf8_0%,#f5f1ec_100%)] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-6 rounded-[2rem] bg-plum-900 p-8 text-white shadow-[0_24px_80px_rgba(53,18,41,0.18)] lg:grid-cols-[1.5fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              Member Home
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Your SheGymZ portal is open.
            </h1>
            <div className="mt-5 space-y-4 text-base leading-8 text-white/82 sm:text-lg">
              <p>
                Signed in as <span className="font-semibold text-white">{session?.user?.email}</span>.
              </p>
              <p>
                Access stays protected by both session auth and an active membership recheck tied
                to the paid-member email behind this account.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/schedule"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-white/90"
              >
                Open schedule
              </Link>
              <LogoutButton className="border border-white/20 bg-white/10 hover:bg-white/15" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              Access Status
            </p>
            <dl className="mt-5 space-y-4 text-sm text-white/82">
              <div>
                <dt className="font-semibold text-white">Member email</dt>
                <dd>{member.email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Role</dt>
                <dd>{member.role}</dd>
              </div>
              <div>
                <dt className="font-semibold text-white">Membership recheck cache</dt>
                <dd>{Math.floor(protectedMemberConfig.membershipCacheTtlMs / 1000)} seconds</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-plum-100 bg-white p-6 shadow-[0_16px_48px_rgba(53,18,41,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              What Changed
            </p>
            <p className="mt-4 text-base leading-8 text-plum-800">
              The portal now acts like a product surface, not a protected placeholder. Your next
              step is the schedule, not a generic scaffold page.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-plum-100 bg-white p-6 shadow-[0_16px_48px_rgba(53,18,41,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              Protected Flow
            </p>
            <p className="mt-4 text-base leading-8 text-plum-800">
              Logged-out users are redirected early. Logged-in users still pass the active
              membership gate before protected surfaces open.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-plum-100 bg-white p-6 shadow-[0_16px_48px_rgba(53,18,41,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              Next Surface
            </p>
            <p className="mt-4 text-base leading-8 text-plum-800">
              Schedule access is where members land for the first protected utility inside the
              portal.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
