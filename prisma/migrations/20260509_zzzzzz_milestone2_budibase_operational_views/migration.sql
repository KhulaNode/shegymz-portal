CREATE OR REPLACE VIEW "BudibaseOperationalTrainingSession" AS
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

CREATE OR REPLACE VIEW "BudibaseUpcomingAvailableSlot" AS
SELECT
  tas."id",
  tas."trainerProfileId",
  tp."budibaseUserId" AS "trainerBudibaseUserId",
  tp."displayName" AS "trainerDisplayName",
  tp."email" AS "trainerEmail",
  tas."sourceRuleId",
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

CREATE OR REPLACE VIEW "BudibaseTrainerWorkloadSnapshot" AS
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
