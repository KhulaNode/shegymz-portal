DROP INDEX IF EXISTS "TrainingSession_availabilitySlotId_key";

CREATE UNIQUE INDEX "TrainingSession_scheduled_slot_unique"
ON "TrainingSession"("availabilitySlotId")
WHERE "status" = 'SCHEDULED'::"TrainingSessionStatus";
