import Link from 'next/link';
import Image from 'next/image';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

export default function MembershipRequiredPage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Member-Only Space" />
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[340px] overflow-hidden rounded-[2.5rem] shadow-[0_28px_90px_rgba(53,18,41,0.13)] lg:min-h-[560px]">
          <Image
            src="/images/showcase1.jpeg"
            alt="SheGymZ membership space"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-plum-900/78 via-plum-900/28 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/68">
              Private member access
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight">
              Your space is here when your membership is active.
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/75 bg-white/92 p-8 shadow-[0_28px_90px_rgba(53,18,41,0.09)] backdrop-blur-xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
            Membership
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-plum-900 sm:text-5xl">
            {portalCopy.locked.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-plum-800 sm:text-lg">
            {portalCopy.locked.body}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={portalCopy.external.shegymzUrl}
              className="inline-flex justify-center rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800"
            >
              {portalCopy.locked.returnToSheGymZ}
            </Link>
            <Link
              href="/portal"
              className="inline-flex justify-center rounded-full border border-plum-200 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-plum-400"
            >
              {portalCopy.locked.tryAgain}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
