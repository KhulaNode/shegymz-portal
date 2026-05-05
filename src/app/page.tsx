import Image from 'next/image';
import Link from 'next/link';
import { PortalBrandHeader } from '@/components/portal-brand-header';

const portalHighlights = [
  'For women who value privacy, calm, and care.',
  'A more personal path into training, scheduling, and progress.',
  'Simple to enter. Beautiful to return to.',
  'Made to feel selective, safe, and quietly premium.',
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <PortalBrandHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.5rem] border border-plum-100/80 bg-white/88 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-plum-700">
              Member Portal
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-plum-900 sm:text-6xl">
              A private wellness space, now yours.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-plum-800">
              SheGymZ was built for women who want to train, recover, and return to themselves in
              peace. The portal is simply your quiet way in.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-rose-300 px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-rose-200"
              >
                Activate my access
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-plum-200 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-plum-400"
              >
                I already belong here
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {portalHighlights.map((item) => (
                <div key={item} className="rounded-[1.75rem] border border-plum-100 bg-[#faf7f4] px-5 py-5">
                  <p className="text-sm leading-7 text-plum-800">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-plum-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
                  Access
                </p>
                <p className="mt-2 text-sm leading-7 text-plum-800">
                  Get through signup once, then come back easily whenever you need the portal.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-rose-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
                  Schedule
                </p>
                <p className="mt-2 text-sm leading-7 text-plum-800">
                  Book time, organise your training rhythm, and keep moving.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#f8f0eb] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
                  Journey
                </p>
                <p className="mt-2 text-sm leading-7 text-plum-800">
                  Build a fitness routine that feels supported, not administratively blocked.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="relative min-h-[360px] overflow-hidden rounded-[2.5rem] shadow-[0_24px_80px_rgba(53,18,41,0.12)]">
              <Image
                src="/images/showcase1.jpeg"
                alt="SheGymZ training session"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 via-plum-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                  Her Physique. Her Power.
                </p>
                <p className="mt-3 max-w-md text-2xl font-semibold leading-tight">
                  A private place to train, recover, and keep becoming.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_1.1fr]">
              <div className="relative min-h-[220px] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/showcase2.jpeg"
                  alt="SheGymZ exterior"
                  fill
                  className="object-cover"
                />
              </div>

              <section className="rounded-[2rem] border border-plum-100/80 bg-white/92 p-7 shadow-[0_20px_70px_rgba(53,18,41,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-plum-700">
                  Start Here
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight text-plum-900">
                  Your SheGymZ access begins here.
                </h2>
                <div className="mt-5 space-y-4 text-sm leading-7 text-plum-800">
                  <p>
                    New here? Activate your access. Already set up? Sign in and continue where you
                    left off.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/signup"
                      className="rounded-full bg-plum-900 px-5 py-3 font-semibold text-white transition hover:bg-plum-800"
                    >
                      Activate access
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-full border border-plum-200 bg-[#faf7f4] px-5 py-3 font-semibold text-plum-900 transition hover:border-plum-400"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
