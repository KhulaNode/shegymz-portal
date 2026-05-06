'use client';

import { useState } from 'react';
import {
  KhulaScheduler,
  SchedulerProvider,
  type Event,
} from '@khulanode/khula-scheduler';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Mirrors the scheduler's own getWeekNumber + getDaysInWeek(week, year) logic
 * so the banner date range always matches what the scheduler displays.
 *
 * getWeekNumber: ISO Thursday-anchor algorithm.
 * getDaysInWeek: reconstructs week start from Jan 1 using (weekNo-1)*7 + offset.
 */
function schedulerWeekStart(date: Date): Date {
  // --- mirror getWeekNumber ---
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  // --- mirror getDaysInWeek (weekStartsOn="monday" → startDay=1) ---
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

const initialEvents: Event[] = [
  {
    id: 'khula-welcome-1',
    title: 'SheGymZ Welcome Session',
    description: 'A gentle first session reserved for new members.',
    startDate: new Date(new Date().setHours(8, 0, 0, 0)),
    endDate: new Date(new Date().setHours(9, 0, 0, 0)),
    variant: 'primary',
  },
  {
    id: 'khula-strength-1',
    title: 'Strength Floor Booking',
    description: 'A focused floor session with room for trainer support.',
    startDate: new Date(new Date().setHours(11, 30, 0, 0)),
    endDate: new Date(new Date().setHours(12, 30, 0, 0)),
    variant: 'success',
  },
  {
    id: 'khula-recovery-1',
    title: 'Recovery Room Session',
    description: 'A restorative block for members after a full training day.',
    startDate: new Date(new Date().setHours(17, 0, 0, 0)),
    endDate: new Date(new Date().setHours(18, 0, 0, 0)),
    variant: 'warning',
  },
];

const navBtnClass =
  'inline-flex items-center gap-1 rounded-full border border-[rgb(var(--scheduler-border))] bg-white px-3 py-1.5 text-xs font-semibold text-[rgb(var(--scheduler-foreground))] transition hover:bg-[rgb(var(--scheduler-muted))]';

export function KhulaSchedulerShell() {
  const [shownDate, setShownDate] = useState(new Date());

  return (
    <div className="overflow-hidden rounded-none border-x-0 border-y border-white/75 bg-white/95 p-0 shadow-none backdrop-blur sm:rounded-[2.25rem] sm:border sm:p-5 sm:shadow-[0_26px_90px_rgba(53,18,41,0.09)] lg:rounded-[2.75rem]">
      <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-[1.7rem] sm:border sm:border-plum-100/70 sm:bg-[#fffdfb] sm:p-4">
        {/* Week range banner — mobile only */}
        <div className="flex items-center px-3 pt-3 pb-1 sm:hidden">
          <p className="text-sm font-semibold text-plum-900">
            {formatWeekRange(shownDate)}
          </p>
        </div>

        {/* Zoom wrapper — shrinks the week grid on mobile so all 7 days fit */}
        <div className="khula-mobile-shell max-sm:[zoom:0.72]">
          <SchedulerProvider initialState={initialEvents} weekStartsOn="monday">
            <KhulaScheduler
              views={{ views: ['week', 'day', 'month'], mobileViews: ['week'] }}
              classNames={{ tabs: { tabList: 'max-sm:!hidden' } }}
              CustomComponents={{
                customButtons: {
                  CustomPrevButton: (
                    <button
                      type="button"
                      onClick={() => setShownDate(d => new Date(+d - WEEK_MS))}
                      className={navBtnClass}
                    >
                      ← Prev
                    </button>
                  ),
                  CustomNextButton: (
                    <button
                      type="button"
                      onClick={() => setShownDate(d => new Date(+d + WEEK_MS))}
                      className={navBtnClass}
                    >
                      Next →
                    </button>
                  ),
                },
              }}
            />
          </SchedulerProvider>
        </div>
      </div>
    </div>
  );
}
