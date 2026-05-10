import Image from 'next/image';
import Link from 'next/link';
import { requireProtectedMember } from '@/lib/protected-member';
import { KhulaSchedulerShell } from '@/components/khula-scheduler-shell';
import { LogoutButton } from '@/components/logout-button';
import { portalCopy } from '@/content/portal-copy';
import { getMemberScheduleSnapshot } from '@/lib/member-sessions';

type SchedulePageProps = {
  searchParams?: Promise<{
    trainer?: string;
    notice?: string;
    error?: string;
  }>;
};

function resolveFeedbackBanner(notice?: string, error?: string) {
  if (notice === 'booking-confirmed') {
    return {
      tone: 'success' as const,
      message: portalCopy.schedule.noticeBookingConfirmed,
    };
  }

  if (notice === 'session-cancelled') {
    return {
      tone: 'success' as const,
      message: portalCopy.schedule.noticeSessionCancelled,
    };
  }

  switch (error) {
    case 'slot-unavailable':
      return { tone: 'error' as const, message: portalCopy.schedule.errorSlotUnavailable };
    case 'slot-started':
      return { tone: 'error' as const, message: portalCopy.schedule.errorSlotStarted };
    case 'booking-conflict':
      return { tone: 'error' as const, message: portalCopy.schedule.errorBookingConflict };
    case 'cancel-window-closed':
      return { tone: 'error' as const, message: portalCopy.schedule.errorCancelWindowClosed };
    case 'cancel-not-allowed':
      return { tone: 'error' as const, message: portalCopy.schedule.errorCancelNotAllowed };
    case 'booking-failed':
      return { tone: 'error' as const, message: portalCopy.schedule.errorBookingFailed };
    case 'cancel-failed':
      return { tone: 'error' as const, message: portalCopy.schedule.errorCancelFailed };
    default:
      return null;
  }
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const member = await requireProtectedMember();
  const params = (await searchParams) ?? {};
  const scheduleSnapshot = await getMemberScheduleSnapshot(member.id);

  const selectedTrainerId =
    params.trainer &&
    scheduleSnapshot.trainers.some((trainer) => trainer.id === params.trainer)
      ? params.trainer
      : scheduleSnapshot.trainers[0]?.id ?? null;

  const feedbackBanner = resolveFeedbackBanner(params.notice, params.error);

  return (
    <main className="portal-shell min-h-screen px-5 py-6 sm:px-8 lg:px-10">

      {/* ── Signed-in header ─────────────────────────────── */}
      <header className="mb-5 sm:mb-8">
        <div className="mx-auto flex max-w-[1600px] flex-row items-center justify-between gap-3 rounded-[1.5rem] sm:rounded-[2rem] border border-warmgray-200/80 bg-[#fffaf8]/96 px-4 py-3 shadow-[0_18px_60px_rgba(74,44,74,0.08)] sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="SheGymZ"
              width={132}
              height={52}
              className="h-9 w-auto object-contain sm:h-10"
              priority
            />
            <span className="hidden truncate text-sm font-medium text-plum-900/90 sm:block">
              {portalCopy.schedule.eyebrow}
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] space-y-5">
        {feedbackBanner && (
          <section
            className={
              feedbackBanner.tone === 'success'
                ? 'rounded-[1.75rem] border border-emerald-200 bg-emerald-50/90 px-5 py-4 text-sm font-medium text-emerald-900 shadow-[0_16px_44px_rgba(22,101,52,0.08)]'
                : 'rounded-[1.75rem] border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm font-medium text-plum-900 shadow-[0_16px_44px_rgba(127,29,29,0.08)]'
            }
          >
            {feedbackBanner.message}
          </section>
        )}
        <section className="rounded-[2rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-5 shadow-[0_20px_70px_rgba(74,44,74,0.07)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-plum-700">
                {portalCopy.schedule.eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-plum-900 sm:text-4xl">
                {portalCopy.schedule.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-plum-800 sm:text-base">
                {portalCopy.schedule.subtitle}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Link
                href="/portal"
                className="inline-flex justify-center rounded-full border border-warmgray-300 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-rose-300"
              >
                {portalCopy.schedule.backCta}
              </Link>
            </div>
          </div>
        </section>
        <div className="-mx-5 sm:mx-0">
          <KhulaSchedulerShell
            trainers={scheduleSnapshot.trainers}
            availableSlots={scheduleSnapshot.availableSlots}
            sessions={scheduleSnapshot.sessions}
            initialTrainerId={selectedTrainerId}
          />
        </div>
      </div>
    </main>
  );
}
