import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

export default function MembershipRequiredPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-plum-100 bg-sand p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
          Membership Required
        </p>
        <h1 className="mb-4 text-4xl font-bold text-plum-900">
          Your portal access is currently locked
        </h1>
        <div className="space-y-4 text-lg leading-8 text-plum-800">
          <p>
            Protected portal access is rechecked against your live SheGymZ membership before
            Mina and the member shell open.
          </p>
          <p>
            If your Paystack subscription has just been restored, try again from the portal in a
            moment. If not, you will need an active SheGymZ membership before access can reopen.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/portal"
            className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800"
          >
            Retry portal access
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
