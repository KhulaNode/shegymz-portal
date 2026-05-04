'use client';

import {
  KhulaScheduler,
  SchedulerProvider,
  type Event,
} from '@khulanode/khula-scheduler';

const initialEvents: Event[] = [
  {
    id: 'khula-welcome-1',
    title: 'SheGymZ Assessment Session',
    description: 'A first assessment slot reserved for new members.',
    startDate: new Date(new Date().setHours(8, 0, 0, 0)),
    endDate: new Date(new Date().setHours(9, 0, 0, 0)),
    variant: 'primary',
  },
  {
    id: 'khula-strength-1',
    title: 'Strength Floor Booking',
    description: 'A guided floor session with space for trainer follow-up.',
    startDate: new Date(new Date().setHours(11, 30, 0, 0)),
    endDate: new Date(new Date().setHours(12, 30, 0, 0)),
    variant: 'success',
  },
  {
    id: 'khula-recovery-1',
    title: 'Recovery Room Session',
    description: 'A lighter recovery block for members after a hard training day.',
    startDate: new Date(new Date().setHours(17, 0, 0, 0)),
    endDate: new Date(new Date().setHours(18, 0, 0, 0)),
    variant: 'warning',
  },
];

export function KhulaSchedulerShell() {
  return (
    <div className="rounded-[32px] border border-plum-100 bg-white p-4 shadow-sm sm:p-6">
      <SchedulerProvider initialState={initialEvents} weekStartsOn="monday">
        <KhulaScheduler />
      </SchedulerProvider>
    </div>
  );
}
