'use client';

import { signOut } from 'next-auth/react';
import { portalCopy } from '@/content/portal-copy';

export function LogoutButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={`rounded-full bg-plum-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-plum-800 ${className}`}
    >
      {portalCopy.nav.logout}
    </button>
  );
}
