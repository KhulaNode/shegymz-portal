import { prisma } from '@/lib/prisma';

const MEMBER_BOOKING_WINDOW_DAYS = 30;
const MEMBER_CANCEL_CUTOFF_MINUTES = 30;
const SESSION_HISTORY_DAYS = 14;

export type MemberTrainerSummary = {
  id: string;
  displayName: string;
  bio: string | null;
  availableSlotCount: number;
};

export type MemberBookableSlot = {
  id: string;
  trainerProfileId: string;
  trainerDisplayName: string;
  startsAtIso: string;
  endsAtIso: string;
  timezone: string;
};

export type MemberTrainingSessionSummary = {
  id: string;
  trainerProfileId: string;
  trainerDisplayName: string;
  availabilitySlotId: string;
  startsAtIso: string;
  endsAtIso: string;
  status: 'SCHEDULED' | 'CANCELLED_BY_MEMBER' | 'CANCELLED_BY_ADMIN';
  memberNotes: string | null;
  canCancel: boolean;
};

export type MemberScheduleSnapshot = {
  trainers: MemberTrainerSummary[];
  availableSlots: MemberBookableSlot[];
  sessions: MemberTrainingSessionSummary[];
};

function withDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function canMemberCancel(startsAt: Date, status: string) {
  if (status !== 'SCHEDULED') {
    return false;
  }

  return startsAt.getTime() - Date.now() >= MEMBER_CANCEL_CUTOFF_MINUTES * 60 * 1000;
}

export async function getMemberScheduleSnapshot(
  memberUserId: string,
): Promise<MemberScheduleSnapshot> {
  const now = new Date();
  const slotWindowEnd = withDays(now, MEMBER_BOOKING_WINDOW_DAYS);
  const sessionHistoryStart = withDays(now, -SESSION_HISTORY_DAYS);

  const [trainerRows, slotRows, sessionRows] = await Promise.all([
    prisma.trainerProfile.findMany({
      where: { active: true },
      select: {
        id: true,
        displayName: true,
        bio: true,
        availabilitySlots: {
          where: {
            status: 'AVAILABLE',
            startsAt: {
              gt: now,
              lt: slotWindowEnd,
            },
          },
          select: { id: true },
        },
      },
      orderBy: { displayName: 'asc' },
    }),
    prisma.trainerAvailabilitySlot.findMany({
      where: {
        status: 'AVAILABLE',
        startsAt: {
          gt: now,
          lt: slotWindowEnd,
        },
        trainerProfile: {
          active: true,
        },
      },
      select: {
        id: true,
        trainerProfileId: true,
        startsAt: true,
        endsAt: true,
        timezone: true,
        trainerProfile: {
          select: {
            displayName: true,
          },
        },
      },
      orderBy: [{ startsAt: 'asc' }, { trainerProfile: { displayName: 'asc' } }],
    }),
    prisma.trainingSession.findMany({
      where: {
        memberUserId,
        startsAt: {
          gt: sessionHistoryStart,
        },
      },
      select: {
        id: true,
        trainerProfileId: true,
        availabilitySlotId: true,
        startsAt: true,
        endsAt: true,
        status: true,
        memberNotes: true,
        trainerProfile: {
          select: {
            displayName: true,
          },
        },
      },
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  return {
    trainers: trainerRows.map((trainer) => ({
      id: trainer.id,
      displayName: trainer.displayName,
      bio: trainer.bio,
      availableSlotCount: trainer.availabilitySlots.length,
    })),
    availableSlots: slotRows.map((slot) => ({
      id: slot.id,
      trainerProfileId: slot.trainerProfileId,
      trainerDisplayName: slot.trainerProfile.displayName,
      startsAtIso: slot.startsAt.toISOString(),
      endsAtIso: slot.endsAt.toISOString(),
      timezone: slot.timezone,
    })),
    sessions: sessionRows.map((session) => ({
      id: session.id,
      trainerProfileId: session.trainerProfileId,
      trainerDisplayName: session.trainerProfile.displayName,
      availabilitySlotId: session.availabilitySlotId,
      startsAtIso: session.startsAt.toISOString(),
      endsAtIso: session.endsAt.toISOString(),
      status: session.status,
      memberNotes: session.memberNotes,
      canCancel: canMemberCancel(session.startsAt, session.status),
    })),
  };
}

export async function bookTrainingSessionForMember(
  memberUserId: string,
  availabilitySlotId: string,
) {
  const result = await prisma.$queryRaw<{ trainingSessionId: string }[]>`
    SELECT "book_training_session"(
      ${memberUserId},
      ${availabilitySlotId},
      NULL
    ) AS "trainingSessionId"
  `;

  return result[0]?.trainingSessionId ?? null;
}

export async function cancelTrainingSessionForMember(
  memberUserId: string,
  trainingSessionId: string,
) {
  const result = await prisma.$queryRaw<{ cancelled: boolean }[]>`
    SELECT "cancel_training_session_by_member"(
      ${trainingSessionId},
      ${memberUserId}
    ) AS "cancelled"
  `;

  return result[0]?.cancelled ?? false;
}
