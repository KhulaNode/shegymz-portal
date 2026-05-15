BEGIN;

INSERT INTO "TrainerProfile" (
  "id",
  "budibaseUserId",
  "displayName",
  "email",
  "bio",
  "active",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'trainer-profile-m4-naledi',
    'bb-m4-naledi',
    'Naledi Mokoena',
    'naledi.testing@shegymz.local',
    'Strength and mobility trainer for Milestone 4 member booking tests.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'trainer-profile-m4-amahle',
    'bb-m4-amahle',
    'Amahle Dlamini',
    'amahle.testing@shegymz.local',
    'Recovery and conditioning trainer for Milestone 4 member booking tests.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("budibaseUserId")
DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  "email" = EXCLUDED."email",
  "bio" = EXCLUDED."bio",
  "active" = EXCLUDED."active",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "TrainerScheduleBlock" (
  "id",
  "trainerProfileId",
  "scheduleType",
  "dayOfWeek",
  "specificDate",
  "startMinutes",
  "endMinutes",
  "slotDurationMinutes",
  "timezone",
  "effectiveFrom",
  "effectiveUntil",
  "active",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'trainer-block-m4-naledi-mon',
    'trainer-profile-m4-naledi',
    'RECURRING'::"ScheduleBlockType",
    'MONDAY'::"DayOfWeek",
    NULL,
    1080,
    1140,
    60,
    'Africa/Johannesburg',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'trainer-block-m4-naledi-wed',
    'trainer-profile-m4-naledi',
    'RECURRING'::"ScheduleBlockType",
    'WEDNESDAY'::"DayOfWeek",
    NULL,
    1080,
    1140,
    60,
    'Africa/Johannesburg',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'trainer-block-m4-amahle-tue',
    'trainer-profile-m4-amahle',
    'RECURRING'::"ScheduleBlockType",
    'TUESDAY'::"DayOfWeek",
    NULL,
    1020,
    1080,
    60,
    'Africa/Johannesburg',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'trainer-block-m4-amahle-thu',
    'trainer-profile-m4-amahle',
    'RECURRING'::"ScheduleBlockType",
    'THURSDAY'::"DayOfWeek",
    NULL,
    1140,
    1200,
    60,
    'Africa/Johannesburg',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id")
DO UPDATE SET
  "trainerProfileId" = EXCLUDED."trainerProfileId",
  "scheduleType" = EXCLUDED."scheduleType",
  "dayOfWeek" = EXCLUDED."dayOfWeek",
  "specificDate" = EXCLUDED."specificDate",
  "startMinutes" = EXCLUDED."startMinutes",
  "endMinutes" = EXCLUDED."endMinutes",
  "slotDurationMinutes" = EXCLUDED."slotDurationMinutes",
  "timezone" = EXCLUDED."timezone",
  "effectiveFrom" = EXCLUDED."effectiveFrom",
  "effectiveUntil" = EXCLUDED."effectiveUntil",
  "active" = EXCLUDED."active",
  "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;

SELECT "generate_trainer_availability_slots"(
  'trainer-profile-m4-naledi',
  CURRENT_DATE,
  CURRENT_DATE + 21,
  TRUE
);

SELECT "generate_trainer_availability_slots"(
  'trainer-profile-m4-amahle',
  CURRENT_DATE,
  CURRENT_DATE + 21,
  TRUE
);
