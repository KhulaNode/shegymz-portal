DROP VIEW IF EXISTS "BudibaseTrainerWorkloadSnapshot";
DROP VIEW IF EXISTS "BudibaseUpcomingAvailableSlot";
DROP VIEW IF EXISTS "BudibaseOperationalTrainingSession";
DROP VIEW IF EXISTS "BudibaseSessionAttendance";
DROP VIEW IF EXISTS "BudibaseTrainingSession";
DROP VIEW IF EXISTS "BudibaseTrainerAvailabilitySlot";
DROP VIEW IF EXISTS "BudibaseTrainerAvailabilityRule";
DROP VIEW IF EXISTS "BudibaseTrainerScheduleBlock";
DROP VIEW IF EXISTS "BudibaseTrainerProfile";

DROP TRIGGER IF EXISTS "trainer_availability_rule_sync_slots" ON "TrainerAvailabilityRule";
DROP FUNCTION IF EXISTS "sync_trainer_availability_slots_from_rule_change"();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScheduleBlockType') THEN
    CREATE TYPE "ScheduleBlockType" AS ENUM ('RECURRING', 'ONE_OFF');
  END IF;
END;
$$;

ALTER TABLE "TrainerAvailabilitySlot"
DROP CONSTRAINT IF EXISTS "TrainerAvailabilitySlot_sourceRuleId_fkey";

ALTER TABLE "TrainerAvailabilityRule" RENAME TO "TrainerScheduleBlock";
ALTER TABLE "TrainerScheduleBlock" RENAME CONSTRAINT "TrainerAvailabilityRule_pkey" TO "TrainerScheduleBlock_pkey";
ALTER TABLE "TrainerScheduleBlock" RENAME CONSTRAINT "TrainerAvailabilityRule_trainerProfileId_fkey" TO "TrainerScheduleBlock_trainerProfileId_fkey";
ALTER TABLE "TrainerScheduleBlock" RENAME CONSTRAINT "TrainerAvailabilityRule_startMinutes_valid" TO "TrainerScheduleBlock_startMinutes_valid_old";
ALTER TABLE "TrainerScheduleBlock" RENAME CONSTRAINT "TrainerAvailabilityRule_endMinutes_valid" TO "TrainerScheduleBlock_endMinutes_valid_old";
ALTER TABLE "TrainerScheduleBlock" RENAME CONSTRAINT "TrainerAvailabilityRule_time_window_valid" TO "TrainerScheduleBlock_time_window_valid_old";
ALTER TABLE "TrainerScheduleBlock" RENAME CONSTRAINT "TrainerAvailabilityRule_effective_range_valid" TO "TrainerScheduleBlock_effective_range_valid_old";

ALTER INDEX "TrainerAvailabilityRule_trainerProfileId_active_idx" RENAME TO "TrainerScheduleBlock_trainerProfileId_active_idx";
ALTER INDEX "TrainerAvailabilityRule_dayOfWeek_active_idx" RENAME TO "TrainerScheduleBlock_dayOfWeek_active_idx";

ALTER TABLE "TrainerScheduleBlock"
ADD COLUMN "scheduleType" "ScheduleBlockType" NOT NULL DEFAULT 'RECURRING',
ADD COLUMN "specificDate" DATE,
ADD COLUMN "slotDurationMinutes" INTEGER NOT NULL DEFAULT 60,
ALTER COLUMN "dayOfWeek" DROP NOT NULL;

ALTER TABLE "TrainerScheduleBlock"
DROP CONSTRAINT "TrainerScheduleBlock_startMinutes_valid_old",
DROP CONSTRAINT "TrainerScheduleBlock_endMinutes_valid_old",
DROP CONSTRAINT "TrainerScheduleBlock_time_window_valid_old",
DROP CONSTRAINT "TrainerScheduleBlock_effective_range_valid_old";

