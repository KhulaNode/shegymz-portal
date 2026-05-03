import { NextRequest, NextResponse } from 'next/server';
import { verifySignupChallenge } from '@/lib/signup-challenges';
import { issueSignupContinuation, signupContinuation } from '@/lib/signup-continuation';
import { signupVerifySchema } from '@/lib/signup';

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = signupVerifySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Email and 6-digit verification code are required' },
      { status: 400 },
    );
  }

  const result = await verifySignupChallenge({
    email: parsed.data.email.toLowerCase(),
    code: parsed.data.code,
  });

  if (!result.ok) {
    const status = result.reason === 'challenge_not_found' ? 404 : 400;
    const error =
      result.reason === 'challenge_not_found'
        ? 'No active verification challenge was found'
        : 'Verification code is invalid';

    return NextResponse.json({ error }, { status });
  }

  const response = NextResponse.json({
    success: true,
    email: parsed.data.email.toLowerCase(),
    challengeId: result.challengeId,
    providerReference: result.providerReference ?? null,
    nextStep: 'account-creation',
    continuationExpiresInSeconds: signupContinuation.ttlSeconds,
  });

  issueSignupContinuation(response, {
    email: parsed.data.email.toLowerCase(),
    challengeId: result.challengeId,
  });

  return response;
}
