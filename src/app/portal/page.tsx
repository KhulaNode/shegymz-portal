import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { LogoutButton } from '@/components/logout-button';

export default async function PortalPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl rounded-3xl border border-plum-100 bg-sand p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
          Protected Shell
        </p>
        <h1 className="mb-4 text-4xl font-bold text-plum-900">Portal shell scaffolded</h1>
        {session?.user ? (
          <div className="space-y-4">
            <p className="text-lg leading-8 text-plum-800">
              Signed in as <span className="font-semibold">{session.user.email}</span>.
            </p>
            <LogoutButton />
          </div>
        ) : (
          <p className="text-lg leading-8 text-plum-800">
            Milestone 4 will put session and entitlement checks in front of this route and
            expose the minimum client portal experience.
          </p>
        )}
      </div>
    </main>
  );
}
