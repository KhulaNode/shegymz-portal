import Image from 'next/image';
import Link from 'next/link';
import { portalCopy } from '@/content/portal-copy';

type PortalBrandHeaderProps = {
  accent?: string;
};

export function PortalBrandHeader({ accent = portalCopy.chrome.privateLabel }: PortalBrandHeaderProps) {
  return (
    <header className="mb-5 sm:mb-8">
      <div className="mx-auto flex max-w-6xl flex-row items-center justify-between gap-3 rounded-[1.5rem] sm:rounded-[2rem] border border-warmgray-200/80 bg-[#fffaf8]/96 px-4 py-3 shadow-[0_18px_60px_rgba(74,44,74,0.08)] sm:gap-4 sm:py-4 sm:px-6">
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
            <span className="hidden truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-warmgray-600 sm:block">
              {portalCopy.chrome.wellbeingLabel}
            </span>
            <span className="block truncate text-sm font-medium text-plum-900/90 sm:mt-1">
              {accent}
            </span>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/signup"
            className="hidden whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-plum-900/80 transition hover:bg-rose-100 sm:inline-flex"
          >
            {portalCopy.nav.signup}
          </Link>
          <Link
            href="/portal"
            className="whitespace-nowrap rounded-full bg-plum-900 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(74,44,74,0.16)] transition hover:bg-plum-800 sm:px-4 sm:text-sm"
          >
            <span className="sm:hidden">Sign in</span>
            <span className="hidden sm:inline">{portalCopy.nav.portal}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
