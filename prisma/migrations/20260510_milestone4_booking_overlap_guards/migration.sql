CREATE OR REPLACE FUNCTION "book_training_session"(
  p_member_user_id TEXT,
  p_availability_slot_id TEXT,
  p_member_notes TEXT DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_slot "TrainerAvailabilitySlot"%ROWTYPE;
  v_member "User"%ROWTYPE;
  v_session_id TEXT;
BEGIN
  SELECT *
  INTO v_member
  FROM "User"
  WHERE "id" = p_member_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'member user % does not exist', p_member_user_id;
  END IF;

  SELECT *
  INTO v_slot
  FROM "TrainerAvailabilitySlot"
  WHERE "id" = p_availability_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'availability slot % does not exist', p_availability_slot_id;
  END IF;

  IF v_slot."status" <> 'AVAILABLE' THEN
    RAISE EXCEPTION 'availability slot % is not available', p_availability_slot_id;
  END IF;

  IF v_slot."startsAt" <= CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'availability slot % is not in the future', p_availability_slot_id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "TrainingSession" ts
    WHERE ts."status" = 'SCHEDULED'::"TrainingSessionStatus"
      AND ts."memberUserId" = p_member_user_id
      AND tsrange(ts."startsAt", ts."endsAt", '[)') && tsrange(v_slot."startsAt", v_slot."endsAt", '[)')
  ) THEN
    RAISE EXCEPTION 'member booking overlap for slot %', p_availability_slot_id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "TrainingSession" ts
    WHERE ts."status" = 'SCHEDULED'::"TrainingSessionStatus"
      AND ts."trainerProfileId" = v_slot."trainerProfileId"
      AND tsrange(ts."startsAt", ts."endsAt", '[)') && tsrange(v_slot."startsAt", v_slot."endsAt", '[)')
  ) THEN
    RAISE EXCEPTION 'trainer booking overlap for slot %', p_availability_slot_id;
  END IF;

  INSERT INTO "TrainingSession" (
    "id",
    "memberUserId",
    "trainerProfileId",
    "availabilitySlotId",
    "startsAt",
    "endsAt",
    "status",
    "memberNotes",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    md5(
      p_member_user_id
      || '|' || p_availability_slot_id
      || '|' || clock_timestamp()::text
    ),
    p_member_user_id,
    v_slot."trainerProfileId",
    v_slot."id",
    v_slot."startsAt",
    v_slot."endsAt",
    'SCHEDULED'::"TrainingSessionStatus",
    p_member_notes,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING "id" INTO v_session_id;

  UPDATE "TrainerAvailabilitySlot"
  SET
    "status" = 'BOOKED'::"AvailabilitySlotStatus",
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "id" = v_slot."id";

  RETURN v_session_id;
END;
$$;
