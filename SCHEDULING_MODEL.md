# SheGymZ Scheduling Model

This document explains the current scheduling model after replacing trainer availability rules with trainer-managed schedule blocks.

## Goal

The portal app should keep a stable booking flow, while Budibase should expose a simple trainer/admin workflow.

Trainers should manage availability by creating, editing, deactivating, or deleting schedule blocks. The portal should continue showing generated bookable slots to members.

## Current Flow

```text
TrainerProfile
  -> TrainerScheduleBlock
      -> TrainerAvailabilitySlot
          -> TrainingSession
              -> SessionAttendance
```

In plain terms:

- `TrainerProfile` is the trainer.
- `TrainerScheduleBlock` is the trainer-managed availability source.
- `TrainerAvailabilitySlot` is generated from schedule blocks and shown in the portal.
- `TrainingSession` is created when a member books a slot.
- `SessionAttendance` records the attendance outcome for a booked session.

## Main Tables

### TrainerProfile

This remains the trainer record.

Important fields:

- `id`
- `budibaseUserId`
- `displayName`
- `email`
- `bio`
- `active`

Budibase can continue creating and editing trainers here.

### TrainerScheduleBlock

This replaces the old `TrainerAvailabilityRule` model.

This is now the table trainers/admins should manage in Budibase.

Important fields:

- `trainerProfileId`
- `scheduleType`
- `dayOfWeek`
- `specificDate`
- `startMinutes`
- `endMinutes`
- `slotDurationMinutes`
- `timezone`
- `effectiveFrom`
- `effectiveUntil`
- `active`

`scheduleType` can be:

- `RECURRING`: repeating weekly availability.
- `ONE_OFF`: availability for one specific date.

For `RECURRING` blocks:

- `dayOfWeek` must be set.
- `specificDate` must be empty.

For `ONE_OFF` blocks:

- `specificDate` must be set.
- `dayOfWeek` must be empty.

Time fields use minutes from midnight.

Examples:

```text
09:00 = 540
10:00 = 600
12:00 = 720
13:00 = 780
```

Example recurring block:

```text
scheduleType: RECURRING
dayOfWeek: SATURDAY
specificDate: empty
startMinutes: 600
endMinutes: 780
slotDurationMinutes: 60
timezone: Africa/Johannesburg
active: true
```

This generates:

```text
10:00-11:00
11:00-12:00
12:00-13:00
```

Example one-off block:

```text
scheduleType: ONE_OFF
dayOfWeek: empty
specificDate: 2026-05-23
startMinutes: 600
endMinutes: 780
slotDurationMinutes: 60
timezone: Africa/Johannesburg
active: true
```

This generates slots only on `2026-05-23`.

### TrainerAvailabilitySlot

This table must remain. Do not delete it.

It is the portal-facing table of generated bookable slots.

Important fields:

- `trainerProfileId`
- `sourceBlockId`
- `startsAt`
- `endsAt`
- `timezone`
- `status`

`status` can be:

- `AVAILABLE`
- `BOOKED`
- `BLOCKED`

The portal reads `AVAILABLE` future slots from this table.

### TrainingSession

This table is created when a member books an availability slot.

Important fields:

- `memberUserId`
- `trainerProfileId`
- `availabilitySlotId`
- `startsAt`
- `endsAt`
- `status`

Booking still works as before:

```text
member books available slot
-> TrainingSession is created
-> TrainerAvailabilitySlot status becomes BOOKED
```

### SessionAttendance

This records attendance for a booked training session.

Important fields:

- `trainingSessionId`
- `outcome`
- `markedByBudibaseUserId`
- `notes`
- `markedAt`

## Database Functions

### generate_trainer_availability_slots

This function generates slots from active schedule blocks.

Signature:

```sql
SELECT "generate_trainer_availability_slots"(
  'trainer-profile-id'::text,
  CURRENT_DATE,
  CURRENT_DATE + 30,
  TRUE
);
```

Behavior:

- Reads active `TrainerScheduleBlock` rows.
- Generates `TrainerAvailabilitySlot` rows.
- Splits each block by `slotDurationMinutes`.
- Removes future unbooked generated slots when refreshing.
- Does not remove booked sessions.
- Does not create new available slots that overlap booked or blocked slots.

### refresh_all_trainer_availability_slots

This refreshes all trainers for a date range.

```sql
SELECT "refresh_all_trainer_availability_slots"(
  CURRENT_DATE,
  CURRENT_DATE + 30
);
```

## Budibase Views

The old Budibase rule view has been replaced.

Use:

```text
BudibaseTrainerScheduleBlock
```

Instead of:

```text
BudibaseTrainerAvailabilityRule
```

Useful views:

- `BudibaseTrainerProfile`
- `BudibaseTrainerScheduleBlock`
- `BudibaseTrainerAvailabilitySlot`
- `BudibaseUpcomingAvailableSlot`
- `BudibaseOperationalTrainingSession`
- `BudibaseTrainingSession`
- `BudibaseSessionAttendance`
- `BudibaseTrainerWorkloadSnapshot`

Budibase should manage schedule blocks and trainers. It should mostly view generated slots.

## Deployment Change

The Docker startup command now runs:

```bash
npx prisma migrate deploy && node server.js
```

This is required because `prisma db push` only creates tables. It does not run raw SQL migrations that create functions, triggers, and Budibase views.

For a fresh database, use migrations, not `db push`.

## Migration Summary

The migration does the following:

- Creates the `ScheduleBlockType` enum.
- Renames `TrainerAvailabilityRule` to `TrainerScheduleBlock`.
- Adds `scheduleType`, `specificDate`, and `slotDurationMinutes`.
- Makes `dayOfWeek` optional so one-off blocks can use `specificDate`.
- Renames `TrainerAvailabilitySlot.sourceRuleId` to `sourceBlockId`.
- Rewrites `generate_trainer_availability_slots`.
- Rewrites `refresh_all_trainer_availability_slots`.
- Adds triggers to regenerate slots when schedule blocks change.
- Adds safe cleanup when deleting schedule blocks.
- Recreates Budibase views for the new model.

## Operational Notes

Do not delete `TrainerAvailabilitySlot`; the portal depends on it.

To create availability:

1. Create a `TrainerScheduleBlock`.
2. Confirm slots appear in `TrainerAvailabilitySlot` or `BudibaseUpcomingAvailableSlot`.
3. The portal displays those generated available slots.

If slots do not appear, verify the function exists:

```sql
SELECT to_regprocedure(
  'public.generate_trainer_availability_slots(text,date,date,boolean)'
);
```

If this returns `null`, migrations were not applied to that database.

