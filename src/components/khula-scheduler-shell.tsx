'use client';

import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';
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

function formatSlotDateKey(startsAtIso: string) {
  const startsAt = new Date(startsAtIso);
  return startsAt.toISOString().slice(0, 10);
}

function getSessionWindow(startsAtIso: string) {
  return new Date(startsAtIso).getTime() > Date.now() ? 'upcoming' : 'history';
}

function isUpcomingScheduledSession(session: MemberTrainingSessionSummary) {
  return session.status === 'SCHEDULED' && getSessionWindow(session.startsAtIso) === 'upcoming';
}

function getSessionStatusLabel(status: MemberTrainingSessionSummary['status']) {
  switch (status) {
    case 'CANCELLED_BY_MEMBER':
      return 'Cancelled by you';
    case 'CANCELLED_BY_ADMIN':
      return 'Cancelled by admin';
    case 'SCHEDULED':
    default:
      return 'Confirmed';
  }
}

function formatCalendarEventWindow(event: Event) {
  return `${event.startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })}, ${event.startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${event.endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function calendarEventTone(event: Event) {
  return event.variant === 'success'
    ? 'border-emerald-200 bg-emerald-100 text-emerald-950 shadow-[0_6px_14px_rgba(6,95,70,0.12)]'
    : 'border-sky-200 bg-sky-100 text-sky-950 shadow-[0_6px_14px_rgba(3,105,161,0.12)]';
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
          ? 'inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-plum-900 via-[#7d2d6c] to-[#b5406a] px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(74,44,74,0.22)] transition hover:shadow-[0_12px_32px_rgba(74,44,74,0.3)]'
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
  const [isMobileCalendar, setIsMobileCalendar] = useState(false);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<Event | null>(null);

  const selectedTrainer = useMemo(
    () => trainers.find((trainer) => trainer.id === selectedTrainerId) ?? null,
    [selectedTrainerId, trainers],
  );

  const selectedTrainerSlots = useMemo(
    () =>
      availableSlots.filter((slot) => slot.trainerProfileId === selectedTrainerId),
    [availableSlots, selectedTrainerId],
  );

  const groupedTrainerSlots = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        dayLabel: string;
        slots: MemberBookableSlot[];
      }
    >();

    for (const slot of selectedTrainerSlots) {
      const key = formatSlotDateKey(slot.startsAtIso);
      const existing = groups.get(key);

      if (existing) {
        existing.slots.push(slot);
        continue;
      }

      const { dayLabel } = formatSlotDateTime(slot.startsAtIso, slot.endsAtIso);
      groups.set(key, {
        key,
        dayLabel,
        slots: [slot],
      });
    }

    return Array.from(groups.values());
  }, [selectedTrainerSlots]);

  const upcomingSessions = useMemo(
    () => sessions.filter(isUpcomingScheduledSession),
    [sessions],
  );

  const historySessions = useMemo(
    () =>
      sessions
        .filter((session) => !isUpcomingScheduledSession(session))
        .sort(
          (a, b) => new Date(b.startsAtIso).getTime() - new Date(a.startsAtIso).getTime(),
        ),
    [sessions],
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
  const calendarViews = isMobileCalendar
    ? { views: ['week'], mobileViews: ['week'] }
    : { views: ['day', 'week', 'month'], mobileViews: ['week'] };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateCalendarMode = () => setIsMobileCalendar(mediaQuery.matches);

    updateCalendarMode();
    mediaQuery.addEventListener('change', updateCalendarMode);

    return () => mediaQuery.removeEventListener('change', updateCalendarMode);
  }, []);

  function handleSchedulerInteractionCapture(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const allowedControl = target.closest(
      'button, [role="tab"], [role="tablist"], .khula-calendar-event-card',
    );

    if (allowedControl) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function handleSchedulerInteractionCapture(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    const allowInteractiveControl = Boolean(
      target.closest('button, [role="tab"], [role="tablist"]'),
    );

    if (allowInteractiveControl) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

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
      <section className="rounded-[1.75rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-5 shadow-[0_18px_60px_rgba(74,44,74,0.06)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              {portalCopy.schedule.trainerPickerLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-plum-800">
              {portalCopy.schedule.trainerPickerHint}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
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
              <p className="mt-4 max-w-3xl text-sm leading-6 text-plum-800">
                {selectedTrainer.bio}
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px] xl:shrink-0">
            <div className="rounded-[1.25rem] border border-warmgray-200 bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-plum-700">
                {portalCopy.schedule.availableSlotsCountLabel}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-plum-900">
                {selectedTrainerSlots.length}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-warmgray-200 bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-plum-700">
                {portalCopy.schedule.nextAvailabilityLabel}
              </p>
              <p className="mt-1 text-sm font-semibold text-plum-900">
                {selectedTrainerSlots[0]
                  ? formatSlotDateTime(
                      selectedTrainerSlots[0].startsAtIso,
                      selectedTrainerSlots[0].endsAtIso,
                    ).dayLabel
                  : '—'}
              </p>
              <p className="mt-1 text-xs text-plum-800">
                {selectedTrainerSlots[0]
                  ? formatSlotDateTime(
                      selectedTrainerSlots[0].startsAtIso,
                      selectedTrainerSlots[0].endsAtIso,
                    ).timeLabel
                  : portalCopy.schedule.availableSlotsEmpty}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-none border-x-0 border-y border-white/75 bg-white/95 p-0 shadow-none backdrop-blur sm:rounded-[2.25rem] sm:border sm:p-5 sm:shadow-[0_26px_90px_rgba(53,18,41,0.09)] lg:rounded-[2.75rem]">
        <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-[1.7rem] sm:border sm:border-plum-100/70 sm:bg-[#fffdfb] sm:p-4">
          <div className="flex items-center px-3 pt-3 pb-1 sm:hidden">
            <p className="text-sm font-semibold text-plum-900">
              {formatWeekRange(shownDate)}
            </p>
          </div>

          <div
            className="khula-member-calendar khula-mobile-shell max-sm:[zoom:0.72]"
            onClickCapture={handleSchedulerInteractionCapture}
          >
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
        .khula-member-calendar .bg-accent.absolute {
          display: none !important;
        }

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
          <div className="mt-5 space-y-4 xl:max-h-[630px] xl:overflow-y-auto xl:pr-1">
            {groupedTrainerSlots.length === 0 ? (
              <p className="rounded-[1.5rem] border border-warmgray-200 bg-white px-5 py-4 text-sm leading-7 text-plum-800">
                {portalCopy.schedule.availableSlotsEmpty}
              </p>
            ) : (
              groupedTrainerSlots.map((group) => (
                <div
                  key={group.key}
                  className="rounded-[1.35rem] border border-warmgray-200 bg-white p-4 shadow-[0_12px_40px_rgba(74,44,74,0.05)]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700">
                        {portalCopy.schedule.bookForDayLabel}
                      </p>
                      <p className="mt-1.5 text-base font-semibold text-plum-900">
                        {group.dayLabel}
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-warmgray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-plum-700">
                      {group.slots.length} slots
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2.5">
                    {group.slots.map((slot) => {
                      const { timeLabel } = formatSlotDateTime(
                        slot.startsAtIso,
                        slot.endsAtIso,
                      );

                      return (
                        <form
                          key={slot.id}
                          action={bookTrainingSessionAction}
                          className="rounded-[1.1rem] border border-warmgray-200/90 bg-[#fffaf8] p-3"
                        >
                          <input type="hidden" name="availabilitySlotId" value={slot.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <div className="flex flex-col gap-3 min-[540px]:flex-row min-[540px]:items-center min-[540px]:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-plum-900 sm:text-[15px]">
                                {timeLabel}
                              </p>
                            </div>
                            <div className="min-[540px]:w-[155px]">
                              <ScheduleActionButton variant="primary">
                                {portalCopy.schedule.bookCta}
                              </ScheduleActionButton>
                            </div>
                          </div>
                        </form>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-5 shadow-[0_24px_72px_rgba(74,44,74,0.07)] sm:p-6 xl:h-[720px] xl:overflow-hidden">
          <h2 className="text-2xl font-semibold text-plum-900">
            {portalCopy.schedule.mySessionsTitle}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-warmgray-200 bg-white px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-plum-700">
                {portalCopy.schedule.sessionSummaryUpcoming}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-plum-900">
                {upcomingSessions.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-warmgray-200 bg-white px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-plum-700">
                {portalCopy.schedule.sessionSummaryHistory}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-plum-900">
                {historySessions.length}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-6 xl:max-h-[535px] xl:overflow-y-auto xl:pr-1">
            <div>
              <h3 className="text-lg font-semibold text-plum-900">
                {portalCopy.schedule.upcomingSessionsTitle}
              </h3>
              <div className="mt-4 space-y-4">
                {upcomingSessions.length === 0 ? (
                  <p className="rounded-[1.5rem] border border-warmgray-200 bg-white px-5 py-4 text-sm leading-7 text-plum-800">
                    {portalCopy.schedule.upcomingSessionsEmpty}
                  </p>
                ) : (
                  upcomingSessions.map((session) => {
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
                          <span className="rounded-full bg-rose-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-plum-900">
                            {getSessionStatusLabel(session.status)}
                          </span>
                        </div>
                        {session.memberNotes && (
                          <p className="mt-4 text-sm leading-7 text-plum-800">
                            {session.memberNotes}
                          </p>
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
            <div>
              <h3 className="text-lg font-semibold text-plum-900">
                {portalCopy.schedule.pastSessionsTitle}
              </h3>
              <div className="mt-4 space-y-4">
                {historySessions.length === 0 ? (
                  <p className="rounded-[1.5rem] border border-warmgray-200 bg-white px-5 py-4 text-sm leading-7 text-plum-800">
                    {portalCopy.schedule.pastSessionsEmpty}
                  </p>
                ) : (
                  historySessions.map((session) => {
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
                          <span className="rounded-full bg-warmgray-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-plum-700">
                            {getSessionStatusLabel(session.status)}
                          </span>
                        </div>
                        {session.memberNotes && (
                          <p className="mt-4 text-sm leading-7 text-plum-800">
                            {session.memberNotes}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-warmgray-200/80 bg-white/88 p-4 shadow-[0_20px_64px_rgba(74,44,74,0.06)] xl:h-[720px]">
          <div className="mb-3 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
              {portalCopy.schedule.calendarViewerLabel}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-plum-900">
              {portalCopy.schedule.calendarViewerTitle}
            </h2>
            <p className="mt-2 text-xs leading-5 text-plum-700">
              {portalCopy.schedule.calendarViewerHint}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-950">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                Available slot
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-950">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Your booking
              </span>
            </div>
          </div>
          <div className="rounded-none border-0 bg-transparent p-0 pb-10 sm:rounded-[1.5rem] sm:border sm:border-plum-100/70 sm:bg-[#fffdfb] sm:p-3 sm:pb-12 xl:h-[610px] xl:overflow-auto">
            <div className="flex items-center px-3 pt-3 pb-1 sm:hidden">
              <p className="text-sm font-semibold text-plum-900">
                {formatWeekRange(shownDate)}
              </p>
            </div>

            <div
              className="khula-member-calendar khula-mobile-shell max-sm:[zoom:0.72] xl:[zoom:0.54] 2xl:[zoom:0.62]"
              onClickCapture={handleSchedulerInteractionCapture}
            >
              <SchedulerProvider initialState={scheduleEvents} weekStartsOn="monday">
                <KhulaScheduler
                  key={isMobileCalendar ? 'mobile-week-calendar' : 'desktop-full-calendar'}
                  views={calendarViews}
                  classNames={{
                    tabs: { tabList: isMobileCalendar ? '!hidden' : undefined },
                    buttons: { addEvent: 'hidden' },
                  }}
                  CustomComponents={{
                    CustomEventComponent: (event) => (
                      <button
                        type="button"
                        className={`khula-calendar-event-card flex w-full flex-col rounded-md border px-1.5 py-1 text-left text-[10px] leading-tight ${calendarEventTone(event)}`}
                        title={`${event.title} - ${formatCalendarEventWindow(event)}`}
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          setSelectedCalendarEvent(event);
                        }}
                      >
                        <span className="truncate font-semibold">{event.title}</span>
                        <span className="mt-0.5 truncate opacity-80">
                          {event.startDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </button>
                    ),
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
            <div className="h-10" aria-hidden="true" />
          </div>
        </div>
      </section>

      {selectedCalendarEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum-950/30 px-4 backdrop-blur-sm"
          onClick={() => setSelectedCalendarEvent(null)}
        >
          <div
            className="w-full max-w-md rounded-[1.75rem] border border-warmgray-200 bg-[#fffaf8] p-6 shadow-[0_28px_90px_rgba(74,44,74,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
              Training session
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-plum-900">
              {selectedCalendarEvent.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-plum-800">
              {formatCalendarEventWindow(selectedCalendarEvent)}
            </p>
            {selectedCalendarEvent.description && (
              <p className="mt-3 rounded-[1rem] bg-white px-4 py-3 text-sm leading-6 text-plum-800">
                {selectedCalendarEvent.description}
              </p>
            )}
            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-warmgray-300 bg-white px-4 py-2.5 text-sm font-semibold text-plum-900 transition hover:border-rose-300"
              onClick={() => setSelectedCalendarEvent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .khula-member-calendar .bg-accent.absolute {
          display: none !important;
        }

        .khula-member-calendar .absolute.inset-0 {
          display: none !important;
        }

        .khula-member-calendar button.absolute {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
