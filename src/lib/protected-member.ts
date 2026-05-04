import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { lookupActiveMembershipByEmail } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';

const MEMBERSHIP_CACHE_TTL_MS = 60 * 1000;

type ProtectedMember = {
  id: string;
  email: string;
  name: string | null;
  role: 'CLIENT';
  membershipCheckedAt: Date | null;
  membershipProviderReference: string | null;
};

function membershipCacheIsFresh(checkedAt: Date | null) {
  if (!checkedAt) {
    return false;
  }

  return Date.now() - checkedAt.getTime() < MEMBERSHIP_CACHE_TTL_MS;
}

export const requireProtectedMember = cache(async (): Promise<ProtectedMember> => {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      membershipStatus: true,
      membershipCheckedAt: true,
      membershipProviderReference: true,
    },
  });

  if (!user) {
    redirect('/login?error=account-missing');
  }

  if (user.membershipStatus === 'ACTIVE' && membershipCacheIsFresh(user.membershipCheckedAt)) {
    return user;
  }

  const membership = await lookupActiveMembershipByEmail(email);
  const membershipCheckedAt = new Date();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      membershipStatus: membership.isActive ? 'ACTIVE' : 'INACTIVE',
      membershipCheckedAt,
      membershipProviderReference: membership.isActive ? membership.providerReference : null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      membershipStatus: true,
      membershipCheckedAt: true,
      membershipProviderReference: true,
    },
  });

  if (!membership.isActive) {
    redirect('/membership-required');
  }

  return updatedUser;
});

export const protectedMemberConfig = {
  membershipCacheTtlMs: MEMBERSHIP_CACHE_TTL_MS,
};
