import { prisma } from '@/lib/prisma';
import { generateOtpCode, hashOtpCode, verifyOtpCode } from '@/lib/otp';

const OTP_EXPIRY_MINUTES = 10;

export async function createSignupChallenge(args: {
  email: string;
  providerReference?: string;
}) {
  const otpCode = generateOtpCode();
  const otpHash = await hashOtpCode(otpCode);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const challenge = await prisma.signupChallenge.create({
    data: {
      email: args.email,
      otpHash,
      membershipStatus: 'ACTIVE',
      membershipCheckedAt: now,
      providerReference: args.providerReference,
      otpSentAt: now,
      expiresAt,
    },
  });

  return {
    challenge,
    otpCode,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  };
}

export async function verifySignupChallenge(args: {
  email: string;
  code: string;
}) {
  const now = new Date();

  const challenge = await prisma.signupChallenge.findFirst({
    where: {
      email: args.email,
      consumedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!challenge) {
    return { ok: false as const, reason: 'challenge_not_found' as const };
  }

  const matches = await verifyOtpCode(args.code, challenge.otpHash);
  if (!matches) {
    return { ok: false as const, reason: 'invalid_code' as const };
  }

  await prisma.signupChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: now },
  });

  return {
    ok: true as const,
    challengeId: challenge.id,
    providerReference: challenge.providerReference ?? undefined,
  };
}
