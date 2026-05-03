import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  clearSignupContinuation,
  readSignupContinuation,
  signupContinuation,
} from '@/lib/signup-continuation';
import { passwordAccountSignupSchema } from '@/lib/signup';

export async function POST(request: NextRequest) {
  const continuation = readSignupContinuation(request);
  if (!continuation) {
    return NextResponse.json(
      {
        error:
          'Your signup session has expired. Start again with the paid-member email and OTP.',
      },
      { status: 401 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = passwordAccountSignupSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Name and password details are invalid. Password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: continuation.email },
    select: { id: true },
  });

  if (existingUser) {
    const response = NextResponse.json(
      {
        error: 'An account already exists for this paid-member email. Use login instead.',
      },
      { status: 409 },
    );
    clearSignupContinuation(response);
    return response;
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: continuation.email,
        name: parsed.data.name,
        passwordHash,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      user,
      nextStep: 'login',
      loginEmail: continuation.email,
      continuationExpiresInSeconds: signupContinuation.ttlSeconds,
    });
    clearSignupContinuation(response);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const response = NextResponse.json(
        {
          error: 'An account already exists for this paid-member email. Use login instead.',
        },
        { status: 409 },
      );
      clearSignupContinuation(response);
      return response;
    }

    console.error('[signup/create-password-account] Failed to create user:', error);
    return NextResponse.json(
      { error: 'Could not create the portal account right now' },
      { status: 500 },
    );
  }
}
