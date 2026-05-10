'use client';

import { useState } from 'react';

type ScheduleFeedbackOverlayProps = {
  tone: 'success' | 'error';
  message: string;
};

export function ScheduleFeedbackOverlay({ tone, message }: ScheduleFeedbackOverlayProps) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  const isSuccess = tone === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum-950/28 px-5 backdrop-blur-sm">
      <div
        role="alert"
        className={
          isSuccess
            ? 'w-full max-w-md rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 shadow-[0_28px_90px_rgba(22,101,52,0.22)]'
            : 'w-full max-w-md rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-plum-950 shadow-[0_28px_90px_rgba(127,29,29,0.22)]'
        }
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em]">
          {isSuccess ? 'Booking update' : 'Booking issue'}
        </p>
        <p className="mt-3 text-base font-semibold leading-7">{message}</p>
        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-warmgray-300 bg-white px-4 py-2.5 text-sm font-semibold text-plum-900 transition hover:border-rose-300"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
