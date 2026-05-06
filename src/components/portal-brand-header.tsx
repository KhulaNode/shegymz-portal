import Image from 'next/image';
import Link from 'next/link';
import { portalCopy } from '@/content/portal-copy';

type PortalBrandHeaderProps = {
  accent?: string;
};

export function PortalBrandHeader({ accent = portalCopy.chrome.privateLabel }: PortalBrandHeaderProps) {
  return (
    <header className="mb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[2rem] border border-warmgray-200/80 bg-[#fffaf8]/96 px-4 py-4 shadow-[0_18px_60px_rgba(74,44,74,0.08)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="SheGymZ"
            width={132}
            height={52}
            className="h-10 w-auto object-contain"
            priority
          />
          <div className="min-w-0">
            <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-warmgray-600">
              {portalCopy.chrome.wellbeingLabel}
            </span>
            <span className="mt-1 block truncate text-sm font-medium text-plum-900/90">
              {accent}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-plum-900/80 transition hover:bg-rose-100"
          >
            {portalCopy.nav.signup}
          </Link>
          <Link
            href="/portal"
            className="whitespace-nowrap rounded-full bg-plum-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,44,74,0.16)] transition hover:bg-plum-800"
          >
            {portalCopy.nav.portal}
          </Link>
        </nav>
      </div>
    </header>
  );
}
