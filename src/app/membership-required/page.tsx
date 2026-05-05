import Link from 'next/link';
import Image from 'next/image';
import { LogoutButton } from '@/components/logout-button';
import { PortalBrandHeader } from '@/components/portal-brand-header';

export default function MembershipRequiredPage() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Membership Recovery" />
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_24px_80px_rgba(53,18,41,0.12)]">
          <Image
            src="/images/showcase1.jpeg"
            alt="SheGymZ membership inspiration"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-plum-900/76 via-plum-900/26 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/68">
              Membership Required
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight">
              Your place is here. Your access returns with your membership.
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-plum-100/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
            Membership Required
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-plum-900 sm:text-5xl">
            Portal access is paused for now.
          </h1>
          <div className="mt-6 space-y-4 text-base leading-8 text-plum-800 sm:text-lg">
            <p>
              This space is reserved for women with an active SheGymZ membership.
            </p>
            <p>
              If your subscription has just been restored, give it a moment and try again. Once
              your membership is active, your portal access will open again.
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
      </div>
    </main>
  );
}
