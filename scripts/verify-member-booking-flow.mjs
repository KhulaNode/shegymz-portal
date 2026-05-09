import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

const TEST_MEMBER_EMAIL = 'member.testing@shegymz.local';
const TEST_MEMBER_NAME = 'Member Testing';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function ensureTestMember() {
  return prisma.user.upsert({
    where: { email: TEST_MEMBER_EMAIL },
    update: {
      name: TEST_MEMBER_NAME,
      membershipStatus: 'ACTIVE',
      membershipCheckedAt: new Date(),
      membershipProviderReference: 'local-member-testing',
    },
    create: {
      email: TEST_MEMBER_EMAIL,
      name: TEST_MEMBER_NAME,
      membershipStatus: 'ACTIVE',
      membershipCheckedAt: new Date(),
      membershipProviderReference: 'local-member-testing',
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

async function getActiveTrainers() {
  return prisma.trainerProfile.findMany({
    where: { active: true },
    orderBy: { displayName: 'asc' },
    select: {
      id: true,
      displayName: true,
    },
  });
}

async function getFirstAvailableSlot(trainerProfileId) {
  return prisma.trainerAvailabilitySlot.findFirst({
    where: {
      trainerProfileId,
      status: 'AVAILABLE',
      startsAt: {
        gt: new Date(),
      },
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
    },
  });
}

async function bookSession(memberUserId, availabilitySlotId) {
  const result = await prisma.$queryRaw`
    SELECT "book_training_session"(
      ${memberUserId},
      ${availabilitySlotId},
      NULL
    ) AS "trainingSessionId"
  `;

  const row = result[0];
  return row?.trainingSessionId ?? null;
}

async function cancelSession(trainingSessionId, memberUserId) {
  const result = await prisma.$queryRaw`
    SELECT "cancel_training_session_by_member"(
      ${trainingSessionId},
      ${memberUserId}
    ) AS "cancelled"
  `;

  const row = result[0];
  return row?.cancelled ?? false;
}

async function main() {
  console.log('Milestone 4 member booking smoke check starting...');

  const member = await ensureTestMember();
  console.log(`Using member fixture: ${member.email}`);

  const trainers = await getActiveTrainers();
  assert(trainers.length >= 2, 'Expected at least 2 active trainers for Milestone 4 testing.');

  const trainer = trainers[0];
  console.log(`Using trainer: ${trainer.displayName}`);

  const slot = await getFirstAvailableSlot(trainer.id);
  assert(slot, `Expected at least 1 future available slot for trainer ${trainer.displayName}.`);
  console.log(`Using slot: ${slot.id} at ${slot.startsAt.toISOString()}`);

  const sessionId = await bookSession(member.id, slot.id);
  assert(sessionId, 'Booking function did not return a training session id.');
  console.log(`Booked session: ${sessionId}`);

  const bookedSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      memberUserId: true,
      trainerProfileId: true,
      availabilitySlotId: true,
      status: true,
    },
  });

  assert(bookedSession, 'Booked training session could not be found.');
  assert(bookedSession.memberUserId === member.id, 'Booked session was linked to the wrong member.');
  assert(bookedSession.trainerProfileId === trainer.id, 'Booked session was linked to the wrong trainer.');
  assert(bookedSession.availabilitySlotId === slot.id, 'Booked session was linked to the wrong slot.');
  assert(bookedSession.status === 'SCHEDULED', 'Booked session is not in SCHEDULED status.');

  const bookedSlot = await prisma.trainerAvailabilitySlot.findUnique({
    where: { id: slot.id },
    select: {
      id: true,
      status: true,
    },
  });

  assert(bookedSlot?.status === 'BOOKED', 'Booked slot did not move to BOOKED status.');

  const cancelled = await cancelSession(sessionId, member.id);
  assert(cancelled === true, 'Cancellation function did not return true.');
  console.log(`Cancelled session: ${sessionId}`);

  const cancelledSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
    },
  });

  assert(
    cancelledSession?.status === 'CANCELLED_BY_MEMBER',
    'Cancelled session did not move to CANCELLED_BY_MEMBER status.',
  );

  const reopenedSlot = await prisma.trainerAvailabilitySlot.findUnique({
    where: { id: slot.id },
    select: {
      id: true,
      status: true,
    },
  });

  assert(
    reopenedSlot?.status === 'AVAILABLE',
    'Cancelled booking did not reopen the slot to AVAILABLE.',
  );

  console.log('Milestone 4 member booking smoke check passed.');
}

main()
  .catch((error) => {
    console.error('Milestone 4 member booking smoke check failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
