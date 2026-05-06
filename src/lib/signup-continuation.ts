import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

const SIGNUP_CONTINUATION_COOKIE = 'shegymz_portal_signup';
const SECURE_COOKIES = (process.env.APP_URL ?? '').startsWith('https://');
const SIGNUP_CONTINUATION_PURPOSE = 'signup-continuation';
const SIGNUP_CONTINUATION_TTL_SECONDS = 15 * 60;

export type SignupContinuationPayload = {
  purpose: typeof SIGNUP_CONTINUATION_PURPOSE;
  email: string;
  challengeId: string;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(value: string) {
  return crypto.createHmac('sha256', process.env.AUTH_SECRET!).update(value).digest('base64url');
}

function buildPayload(args: { email: string; challengeId: string }): SignupContinuationPayload {
  return {
    purpose: SIGNUP_CONTINUATION_PURPOSE,
    email: args.email.toLowerCase(),
    challengeId: args.challengeId,
    exp: Math.floor(Date.now() / 1000) + SIGNUP_CONTINUATION_TTL_SECONDS,
  };
}

function encodePayload(payload: SignupContinuationPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function decodeSignupContinuation(token: string): SignupContinuationPayload | null {
  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SignupContinuationPayload;
    if (payload.purpose !== SIGNUP_CONTINUATION_PURPOSE) {
      return null;
    }

    if (!payload.email || !payload.challengeId || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function issueSignupContinuation(
  response: NextResponse,
  args: { email: string; challengeId: string },
) {
  const token = encodePayload(buildPayload(args));

  response.cookies.set({
    name: SIGNUP_CONTINUATION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIES,
    path: '/',
    maxAge: SIGNUP_CONTINUATION_TTL_SECONDS,
  });
}

export function clearSignupContinuation(response: NextResponse) {
  response.cookies.set({
    name: SIGNUP_CONTINUATION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIES,
    path: '/',
    maxAge: 0,
  });
}

export function readSignupContinuation(request: NextRequest) {
  const token = request.cookies.get(SIGNUP_CONTINUATION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return decodeSignupContinuation(token);
}

export const signupContinuation = {
  cookieName: SIGNUP_CONTINUATION_COOKIE,
  ttlSeconds: SIGNUP_CONTINUATION_TTL_SECONDS,
};
