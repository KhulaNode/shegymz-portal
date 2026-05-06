import Image from 'next/image';
import Link from 'next/link';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

const memberPromises = [
  {
    label: 'Access',
    body: 'Get through signup once, then come back easily whenever you need the portal.',
    className: 'border-plum-100 bg-plum-50/90',
  },
  {
    label: 'Schedule',
    body: 'Book time, organise your training rhythm, and keep moving.',
    className: 'border-rose-200 bg-rose-50/90',
  },
  {
    label: 'Journey',
    body: 'Build a fitness routine that feels supported, not administratively blocked.',
    className: 'border-warmgray-200 bg-[#fff2ef]',
  },
] as const;

export default function HomePage() {
  return (
    <main className="portal-shell min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader />
      <div className="mx-auto max-w-6xl pb-12">
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-warmgray-200/80 bg-[#fffaf8]/96 p-7 shadow-[0_28px_90px_rgba(74,44,74,0.08)] sm:p-10 lg:p-12">
            <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-rose-200/40 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.32em] text-plum-700">
              {portalCopy.landing.featureEyebrow}
            </p>
            <h1 className="relative mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-plum-900 sm:text-6xl">
              {portalCopy.landing.title}
            </h1>
            <p className="relative mt-6 max-w-2xl text-lg leading-8 text-plum-800">
              {portalCopy.landing.subtitle}
            </p>

            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex justify-center rounded-full bg-plum-900 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(74,44,74,0.16)] transition hover:bg-plum-800"
              >
                {portalCopy.landing.primaryCta}
              </Link>
              <Link
                href="/signup"
                className="inline-flex justify-center rounded-full border border-warmgray-300 bg-white px-7 py-3.5 text-sm font-semibold text-plum-900 transition hover:border-rose-300 hover:bg-rose-50"
              >
                {portalCopy.landing.secondaryCta}
              </Link>
            </div>

            <p className="relative mt-5 max-w-xl text-sm leading-7 text-warmgray-600">
              {portalCopy.landing.helper}
            </p>

            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              {memberPromises.map((promise) => (
                <div
                  key={promise.label}
                  className={`rounded-[1.7rem] border px-5 py-5 shadow-[0_12px_36px_rgba(74,44,74,0.05)] ${promise.className}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-plum-700">
                    {promise.label}
                  </p>
                  <p className="mt-4 text-sm leading-8 text-plum-800">{promise.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="relative min-h-[380px] overflow-hidden rounded-[2.5rem] shadow-[0_28px_90px_rgba(53,18,41,0.14)] sm:min-h-[520px]">
              <Image
                src="/images/showcase1.jpeg"
                alt="SheGymZ private training space"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/80 via-plum-900/28 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                  {portalCopy.landing.featureLabel}
                </p>
                <p className="mt-3 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">
                  {portalCopy.landing.featureTitle}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-plum-900/10 bg-plum-900 p-6 text-white shadow-[0_22px_70px_rgba(74,44,74,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/62">
                Already a member?
              </p>
              <p className="mt-3 text-sm leading-7 text-white/82">
                Use the same email you joined with so your membership can be recognised gently and securely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