ALTER TABLE "TrainerScheduleBlock"
ADD CONSTRAINT "TrainerScheduleBlock_startMinutes_valid"
CHECK ("startMinutes" >= 0 AND "startMinutes" < 1440),
ADD CONSTRAINT "TrainerScheduleBlock_endMinutes_valid"
CHECK ("endMinutes" > 0 AND "endMinutes" <= 1440),
ADD CONSTRAINT "TrainerScheduleBlock_time_window_valid"
CHECK ("endMinutes" > "startMinutes"),
ADD CONSTRAINT "TrainerScheduleBlock_slotDurationMinutes_valid"
CHECK ("slotDurationMinutes" > 0 AND "slotDurationMinutes" <= ("endMinutes" - "startMinutes")),
ADD CONSTRAINT "TrainerScheduleBlock_effective_range_valid"
CHECK ("effectiveUntil" IS NULL OR "effectiveFrom" IS NULL OR "effectiveUntil" >= "effectiveFrom"),
ADD CONSTRAINT "TrainerScheduleBlock_recurring_shape_valid"
CHECK (
  ("scheduleType" = 'RECURRING'::"ScheduleBlockType" AND "dayOfWeek" IS NOT NULL AND "specificDate" IS NULL)
  OR
  ("scheduleType" = 'ONE_OFF'::"ScheduleBlockType" AND "dayOfWeek" IS NULL AND "specificDate" IS NOT NULL)
);

ALTER TABLE "TrainerAvailabilitySlot" RENAME COLUMN "sourceRuleId" TO "sourceBlockId";
ALTER INDEX "TrainerAvailabilitySlot_sourceRuleId_idx" RENAME TO "TrainerAvailabilitySlot_sourceBlockId_idx";

ALTER TABLE "TrainerAvailabilitySlot"
ADD CONSTRAINT "TrainerAvailabilitySlot_sourceBlockId_fkey"
FOREIGN KEY ("sourceBlockId") REFERENCES "TrainerScheduleBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "TrainerScheduleBlock_specificDate_active_idx" ON "TrainerScheduleBlock"("specificDate", "active");

