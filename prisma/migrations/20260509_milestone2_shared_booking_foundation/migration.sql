-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AvailabilitySlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TrainingSessionStatus" AS ENUM ('SCHEDULED', 'CANCELLED_BY_MEMBER', 'CANCELLED_BY_ADMIN');

-- CreateEnum
CREATE TYPE "AttendanceOutcome" AS ENUM ('ATTENDED', 'MISSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "membershipStatus" "MembershipStatus",
    "membershipCheckedAt" TIMESTAMP(3),
    "membershipProviderReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SignupChallenge" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "membershipStatus" "MembershipStatus" NOT NULL,
    "membershipCheckedAt" TIMESTAMP(3) NOT NULL,
    "providerReference" TEXT,
    "otpSentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerProfile" (
    "id" TEXT NOT NULL,
    "budibaseUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerAvailabilityRule" (
    "id" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveUntil" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerAvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerAvailabilitySlot" (
    "id" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "sourceRuleId" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
    "status" "AvailabilitySlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "memberUserId" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "availabilitySlotId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "TrainingSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "memberNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAttendance" (
    "id" TEXT NOT NULL,
    "trainingSessionId" TEXT NOT NULL,
    "outcome" "AttendanceOutcome" NOT NULL,
    "markedByBudibaseUserId" TEXT NOT NULL,
    "notes" TEXT,
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "SignupChallenge_email_createdAt_idx" ON "SignupChallenge"("email", "createdAt");

-- CreateIndex
CREATE INDEX "SignupChallenge_email_consumedAt_expiresAt_idx" ON "SignupChallenge"("email", "consumedAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfile_budibaseUserId_key" ON "TrainerProfile"("budibaseUserId");

-- CreateIndex
CREATE INDEX "TrainerProfile_active_idx" ON "TrainerProfile"("active");

-- CreateIndex
CREATE INDEX "TrainerAvailabilityRule_trainerProfileId_active_idx" ON "TrainerAvailabilityRule"("trainerProfileId", "active");

-- CreateIndex
CREATE INDEX "TrainerAvailabilityRule_dayOfWeek_active_idx" ON "TrainerAvailabilityRule"("dayOfWeek", "active");

-- CreateIndex
CREATE INDEX "TrainerAvailabilitySlot_trainerProfileId_status_startsAt_idx" ON "TrainerAvailabilitySlot"("trainerProfileId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "TrainerAvailabilitySlot_sourceRuleId_idx" ON "TrainerAvailabilitySlot"("sourceRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerAvailabilitySlot_trainerProfileId_startsAt_endsAt_key" ON "TrainerAvailabilitySlot"("trainerProfileId", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSession_availabilitySlotId_key" ON "TrainingSession"("availabilitySlotId");

-- CreateIndex
CREATE INDEX "TrainingSession_memberUserId_status_startsAt_idx" ON "TrainingSession"("memberUserId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "TrainingSession_trainerProfileId_status_startsAt_idx" ON "TrainingSession"("trainerProfileId", "status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAttendance_trainingSessionId_key" ON "SessionAttendance"("trainingSessionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAvailabilityRule" ADD CONSTRAINT "TrainerAvailabilityRule_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAvailabilitySlot" ADD CONSTRAINT "TrainerAvailabilitySlot_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAvailabilitySlot" ADD CONSTRAINT "TrainerAvailabilitySlot_sourceRuleId_fkey" FOREIGN KEY ("sourceRuleId") REFERENCES "TrainerAvailabilityRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_memberUserId_fkey" FOREIGN KEY ("memberUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_availabilitySlotId_fkey" FOREIGN KEY ("availabilitySlotId") REFERENCES "TrainerAvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendance" ADD CONSTRAINT "SessionAttendance_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "TrainerAvailabilityRule"
ADD CONSTRAINT "TrainerAvailabilityRule_startMinutes_valid"
CHECK ("startMinutes" >= 0 AND "startMinutes" < 1440);

-- AddCheckConstraint
ALTER TABLE "TrainerAvailabilityRule"
ADD CONSTRAINT "TrainerAvailabilityRule_endMinutes_valid"
CHECK ("endMinutes" > 0 AND "endMinutes" <= 1440);

-- AddCheckConstraint
ALTER TABLE "TrainerAvailabilityRule"
ADD CONSTRAINT "TrainerAvailabilityRule_time_window_valid"
CHECK ("endMinutes" > "startMinutes");

-- AddCheckConstraint
ALTER TABLE "TrainerAvailabilityRule"
ADD CONSTRAINT "TrainerAvailabilityRule_effective_range_valid"
CHECK ("effectiveUntil" IS NULL OR "effectiveFrom" IS NULL OR "effectiveUntil" >= "effectiveFrom");

-- AddCheckConstraint
ALTER TABLE "TrainerAvailabilitySlot"
ADD CONSTRAINT "TrainerAvailabilitySlot_time_window_valid"
CHECK ("endsAt" > "startsAt");

-- AddCheckConstraint
ALTER TABLE "TrainingSession"
ADD CONSTRAINT "TrainingSession_time_window_valid"
CHECK ("endsAt" > "startsAt");

-- AddExclusionConstraint
ALTER TABLE "TrainingSession"
ADD CONSTRAINT "TrainingSession_trainer_no_overlap"
EXCLUDE USING GIST (
  "trainerProfileId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" = 'SCHEDULED');

-- AddExclusionConstraint
ALTER TABLE "TrainingSession"
ADD CONSTRAINT "TrainingSession_member_no_overlap"
EXCLUDE USING GIST (
  "memberUserId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" = 'SCHEDULED');
