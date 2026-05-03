'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="rounded-2xl bg-plum-900 px-5 py-3 text-sm font-semibold text-white"
    >
      Logout
    </button>
  );
}
