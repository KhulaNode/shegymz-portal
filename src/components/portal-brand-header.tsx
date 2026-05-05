import Image from 'next/image';
import Link from 'next/link';

type PortalBrandHeaderProps = {
  accent?: string;
};

export function PortalBrandHeader({ accent = 'Private Wellness Portal' }: PortalBrandHeaderProps) {
  return (
    <header className="mb-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-plum-100/80 bg-white/80 px-4 py-3 shadow-[0_12px_40px_rgba(53,18,41,0.06)] backdrop-blur sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="SheGymZ"
            width={132}
            height={52}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="hidden text-xs font-semibold uppercase tracking-[0.32em] text-warmgray-600 sm:block">
            {accent}
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/signup"
            className="rounded-full px-4 py-2 text-sm font-medium text-plum-800 transition hover:bg-plum-50"
          >
            Signup
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-plum-800 transition hover:bg-plum-50"
          >
            Login
          </Link>
          <Link
            href="/portal"
            className="rounded-full bg-plum-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-800"
          >
            Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}
