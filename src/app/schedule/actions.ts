'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  bookTrainingSessionForMember,
  cancelTrainingSessionForMember,
} from '@/lib/member-sessions';
import { requireProtectedMember } from '@/lib/protected-member';

function getSafeReturnTo(value: FormDataEntryValue | null) {
  const fallback = '/schedule';

  if (typeof value !== 'string' || !value.startsWith('/schedule')) {
    return fallback;
  }

  return value;
}

function withQuery(path: string, key: string, value: string) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

function mapBookingError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('is not available')) {
    return 'slot-unavailable';
  }

  if (message.includes('already in the past')) {
    return 'slot-started';
  }

  if (message.includes('overlap')) {
    return 'booking-conflict';
  }

  return 'booking-failed';
}

function mapCancellationError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('cannot be cancelled anymore')) {
    return 'cancel-window-closed';
  }

  if (message.includes('does not belong to member')) {
    return 'cancel-not-allowed';
  }

  if (message.includes('is not scheduled')) {
    return 'cancel-not-allowed';
  }

  return 'cancel-failed';
}

export async function bookTrainingSessionAction(formData: FormData) {
  const member = await requireProtectedMember();
  const availabilitySlotId = formData.get('availabilitySlotId');
  const returnTo = getSafeReturnTo(formData.get('returnTo'));

  if (typeof availabilitySlotId !== 'string' || availabilitySlotId.length === 0) {
    redirect(withQuery(returnTo, 'error', 'slot-missing'));
  }

  try {
    await bookTrainingSessionForMember(member.id, availabilitySlotId);
  } catch (error) {
    redirect(withQuery(returnTo, 'error', mapBookingError(error)));
  }

  revalidatePath('/schedule');
  redirect(withQuery(returnTo, 'notice', 'booking-confirmed'));
}

export async function cancelTrainingSessionAction(formData: FormData) {
  const member = await requireProtectedMember();
  const trainingSessionId = formData.get('trainingSessionId');
  const returnTo = getSafeReturnTo(formData.get('returnTo'));

  if (typeof trainingSessionId !== 'string' || trainingSessionId.length === 0) {
    redirect(withQuery(returnTo, 'error', 'session-missing'));
  }

  try {
    await cancelTrainingSessionForMember(member.id, trainingSessionId);
  } catch (error) {
    redirect(withQuery(returnTo, 'error', mapCancellationError(error)));
  }

  revalidatePath('/schedule');
  redirect(withQuery(returnTo, 'notice', 'session-cancelled'));
}