CREATE OR REPLACE FUNCTION "generate_trainer_availability_slots"(
  p_trainer_profile_id TEXT DEFAULT NULL,
  p_from_date DATE DEFAULT CURRENT_DATE,
  p_to_date DATE DEFAULT (CURRENT_DATE + 30),
  p_prune_existing BOOLEAN DEFAULT TRUE
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_inserted_count INTEGER := 0;
BEGIN
  IF p_to_date < p_from_date THEN
    RAISE EXCEPTION 'p_to_date (%) must be on or after p_from_date (%)', p_to_date, p_from_date;
  END IF;

  IF p_prune_existing THEN
    DELETE FROM "TrainerAvailabilitySlot" tas
    WHERE tas."status" = 'AVAILABLE'
      AND tas."sourceBlockId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM "TrainingSession" ts
        WHERE ts."availabilitySlotId" = tas."id"
      )
      AND tas."startsAt"::date >= p_from_date
      AND tas."startsAt"::date <= p_to_date
      AND (p_trainer_profile_id IS NULL OR tas."trainerProfileId" = p_trainer_profile_id);
  END IF;

  WITH day_series AS (
    SELECT gs::date AS day
    FROM generate_series(p_from_date, p_to_date, interval '1 day') AS gs
  ),
  matching_blocks AS (
    SELECT
      tsb."id" AS source_block_id,
      tsb."trainerProfileId",
      tsb."timezone",
      tsb."startMinutes",
      tsb."endMinutes",
      tsb."slotDurationMinutes",
      ds.day
    FROM "TrainerScheduleBlock" tsb
    JOIN day_series ds
      ON (
        tsb."scheduleType" = 'RECURRING'::"ScheduleBlockType"
        AND CASE EXTRACT(ISODOW FROM ds.day)
          WHEN 1 THEN 'MONDAY'::"DayOfWeek"
          WHEN 2 THEN 'TUESDAY'::"DayOfWeek"
          WHEN 3 THEN 'WEDNESDAY'::"DayOfWeek"
          WHEN 4 THEN 'THURSDAY'::"DayOfWeek"
          WHEN 5 THEN 'FRIDAY'::"DayOfWeek"
          WHEN 6 THEN 'SATURDAY'::"DayOfWeek"
          WHEN 7 THEN 'SUNDAY'::"DayOfWeek"
        END = tsb."dayOfWeek"
      )
      OR (
        tsb."scheduleType" = 'ONE_OFF'::"ScheduleBlockType"
        AND tsb."specificDate" = ds.day
      )
    WHERE tsb."active" = TRUE
      AND (p_trainer_profile_id IS NULL OR tsb."trainerProfileId" = p_trainer_profile_id)
      AND (tsb."effectiveFrom" IS NULL OR ds.day >= tsb."effectiveFrom"::date)
      AND (tsb."effectiveUntil" IS NULL OR ds.day <= tsb."effectiveUntil"::date)
  ),
  generated_slots AS (
    SELECT
      mb.source_block_id,
      mb."trainerProfileId",
      mb."timezone",
      (mb.day + make_interval(mins => mb."startMinutes" + slot_offset.offset_minutes))::timestamp AS starts_at,
      (mb.day + make_interval(mins => mb."startMinutes" + slot_offset.offset_minutes + mb."slotDurationMinutes"))::timestamp AS ends_at
    FROM matching_blocks mb
    CROSS JOIN LATERAL generate_series(
      0,
      (mb."endMinutes" - mb."startMinutes") - mb."slotDurationMinutes",
      mb."slotDurationMinutes"
    ) AS slot_offset(offset_minutes)
  ),
  inserted AS (
    INSERT INTO "TrainerAvailabilitySlot" (
      "id",
      "trainerProfileId",
      "sourceBlockId",
      "startsAt",
      "endsAt",
      "timezone",
      "status",
      "createdAt",
      "updatedAt"
    )
    SELECT
      md5(
        gs."trainerProfileId"
        || '|' || gs.source_block_id
        || '|' || gs.starts_at::text
        || '|' || gs.ends_at::text
        || '|' || clock_timestamp()::text
      ),
      gs."trainerProfileId",
      gs.source_block_id,
      gs.starts_at,
      gs.ends_at,
      gs."timezone",
      'AVAILABLE'::"AvailabilitySlotStatus",
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM generated_slots gs
    WHERE NOT EXISTS (
      SELECT 1
      FROM "TrainerAvailabilitySlot" existing
      WHERE existing."trainerProfileId" = gs."trainerProfileId"
        AND existing."startsAt" = gs.starts_at
        AND existing."endsAt" = gs.ends_at
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "TrainerAvailabilitySlot" unavailable_slot
      WHERE unavailable_slot."trainerProfileId" = gs."trainerProfileId"
        AND unavailable_slot."status" IN (
          'BOOKED'::"AvailabilitySlotStatus",
          'BLOCKED'::"AvailabilitySlotStatus"
        )
        AND tsrange(unavailable_slot."startsAt", unavailable_slot."endsAt", '[)')
          && tsrange(gs.starts_at, gs.ends_at, '[)')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "TrainingSession" scheduled_session
      WHERE scheduled_session."trainerProfileId" = gs."trainerProfileId"
        AND scheduled_session."status" = 'SCHEDULED'::"TrainingSessionStatus"
        AND tsrange(scheduled_session."startsAt", scheduled_session."endsAt", '[)')
          && tsrange(gs.starts_at, gs.ends_at, '[)')
    )
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted_count FROM inserted;

  RETURN v_inserted_count;
END;
$$;

CREATE OR REPLACE FUNCTION "refresh_all_trainer_availability_slots"(
  p_from_date DATE DEFAULT CURRENT_DATE,
  p_to_date DATE DEFAULT (CURRENT_DATE + 30)
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN "generate_trainer_availability_slots"(NULL, p_from_date, p_to_date, TRUE);
END;
$$;

CREATE OR REPLACE FUNCTION "sync_trainer_availability_slots_from_block_change"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_trainer_profile_id TEXT;
BEGIN
  v_trainer_profile_id := COALESCE(
    NEW."trainerProfileId",
    OLD."trainerProfileId"
  );

  PERFORM "generate_trainer_availability_slots"(
    v_trainer_profile_id,
    CURRENT_DATE,
    CURRENT_DATE + 30,
    TRUE
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "prune_trainer_availability_slots_before_block_delete"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM "TrainerAvailabilitySlot" tas
  WHERE tas."sourceBlockId" = OLD."id"
    AND tas."status" = 'AVAILABLE'
    AND tas."startsAt" >= CURRENT_TIMESTAMP
    AND NOT EXISTS (
      SELECT 1
      FROM "TrainingSession" ts
      WHERE ts."availabilitySlotId" = tas."id"
    );

  RETURN OLD;
END;
$$;

CREATE TRIGGER "trainer_schedule_block_prune_slots_before_delete"
BEFORE DELETE ON "TrainerScheduleBlock"
FOR EACH ROW
EXECUTE FUNCTION "prune_trainer_availability_slots_before_block_delete"();

CREATE TRIGGER "trainer_schedule_block_sync_slots"
AFTER INSERT OR UPDATE ON "TrainerScheduleBlock"
FOR EACH ROW
EXECUTE FUNCTION "sync_trainer_availability_slots_from_block_change"();

CREATE VIEW "BudibaseTrainerProfile" AS
SELECT
  tp."id",
  tp."budibaseUserId",
  tp."displayName",
  tp."email",
  tp."bio",
  tp."active",
  tp."createdAt",
  tp."updatedAt"
FROM "TrainerProfile" tp;

CREATE VIEW "BudibaseTrainerScheduleBlock" AS
SELECT
  tsb."id",
  tsb."trainerProfileId",
  tp."displayName" AS "trainerDisplayName",
  tsb."scheduleType",
  tsb."dayOfWeek",
  tsb."specificDate",
  tsb."startMinutes",
  tsb."endMinutes",
  tsb."slotDurationMinutes",
  tsb."timezone",
  tsb."effectiveFrom",
  tsb."effectiveUntil",
  tsb."active",
  tsb."createdAt",
  tsb."updatedAt"
FROM "TrainerScheduleBlock" tsb
JOIN "TrainerProfile" tp ON tp."id" = tsb."trainerProfileId";

CREATE VIEW "BudibaseTrainerAvailabilitySlot" AS
SELECT
  tas."id",
  tas."trainerProfileId",
  tp."displayName" AS "trainerDisplayName",
  tas."sourceBlockId",
  tas."startsAt",
  tas."endsAt",
  tas."timezone",
  tas."status",
  ts."id" AS "trainingSessionId",
  tas."createdAt",
  tas."updatedAt"
FROM "TrainerAvailabilitySlot" tas
JOIN "TrainerProfile" tp ON tp."id" = tas."trainerProfileId"
LEFT JOIN "TrainingSession" ts ON ts."availabilitySlotId" = tas."id";

CREATE VIEW "BudibaseTrainingSession" AS
SELECT
  ts."id",
  ts."memberUserId",
  u."name" AS "memberName",
  u."email" AS "memberEmail",
  ts."trainerProfileId",
  tp."displayName" AS "trainerDisplayName",
  tp."email" AS "trainerEmail",
  ts."availabilitySlotId",
  ts."startsAt",
  ts."endsAt",
  ts."status",
  ts."memberNotes",
  ts."createdAt",
  ts."updatedAt"
FROM "TrainingSession" ts
JOIN "User" u ON u."id" = ts."memberUserId"
JOIN "TrainerProfile" tp ON tp."id" = ts."trainerProfileId";

CREATE VIEW "BudibaseSessionAttendance" AS
SELECT
  sa."id",
  sa."trainingSessionId",
  ts."memberUserId",
  u."name" AS "memberName",
  u."email" AS "memberEmail",
  ts."trainerProfileId",
  tp."displayName" AS "trainerDisplayName",
  sa."outcome",
  sa."markedByBudibaseUserId",
  sa."notes",
  sa."markedAt",
  sa."createdAt",
  sa."updatedAt"
FROM "SessionAttendance" sa
JOIN "TrainingSession" ts ON ts."id" = sa."trainingSessionId"
JOIN "User" u ON u."id" = ts."memberUserId"
JOIN "TrainerProfile" tp ON tp."id" = ts."trainerProfileId";

CREATE VIEW "BudibaseOperationalTrainingSession" AS
SELECT
  ts."id",
  ts."memberUserId",
  u."name" AS "memberName",
  u."email" AS "memberEmail",
  ts."trainerProfileId",
  tp."budibaseUserId" AS "trainerBudibaseUserId",
  tp."displayName" AS "trainerDisplayName",
  tp."email" AS "trainerEmail",
  ts."availabilitySlotId",
  ts."startsAt",
  ts."endsAt",
  COALESCE(tas."timezone", 'Africa/Johannesburg') AS "timezone",
  ts."status",
  ts."memberNotes",
  sa."id" AS "attendanceId",
  sa."outcome" AS "attendanceOutcome",
  sa."markedByBudibaseUserId" AS "attendanceMarkedByBudibaseUserId",
  sa."notes" AS "attendanceNotes",
  sa."markedAt" AS "attendanceMarkedAt",
  (ts."startsAt"::date) AS "sessionDate",
  CASE
    WHEN ts."startsAt" > CURRENT_TIMESTAMP THEN 'UPCOMING'
    WHEN ts."endsAt" <= CURRENT_TIMESTAMP THEN 'PAST'
    ELSE 'IN_PROGRESS'
  END AS "sessionWindow",
  CASE
    WHEN ts."status" = 'SCHEDULED'::"TrainingSessionStatus"
      AND ts."startsAt" >= CURRENT_TIMESTAMP + INTERVAL '30 minutes'
    THEN TRUE
    ELSE FALSE
  END AS "canMemberCancel",
  CASE
    WHEN ts."status" = 'SCHEDULED'::"TrainingSessionStatus"
      AND ts."startsAt" >= CURRENT_TIMESTAMP + INTERVAL '30 minutes'
    THEN TRUE
    ELSE FALSE
  END AS "canTrainerSuggestReschedule",
  CASE
    WHEN ts."status" = 'SCHEDULED'::"TrainingSessionStatus"
      AND ts."startsAt" + INTERVAL '1 minute' <= CURRENT_TIMESTAMP
    THEN TRUE
    ELSE FALSE
  END AS "canMarkAttendance",
  ts."createdAt",
  ts."updatedAt"
FROM "TrainingSession" ts
JOIN "User" u ON u."id" = ts."memberUserId"
JOIN "TrainerProfile" tp ON tp."id" = ts."trainerProfileId"
LEFT JOIN "TrainerAvailabilitySlot" tas ON tas."id" = ts."availabilitySlotId"
LEFT JOIN "SessionAttendance" sa ON sa."trainingSessionId" = ts."id";

CREATE VIEW "BudibaseUpcomingAvailableSlot" AS
SELECT
  tas."id",
  tas."trainerProfileId",
  tp."budibaseUserId" AS "trainerBudibaseUserId",
  tp."displayName" AS "trainerDisplayName",
  tp."email" AS "trainerEmail",
  tas."sourceBlockId",
  tas."startsAt",
  tas."endsAt",
  tas."timezone",
  tas."status",
  (tas."startsAt"::date) AS "slotDate",
  tas."createdAt",
  tas."updatedAt"
FROM "TrainerAvailabilitySlot" tas
JOIN "TrainerProfile" tp ON tp."id" = tas."trainerProfileId"
WHERE tas."status" = 'AVAILABLE'::"AvailabilitySlotStatus"
  AND tas."startsAt" > CURRENT_TIMESTAMP
  AND tp."active" = TRUE;

CREATE VIEW "BudibaseTrainerWorkloadSnapshot" AS
SELECT
  tp."id" AS "trainerProfileId",
  tp."budibaseUserId",
  tp."displayName",
  tp."email",
  COUNT(*) FILTER (
    WHERE ts."status" = 'SCHEDULED'::"TrainingSessionStatus"
      AND ts."startsAt" >= CURRENT_TIMESTAMP
  ) AS "upcomingScheduledSessions",
  COUNT(*) FILTER (
    WHERE ts."status" = 'SCHEDULED'::"TrainingSessionStatus"
      AND ts."startsAt"::date = CURRENT_DATE
  ) AS "todayScheduledSessions",
  COUNT(*) FILTER (
    WHERE ts."status" = 'CANCELLED_BY_MEMBER'::"TrainingSessionStatus"
  ) AS "cancelledByMemberSessions",
  COUNT(*) FILTER (
    WHERE ts."status" = 'CANCELLED_BY_ADMIN'::"TrainingSessionStatus"
  ) AS "cancelledByAdminSessions",
  COUNT(*) FILTER (
    WHERE sa."outcome" = 'ATTENDED'::"AttendanceOutcome"
  ) AS "attendedSessions",
  COUNT(*) FILTER (
    WHERE sa."outcome" = 'MISSED'::"AttendanceOutcome"
  ) AS "missedSessions",
  COUNT(*) FILTER (
    WHERE sa."outcome" = 'CANCELLED'::"AttendanceOutcome"
  ) AS "attendanceCancelledSessions"
FROM "TrainerProfile" tp
LEFT JOIN "TrainingSession" ts ON ts."trainerProfileId" = tp."id"
LEFT JOIN "SessionAttendance" sa ON sa."trainingSessionId" = ts."id"
GROUP BY
  tp."id",
  tp."budibaseUserId",
  tp."displayName",
  tp."email";
