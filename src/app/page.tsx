import Image from 'next/image';
import Link from 'next/link';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

const memberPromises = [
  {
    label: 'Access',
    body: 'Get through signup once, then come back easily whenever you need the portal.',
    className: 'border-plum-100 bg-plum-50/90',
    accent: 'text-plum-700',
    glyph: '✦',
    spanClass: '',
  },
  {
    label: 'Schedule',
    body: 'Book time, organise your training rhythm, and keep moving.',
    className: 'border-rose-200 bg-rose-50/90',
    accent: 'text-[#b5406a]',
    glyph: '◆',
    spanClass: '',
  },
  {
    label: 'Journey',
    body: 'Build a fitness routine that feels supported, not administratively blocked.',
    className: 'border-warmgray-200 bg-[#fff2ef]',
    accent: 'text-plum-800',
    glyph: '✿',
    spanClass: 'col-span-2 sm:col-span-1',
  },
] as const;

export default function HomePage() {
  return (
    <main className="portal-shell min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader />
      <div className="mx-auto max-w-6xl pb-10 sm:pb-12">
        <section className="grid items-stretch gap-5 sm:gap-6 lg:grid-cols-[1.08fr_0.92fr]">

          {/* ── Hero card ────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-rose-200/70 bg-[#fffaf8]/97 p-5 shadow-[0_32px_100px_rgba(74,44,74,0.13),0_0_0_1px_rgba(232,181,195,0.25)] sm:p-10 lg:p-12">

            {/* Layered ambient orbs */}
            <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-64 w-64 rounded-full bg-rose-200/55 blur-[80px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 h-72 w-72 rounded-full bg-plum-100/45 blur-[90px]" />
            <div aria-hidden className="pointer-events-none absolute left-1/3 top-8 h-32 w-32 rounded-full bg-[#f5c6d4]/40 blur-[50px]" />

            {/* Scattered sparkles */}
            <span aria-hidden className="pointer-events-none absolute right-14 top-10 select-none text-xl text-rose-300/70">✦</span>
            <span aria-hidden className="pointer-events-none absolute right-28 top-28 select-none text-xs text-plum-700/25">✦</span>
            <span aria-hidden className="pointer-events-none absolute bottom-32 left-8 select-none text-sm text-rose-400/35">◆</span>
            <span aria-hidden className="pointer-events-none absolute bottom-20 right-10 select-none text-xs text-plum-100/60">✿</span>

            <p className="relative text-xs font-semibold uppercase tracking-[0.32em] text-plum-700">
              {portalCopy.landing.featureEyebrow}
            </p>

            <h1 className="relative mt-4 max-w-3xl text-[1.85rem] font-semibold leading-tight tracking-tight text-plum-900 sm:mt-5 sm:text-4xl lg:text-6xl">
              Welcome to your{' '}
              <span className="bg-gradient-to-br from-plum-900 via-[#9b3a72] to-[#c45c80] bg-clip-text text-transparent">
                private SheGymZ space
              </span>
            </h1>

            <p className="relative mt-4 max-w-2xl text-base leading-7 text-plum-800 sm:mt-6 sm:text-lg sm:leading-8">
              {portalCopy.landing.subtitle}
            </p>

            <div className="relative mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex justify-center rounded-full bg-gradient-to-r from-plum-900 via-[#7d2d6c] to-[#b5406a] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(74,44,74,0.28),0_4px_18px_rgba(181,64,106,0.25)] transition hover:scale-[1.025] hover:shadow-[0_18px_52px_rgba(74,44,74,0.34),0_6px_22px_rgba(181,64,106,0.32)] active:scale-100"
              >
                {portalCopy.landing.primaryCta}
              </Link>
              <Link
                href="/signup"
                className="inline-flex justify-center rounded-full border border-rose-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-plum-900 backdrop-blur-sm transition hover:border-rose-300 hover:bg-rose-50 hover:shadow-[0_8px_28px_rgba(232,181,195,0.35)]"
              >
                {portalCopy.landing.secondaryCta}
              </Link>
            </div>

            <p className="relative mt-4 max-w-xl text-sm leading-6 text-warmgray-600 sm:mt-5 sm:leading-7">
              {portalCopy.landing.helper}
            </p>

            <div className="relative mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
              {memberPromises.map((promise) => (
                <div
                  key={promise.label}
                  className={`rounded-[1.4rem] sm:rounded-[1.7rem] border px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4 shadow-[0_12px_36px_rgba(74,44,74,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(74,44,74,0.10)] ${promise.className} ${promise.spanClass}`}
                >
                  <span aria-hidden className={`mb-1 block text-base ${promise.accent}`}>{promise.glyph}</span>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-plum-700">
                    {promise.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-plum-800 sm:mt-4 sm:leading-8">{promise.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────── */}
          <div className="grid gap-5">

            {/* Showcase image */}
            <div className="relative min-h-[200px] overflow-hidden rounded-[2rem] shadow-[0_28px_80px_rgba(53,18,41,0.16)] sm:min-h-[360px] sm:rounded-[2.5rem] sm:shadow-[0_36px_110px_rgba(53,18,41,0.20)] lg:min-h-[520px]">
              <Image
                src="/images/showcase1.jpeg"
                alt="SheGymZ private training space"
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                priority
              />
              {/* Rich layered overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/92 via-[#7d2d6c]/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-plum-900/18" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-9">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/65">
                  <span className="text-rose-300">✦</span>
                  {portalCopy.landing.featureLabel}
                </p>
                <p className="mt-2 max-w-md text-lg font-semibold leading-tight sm:mt-3 sm:text-3xl">
                  {portalCopy.landing.featureTitle}
                </p>
              </div>
            </div>

            {/* Member CTA card */}
            <div className="relative overflow-hidden rounded-[2rem] border border-plum-900/10 bg-plum-900 p-6 text-white shadow-[0_24px_80px_rgba(74,44,74,0.24)]">
              {/* Decorative orbs inside dark card */}
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#9b3a72]/40 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-rose-400/18 blur-2xl" />

              <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                Already a member?
              </p>
              <p className="relative mt-3 text-sm leading-7 text-white/78">
                Use the same email you subscribed with so your membership can be recognised gently and securely.
              </p>
              <Link
                href="/login"
                className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-rose-300 transition hover:text-rose-200"
              >
                Sign in now <span aria-hidden>→</span>
              </Link>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
