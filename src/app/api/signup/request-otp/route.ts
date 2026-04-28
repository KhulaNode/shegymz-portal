import { NextRequest, NextResponse } from 'next/server';
import { sendPortalOtpEmail } from '@/lib/email';
import { lookupActiveMembershipByEmail } from '@/lib/paystack';
import { createSignupChallenge } from '@/lib/signup-challenges';
import { signupRequestSchema } from '@/lib/signup';

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = signupRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const membership = await lookupActiveMembershipByEmail(email);

  if (!membership.isActive) {
    return NextResponse.json(
      { error: 'No active SheGymZ membership was found for this email' },
      { status: 403 },
    );
  }

  try {
    const { otpCode, expiresInMinutes } = await createSignupChallenge({
      email,
      providerReference: membership.providerReference,
    });

    await sendPortalOtpEmail({
      email,
      otpCode,
      expiresInMinutes,
    });

    return NextResponse.json({
      success: true,
      email,
      expiresInMinutes,
    });
  } catch (error) {
    console.error('[signup/request-otp] Failed to create challenge:', error);
    return NextResponse.json(
      { error: 'Could not start signup verification right now' },
      { status: 500 },
    );
  }
}
