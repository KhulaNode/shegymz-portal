CREATE OR REPLACE VIEW "BudibaseTrainerProfile" AS
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

CREATE OR REPLACE VIEW "BudibaseTrainerAvailabilityRule" AS
SELECT
  tar."id",
  tar."trainerProfileId",
  tp."displayName" AS "trainerDisplayName",
  tar."dayOfWeek",
  tar."startMinutes",
  tar."endMinutes",
  tar."timezone",
  tar."effectiveFrom",
  tar."effectiveUntil",
  tar."active",
  tar."createdAt",
  tar."updatedAt"
FROM "TrainerAvailabilityRule" tar
JOIN "TrainerProfile" tp ON tp."id" = tar."trainerProfileId";

CREATE OR REPLACE VIEW "BudibaseTrainerAvailabilitySlot" AS
SELECT
  tas."id",
  tas."trainerProfileId",
  tp."displayName" AS "trainerDisplayName",
  tas."sourceRuleId",
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

CREATE OR REPLACE VIEW "BudibaseTrainingSession" AS
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

CREATE OR REPLACE VIEW "BudibaseSessionAttendance" AS
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
