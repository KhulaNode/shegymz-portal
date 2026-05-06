'use client';

import { signOut } from 'next-auth/react';
import { portalCopy } from '@/content/portal-copy';

export function LogoutButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={`rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-plum-900 shadow-[0_10px_24px_rgba(74,44,74,0.06)] transition hover:border-rose-300 hover:bg-rose-50 ${className}`}
    >
      {portalCopy.nav.logout}
    </button>
  );
}
