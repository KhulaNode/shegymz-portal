import Image from 'next/image';
import Link from 'next/link';
import { portalCopy } from '@/content/portal-copy';

type PortalBrandHeaderProps = {
  accent?: string;
};

export function PortalBrandHeader({ accent = 'Private Member Space' }: PortalBrandHeaderProps) {
  return (
    <header className="mb-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/70 bg-white/82 px-4 py-3 shadow-[0_18px_60px_rgba(53,18,41,0.08)] backdrop-blur-xl sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="SheGymZ"
            width={132}
            height={52}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="hidden truncate text-xs font-semibold uppercase tracking-[0.28em] text-warmgray-600 sm:block">
            {accent}
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/signup"
            className="rounded-full px-4 py-2 text-sm font-medium text-plum-800 transition hover:bg-plum-50"
          >
            {portalCopy.nav.signup}
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-plum-800 transition hover:bg-plum-50"
          >
            {portalCopy.nav.login}
          </Link>
          <Link
            href="/portal"
            className="rounded-full bg-plum-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-800"
          >
            {portalCopy.nav.portal}
          </Link>
        </nav>
      </div>
    </header>
  );
}
