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

INSERT INTO "TrainerAvailabilityRule" (
  "id",
  "trainerProfileId",
  "dayOfWeek",
  "startMinutes",
  "endMinutes",
  "timezone",
  "effectiveFrom",
  "effectiveUntil",
  "active",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'trainer-rule-m4-naledi-mon',
    'trainer-profile-m4-naledi',
    'MONDAY'::"DayOfWeek",
    1080,
    1140,
    'Africa/Johannesburg',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'trainer-rule-m4-naledi-wed',
    'trainer-profile-m4-naledi',
    'WEDNESDAY'::"DayOfWeek",
    1080,
    1140,
    'Africa/Johannesburg',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'trainer-rule-m4-amahle-tue',
    'trainer-profile-m4-amahle',
    'TUESDAY'::"DayOfWeek",
    1020,
    1080,
    'Africa/Johannesburg',
    CURRENT_DATE - INTERVAL '1 day',
    NULL,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'trainer-rule-m4-amahle-thu',
    'trainer-profile-m4-amahle',
    'THURSDAY'::"DayOfWeek",
    1140,
    1200,
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
  "dayOfWeek" = EXCLUDED."dayOfWeek",
  "startMinutes" = EXCLUDED."startMinutes",
  "endMinutes" = EXCLUDED."endMinutes",
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
