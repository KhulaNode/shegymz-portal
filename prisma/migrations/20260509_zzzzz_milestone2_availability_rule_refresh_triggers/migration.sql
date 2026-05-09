CREATE OR REPLACE FUNCTION "sync_trainer_availability_slots_from_rule_change"()
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

DROP TRIGGER IF EXISTS "trainer_availability_rule_sync_slots" ON "TrainerAvailabilityRule";

CREATE TRIGGER "trainer_availability_rule_sync_slots"
AFTER INSERT OR UPDATE OR DELETE ON "TrainerAvailabilityRule"
FOR EACH ROW
EXECUTE FUNCTION "sync_trainer_availability_slots_from_rule_change"();
