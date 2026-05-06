'use client';

import {
  KhulaScheduler,
  SchedulerProvider,
  type Event,
} from '@khulanode/khula-scheduler';

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

export function KhulaSchedulerShell() {
  return (
    <div className="overflow-hidden rounded-[2.25rem] border border-white/75 bg-white/95 p-3 shadow-[0_26px_90px_rgba(53,18,41,0.09)] backdrop-blur sm:p-5 lg:rounded-[2.75rem]">
      <div className="rounded-[1.7rem] border border-plum-100/70 bg-[#fffdfb] p-2 sm:p-4">
        <SchedulerProvider initialState={initialEvents} weekStartsOn="monday">
          <KhulaScheduler />
        </SchedulerProvider>
      </div>
    </div>
  );
}
