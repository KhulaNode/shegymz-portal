import type { NextAuthOptions } from 'next-auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { decodeSignupContinuation, signupContinuation } from '@/lib/signup-continuation';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') {
        return true;
      }

      const email = user.email?.toLowerCase();
      if (!email) {
        return '/signup?error=google-email-missing';
      }

      const cookieStore = await cookies();
      const continuationToken = cookieStore.get(signupContinuation.cookieName)?.value;
      const continuation = continuationToken ? decodeSignupContinuation(continuationToken) : null;

      if (continuation && continuation.email !== email) {
        return '/signup?error=google-email-mismatch';
      }

      let portalUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!portalUser) {
        if (!continuation) {
          return '/signup?error=signup-gate-required';
        }

        portalUser = await prisma.user.create({
          data: {
            email,
            name: user.name,
            emailVerified: new Date(),
          },
          select: { id: true },
        });
      }

      if (!account.providerAccountId) {
        return '/signup?error=google-account-missing';
      }

      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (existingAccount && existingAccount.userId !== portalUser.id) {
        return '/signup?error=google-account-already-linked';
      }

      if (existingAccount) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        });
      } else {
        await prisma.account.create({
          data: {
            userId: portalUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        });
      }

      return true;
    },
    async session({ session }) {
      return session;
    },
  },
};
