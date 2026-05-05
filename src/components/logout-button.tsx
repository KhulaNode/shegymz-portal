'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={`rounded-full bg-plum-900 px-5 py-3 text-sm font-semibold text-white ${className}`}
    >
      Logout
    </button>
  );
}
