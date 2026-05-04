import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { LogoutButton } from '@/components/logout-button';
import Link from 'next/link';
import { protectedMemberConfig, requireProtectedMember } from '@/lib/protected-member';

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  const member = await requireProtectedMember();

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-plum-100 bg-sand p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
            Protected Member Shell
          </p>
          <h1 className="mb-4 text-4xl font-bold text-plum-900">Welcome to your SheGymZ portal</h1>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4 text-lg leading-8 text-plum-800">
              <p>
                Signed in as <span className="font-semibold">{session?.user?.email}</span>.
              </p>
              <p>
                Your protected access is active, and Mina only opens after the portal rechecks
                the paid-member email behind this account.
              </p>
            </div>
            <div className="rounded-2xl border border-plum-100 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
                Access Status
              </p>
              <dl className="mt-4 space-y-3 text-sm text-plum-800">
                <div>
                  <dt className="font-semibold">Member email</dt>
                  <dd>{member.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Role</dt>
                  <dd>{member.role}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Membership recheck cache</dt>
                  <dd>{Math.floor(protectedMemberConfig.membershipCacheTtlMs / 1000)} seconds</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/mina"
              className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800"
            >
              Open KhulaScheduler
            </Link>
            <LogoutButton />
          </div>
        </section>
      </div>
    </main>
  );
}
