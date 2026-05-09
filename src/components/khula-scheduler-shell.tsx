'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  KhulaScheduler,
  SchedulerProvider,
  type Event,
} from '@khulanode/khula-scheduler';
import { bookTrainingSessionAction, cancelTrainingSessionAction } from '@/app/schedule/actions';
import type {
  MemberBookableSlot,
  MemberTrainerSummary,
  MemberTrainingSessionSummary,
} from '@/lib/member-sessions';
import { portalCopy } from '@/content/portal-copy';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type KhulaSchedulerShellProps = {
  trainers: MemberTrainerSummary[];
  availableSlots: MemberBookableSlot[];
  sessions: MemberTrainingSessionSummary[];
  initialTrainerId: string | null;
};

function schedulerWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const year = date.getFullYear();
  const janFirst = new Date(year, 0, 1);
  const janFirstDow = janFirst.getDay();
  const start = new Date(janFirst);
  start.setDate(janFirst.getDate() + (weekNo - 1) * 7 + ((1 - janFirstDow + 7) % 7));
  return start;
}

function formatWeekRange(date: Date): string {
  const monday = schedulerWeekStart(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmtShort = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fmtFull = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmtShort(monday)} – ${fmtFull(sunday)}`;
}

function formatSlotDateTime(startsAtIso: string, endsAtIso: string) {
  const startsAt = new Date(startsAtIso);
  const endsAt = new Date(endsAtIso);

  return {
    dayLabel: startsAt.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }),
    timeLabel: `${startsAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })} - ${endsAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`,
  };
}

function buildReturnTo(trainerId: string | null) {
  if (!trainerId) {
    return '/schedule';
  }

  return `/schedule?trainer=${encodeURIComponent(trainerId)}`;
}

const navBtnClass =
  'inline-flex items-center gap-1 rounded-full border border-[rgb(var(--scheduler-border))] bg-white px-3 py-1.5 text-xs font-semibold text-[rgb(var(--scheduler-foreground))] transition hover:bg-[rgb(var(--scheduler-muted))]';

function ScheduleActionButton({
  children,
  variant,
}: {
  children: string;
  variant: 'primary' | 'secondary';
}) {
  return (
    <button
      type="submit"
      className={
        variant === 'primary'
          ? 'inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-plum-900 via-[#7d2d6c] to-[#b5406a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(74,44,74,0.22)] transition hover:shadow-[0_12px_32px_rgba(74,44,74,0.3)]'
          : 'inline-flex w-full items-center justify-center rounded-full border border-warmgray-300 bg-white px-4 py-2.5 text-sm font-semibold text-plum-900 transition hover:border-rose-300'
      }
    >
      {children}
    </button>
  );
}

export function KhulaSchedulerShell({
  trainers,
  availableSlots,
  sessions,
  initialTrainerId,
}: KhulaSchedulerShellProps) {
  const router = useRouter();
  const [shownDate, setShownDate] = useState(new Date());
  const [selectedTrainerId, setSelectedTrainerId] = useState(initialTrainerId);

  const selectedTrainer = useMemo(
    () => trainers.find((trainer) => trainer.id === selectedTrainerId) ?? null,
    [selectedTrainerId, trainers],
  );

  const selectedTrainerSlots = useMemo(
    () =>
      availableSlots.filter((slot) => slot.trainerProfileId === selectedTrainerId),
    [availableSlots, selectedTrainerId],
  );

  const scheduleEvents = useMemo<Event[]>(() => {
    const slotEvents = selectedTrainerSlots.map((slot) => ({
      id: `slot-${slot.id}`,
      title: `Available with ${slot.trainerDisplayName}`,
      description: 'Open training-session slot',
      startDate: new Date(slot.startsAtIso),
      endDate: new Date(slot.endsAtIso),
      variant: 'primary' as const,
    }));

    const sessionEvents = sessions
      .filter((session) => session.status === 'SCHEDULED')
      .map((session) => ({
        id: `session-${session.id}`,
        title: `Your training session with ${session.trainerDisplayName}`,
        description: session.memberNotes ?? 'Confirmed member booking',
        startDate: new Date(session.startsAtIso),
        endDate: new Date(session.endsAtIso),
        variant: 'success' as const,
      }));

    return [...slotEvents, ...sessionEvents];
  }, [selectedTrainerSlots, sessions]);

  const returnTo = buildReturnTo(selectedTrainerId);

  if (trainers.length === 0) {
    return (
      <section className="rounded-[2.25rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-8 text-center shadow-[0_28px_90px_rgba(74,44,74,0.08)]">
        <h2 className="text-2xl font-semibold text-plum-900">
          {portalCopy.schedule.noTrainerTitle}
        </h2>
        <p className="mt-4 text-base leading-8 text-plum-800">
          {portalCopy.schedule.noTrainerBody}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.25rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-6 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
          {portalCopy.schedule.trainerPickerLabel}
        </p>
        <p className="mt-3 text-sm leading-7 text-plum-800">
          {portalCopy.schedule.trainerPickerHint}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {trainers.map((trainer) => {
            const isSelected = trainer.id === selectedTrainerId;

            return (
              <button
                key={trainer.id}
                type="button"
                onClick={() => {
                  setSelectedTrainerId(trainer.id);
                  router.replace(`/schedule?trainer=${encodeURIComponent(trainer.id)}`);
                }}
                className={
                  isSelected
                    ? 'inline-flex items-center gap-2 rounded-full bg-plum-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(74,44,74,0.22)]'
                    : 'inline-flex items-center gap-2 rounded-full border border-warmgray-300 bg-white px-4 py-2.5 text-sm font-semibold text-plum-900 transition hover:border-rose-300'
                }
              >
                <span>{trainer.displayName}</span>
                <span
                  className={
                    isSelected
                      ? 'rounded-full bg-white/18 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em]'
                      : 'rounded-full bg-warmgray-100 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-plum-700'
                  }
                >
                  {trainer.availableSlotCount} slots
                </span>
              </button>
            );
          })}
        </div>
        {selectedTrainer?.bio && (
          <p className="mt-5 max-w-3xl text-sm leading-7 text-plum-800">
            {selectedTrainer.bio}
          </p>
        )}
      </section>

      <div className="overflow-hidden rounded-none border-x-0 border-y border-white/75 bg-white/95 p-0 shadow-none backdrop-blur sm:rounded-[2.25rem] sm:border sm:p-5 sm:shadow-[0_26px_90px_rgba(53,18,41,0.09)] lg:rounded-[2.75rem]">
        <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-[1.7rem] sm:border sm:border-plum-100/70 sm:bg-[#fffdfb] sm:p-4">
          <div className="flex items-center px-3 pt-3 pb-1 sm:hidden">
            <p className="text-sm font-semibold text-plum-900">
              {formatWeekRange(shownDate)}
            </p>
          </div>

          <div className="khula-member-calendar khula-mobile-shell max-sm:[zoom:0.72]">
            <SchedulerProvider initialState={scheduleEvents} weekStartsOn="monday">
              <KhulaScheduler
                views={{ views: ['week', 'day', 'month'], mobileViews: ['week'] }}
                classNames={{
                  tabs: { tabList: 'max-sm:!hidden' },
                  buttons: { addEvent: 'hidden' },
                }}
                CustomComponents={{
                  customButtons: {
                    CustomPrevButton: (
                      <button
                        type="button"
                        onClick={() => setShownDate((d) => new Date(+d - WEEK_MS))}
                        className={navBtnClass}
                      >
                        ← Prev
                      </button>
                    ),
                    CustomNextButton: (
                      <button
                        type="button"
                        onClick={() => setShownDate((d) => new Date(+d + WEEK_MS))}
                        className={navBtnClass}
                      >
                        Next →
                      </button>
                    ),
                    CustomAddEventButton: <span className="hidden" />,
                  },
                }}
              />
            </SchedulerProvider>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .khula-member-calendar .group.rounded-lg {
          pointer-events: none !important;
        }

        .khula-member-calendar button.absolute {
          display: none !important;
        }
      `}</style>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2.25rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-6 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-8">
          <h2 className="text-2xl font-semibold text-plum-900">
            {portalCopy.schedule.availableSlotsTitle}
          </h2>
          <div className="mt-5 space-y-4">
            {selectedTrainerSlots.length === 0 ? (
              <p className="rounded-[1.5rem] border border-warmgray-200 bg-white px-5 py-4 text-sm leading-7 text-plum-800">
                {portalCopy.schedule.availableSlotsEmpty}
              </p>
            ) : (
              selectedTrainerSlots.map((slot) => {
                const { dayLabel, timeLabel } = formatSlotDateTime(
                  slot.startsAtIso,
                  slot.endsAtIso,
                );

                return (
                  <form
                    key={slot.id}
                    action={bookTrainingSessionAction}
                    className="rounded-[1.5rem] border border-warmgray-200 bg-white p-5 shadow-[0_12px_40px_rgba(74,44,74,0.05)]"
                  >
                    <input type="hidden" name="availabilitySlotId" value={slot.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-plum-700">
                      {slot.trainerDisplayName}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-plum-900">{dayLabel}</p>
                    <p className="mt-1 text-sm text-plum-800">{timeLabel}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-plum-600">
                      {slot.timezone}
                    </p>
                    <div className="mt-5">
                      <ScheduleActionButton variant="primary">
                        {portalCopy.schedule.bookCta}
                      </ScheduleActionButton>
                    </div>
                  </form>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-6 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-8">
          <h2 className="text-2xl font-semibold text-plum-900">
            {portalCopy.schedule.mySessionsTitle}
          </h2>
          <div className="mt-5 space-y-4">
            {sessions.length === 0 ? (
              <p className="rounded-[1.5rem] border border-warmgray-200 bg-white px-5 py-4 text-sm leading-7 text-plum-800">
                {portalCopy.schedule.mySessionsEmpty}
              </p>
            ) : (
              sessions.map((session) => {
                const { dayLabel, timeLabel } = formatSlotDateTime(
                  session.startsAtIso,
                  session.endsAtIso,
                );

                return (
                  <div
                    key={session.id}
                    className="rounded-[1.5rem] border border-warmgray-200 bg-white p-5 shadow-[0_12px_40px_rgba(74,44,74,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-plum-700">
                          {session.trainerDisplayName}
                        </p>
                        <p className="mt-3 text-lg font-semibold text-plum-900">{dayLabel}</p>
                        <p className="mt-1 text-sm text-plum-800">{timeLabel}</p>
                      </div>
                      <span
                        className={
                          session.status === 'SCHEDULED'
                            ? 'rounded-full bg-rose-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-plum-900'
                            : 'rounded-full bg-warmgray-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-plum-700'
                        }
                      >
                        {session.status === 'SCHEDULED'
                          ? 'Confirmed'
                          : session.status === 'CANCELLED_BY_MEMBER'
                            ? 'Cancelled by you'
                            : 'Cancelled by admin'}
                      </span>
                    </div>
                    {session.memberNotes && (
                      <p className="mt-4 text-sm leading-7 text-plum-800">{session.memberNotes}</p>
                    )}
                    <div className="mt-5">
                      {session.canCancel ? (
                        <form action={cancelTrainingSessionAction}>
                          <input type="hidden" name="trainingSessionId" value={session.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <ScheduleActionButton variant="secondary">
                            {portalCopy.schedule.cancelCta}
                          </ScheduleActionButton>
                        </form>
                      ) : (
                        <p className="text-sm leading-7 text-plum-700">
                          {portalCopy.schedule.cancelLocked}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
