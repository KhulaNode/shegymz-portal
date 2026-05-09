CREATE OR REPLACE FUNCTION "mark_training_session_attendance"(
  p_training_session_id TEXT,
  p_marked_by_budibase_user_id TEXT,
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
    "markedByBudibaseUserId",
    "notes",
    "markedAt",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    md5(
      p_training_session_id
      || '|' || p_marked_by_budibase_user_id
      || '|' || clock_timestamp()::text
    ),
    p_training_session_id,
    p_outcome,
    p_marked_by_budibase_user_id,
    p_notes,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT ("trainingSessionId")
  DO UPDATE SET
    "outcome" = EXCLUDED."outcome",
    "markedByBudibaseUserId" = EXCLUDED."markedByBudibaseUserId",
    "notes" = EXCLUDED."notes",
    "markedAt" = EXCLUDED."markedAt",
    "updatedAt" = CURRENT_TIMESTAMP;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION "cancel_training_session_by_admin"(
  p_training_session_id TEXT,
  p_admin_budibase_user_id TEXT,
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
      "markedByBudibaseUserId",
      "notes",
      "markedAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      md5(
        p_training_session_id
        || '|' || p_admin_budibase_user_id
        || '|admin-cancel|'
        || clock_timestamp()::text
      ),
      p_training_session_id,
      'CANCELLED'::"AttendanceOutcome",
      p_admin_budibase_user_id,
      p_reason,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("trainingSessionId")
    DO UPDATE SET
      "outcome" = EXCLUDED."outcome",
      "markedByBudibaseUserId" = EXCLUDED."markedByBudibaseUserId",
      "notes" = EXCLUDED."notes",
      "markedAt" = EXCLUDED."markedAt",
      "updatedAt" = CURRENT_TIMESTAMP;
  END IF;

  RETURN TRUE;
END;
$$;
