import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

export default function MembershipRequiredPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,223,241,0.45),_transparent_40%),linear-gradient(180deg,#fcfaf8_0%,#f5f1ec_100%)] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-plum-100/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
          Membership Required
        </p>
        <h1 className="mt-4 text-4xl font-bold text-plum-900 sm:text-5xl">
          Portal access is paused until active membership returns.
        </h1>
        <div className="mt-6 space-y-4 text-base leading-8 text-plum-800 sm:text-lg">
          <p>
            Protected portal access is rechecked against live SheGymZ membership before the
            member home and schedule open.
          </p>
          <p>
            If your Paystack subscription was just restored, give it a moment and try again. If
            not, access will stay locked until membership is active again.
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
