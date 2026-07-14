-- ──────────────────────────────────────────────────────────────────────────
-- Migration: Remove Budibase + Add admin/trainer auth to PostgreSQL
-- ──────────────────────────────────────────────────────────────────────────

-- Step 1: Drop all Budibase views (no longer needed — admin UI replaces Budibase)
DROP VIEW IF EXISTS "BudibaseTrainerWorkloadSnapshot";
DROP VIEW IF EXISTS "BudibaseUpcomingAvailableSlot";
DROP VIEW IF EXISTS "BudibaseOperationalTrainingSession";
DROP VIEW IF EXISTS "BudibaseSessionAttendance";
DROP VIEW IF EXISTS "BudibaseTrainingSession";
DROP VIEW IF EXISTS "BudibaseTrainerAvailabilitySlot";
DROP VIEW IF EXISTS "BudibaseTrainerScheduleBlock";
DROP VIEW IF EXISTS "BudibaseTrainerProfile";

-- Step 2: Add ADMIN and TRAINER to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRAINER';

-- Step 3: Add trainerId and trainerProfile link to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trainerId" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_trainerId_key" UNIQUE ("trainerId");
CREATE INDEX IF NOT EXISTS "User_trainerId_idx" ON "User"("trainerId");

-- Step 4: Make budibaseUserId optional in TrainerProfile
ALTER TABLE "TrainerProfile" ALTER COLUMN "budibaseUserId" DROP NOT NULL;

-- Step 5: Rename markedByBudibaseUserId to markedByIdentifier in SessionAttendance
ALTER TABLE "SessionAttendance" RENAME COLUMN "markedByBudibaseUserId" TO "markedByIdentifier";

-- Step 6: Update functions that referenced markedByBudibaseUserId

-- mark_training_session_attendance
DROP FUNCTION IF EXISTS "mark_training_session_attendance"(TEXT, TEXT, "AttendanceOutcome", TEXT);
CREATE FUNCTION "mark_training_session_attendance"(
  p_training_session_id TEXT,
  p_marked_by TEXT,
  p_outcome "AttendanceOutcome",
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_session "TrainingSession"%ROWTYPE;
  v_allowed_from TIMESTAMP;
BEGIN
  SELECT *
  INTO v_session
  FROM "TrainingSession"
  WHERE "id" = p_training_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'training session % does not exist', p_training_session_id;
  END IF;

  IF v_session."status" <> 'SCHEDULED' THEN
    RAISE EXCEPTION 'training session % is not scheduled', p_training_session_id;
  END IF;

  v_allowed_from := v_session."startsAt" + INTERVAL '1 minute';

  IF CURRENT_TIMESTAMP < v_allowed_from THEN
    RAISE EXCEPTION 'training session % cannot be marked yet', p_training_session_id;
  END IF;

  INSERT INTO "SessionAttendance" (
    "id",
    "trainingSessionId",
    "outcome",
    "markedByIdentifier",
    "notes",
    "markedAt",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    md5(
      p_training_session_id
      || '|' || p_marked_by
      || '|' || clock_timestamp()::text
    ),
    p_training_session_id,
    p_outcome,
    p_marked_by,
    p_notes,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT ("trainingSessionId")
  DO UPDATE SET
    "outcome" = EXCLUDED."outcome",
    "markedByIdentifier" = EXCLUDED."markedByIdentifier",
    "notes" = EXCLUDED."notes",
    "markedAt" = EXCLUDED."markedAt",
    "updatedAt" = CURRENT_TIMESTAMP;

  RETURN TRUE;
END;
$$;

-- cancel_training_session_by_admin
DROP FUNCTION IF EXISTS "cancel_training_session_by_admin"(TEXT, TEXT, TEXT);
CREATE FUNCTION "cancel_training_session_by_admin"(
  p_training_session_id TEXT,
  p_admin_id TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_session "TrainingSession"%ROWTYPE;
BEGIN
  SELECT *
  INTO v_session
  FROM "TrainingSession"
  WHERE "id" = p_training_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'training session % does not exist', p_training_session_id;
  END IF;

  IF v_session."status" <> 'SCHEDULED' THEN
    RAISE EXCEPTION 'training session % is not scheduled', p_training_session_id;
  END IF;

  UPDATE "TrainingSession"
  SET
    "status" = 'CANCELLED_BY_ADMIN'::"TrainingSessionStatus",
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "id" = v_session."id";

  UPDATE "TrainerAvailabilitySlot"
  SET
    "status" = CASE
      WHEN "startsAt" > CURRENT_TIMESTAMP THEN 'AVAILABLE'::"AvailabilitySlotStatus"
      ELSE "status"
    END,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "id" = v_session."availabilitySlotId";

  IF p_reason IS NOT NULL THEN
    INSERT INTO "SessionAttendance" (
      "id",
      "trainingSessionId",
      "outcome",
      "markedByIdentifier",
      "notes",
      "markedAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      md5(
        p_training_session_id
        || '|' || p_admin_id
        || '|admin-cancel|'
        || clock_timestamp()::text
      ),
      p_training_session_id,
      'CANCELLED'::"AttendanceOutcome",
      p_admin_id,
      p_reason,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("trainingSessionId")
    DO UPDATE SET
      "outcome" = EXCLUDED."outcome",
      "markedByIdentifier" = EXCLUDED."markedByIdentifier",
      "notes" = EXCLUDED."notes",
      "markedAt" = EXCLUDED."markedAt",
      "updatedAt" = CURRENT_TIMESTAMP;
  END IF;

  RETURN TRUE;
END;
$$;

-- Step 7: Update foreign key for User.trainerId -> TrainerProfile.id
ALTER TABLE "User"
ADD CONSTRAINT "User_trainerId_fkey"
FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;