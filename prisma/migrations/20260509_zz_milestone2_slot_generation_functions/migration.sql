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
      AND tas."sourceRuleId" IS NOT NULL
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
  matching_rules AS (
    SELECT
      tar."id" AS source_rule_id,
      tar."trainerProfileId",
      tar."timezone",
      ds.day,
      (ds.day + make_interval(mins => tar."startMinutes"))::timestamp AS starts_at,
      (ds.day + make_interval(mins => tar."endMinutes"))::timestamp AS ends_at
    FROM "TrainerAvailabilityRule" tar
    JOIN day_series ds
      ON CASE EXTRACT(ISODOW FROM ds.day)
        WHEN 1 THEN 'MONDAY'::"DayOfWeek"
        WHEN 2 THEN 'TUESDAY'::"DayOfWeek"
        WHEN 3 THEN 'WEDNESDAY'::"DayOfWeek"
        WHEN 4 THEN 'THURSDAY'::"DayOfWeek"
        WHEN 5 THEN 'FRIDAY'::"DayOfWeek"
        WHEN 6 THEN 'SATURDAY'::"DayOfWeek"
        WHEN 7 THEN 'SUNDAY'::"DayOfWeek"
      END = tar."dayOfWeek"
    WHERE tar."active" = TRUE
      AND (p_trainer_profile_id IS NULL OR tar."trainerProfileId" = p_trainer_profile_id)
      AND (tar."effectiveFrom" IS NULL OR ds.day >= tar."effectiveFrom"::date)
      AND (tar."effectiveUntil" IS NULL OR ds.day <= tar."effectiveUntil"::date)
  ),
  inserted AS (
    INSERT INTO "TrainerAvailabilitySlot" (
      "id",
      "trainerProfileId",
      "sourceRuleId",
      "startsAt",
      "endsAt",
      "timezone",
      "status",
      "createdAt",
      "updatedAt"
    )
    SELECT
      md5(
        mr."trainerProfileId"
        || '|' || mr.source_rule_id
        || '|' || mr.starts_at::text
        || '|' || mr.ends_at::text
        || '|' || clock_timestamp()::text
      ),
      mr."trainerProfileId",
      mr.source_rule_id,
      mr.starts_at,
      mr.ends_at,
      mr."timezone",
      'AVAILABLE'::"AvailabilitySlotStatus",
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM matching_rules mr
    WHERE NOT EXISTS (
      SELECT 1
      FROM "TrainerAvailabilitySlot" existing
      WHERE existing."trainerProfileId" = mr."trainerProfileId"
        AND existing."startsAt" = mr.starts_at
        AND existing."endsAt" = mr.ends_at
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
