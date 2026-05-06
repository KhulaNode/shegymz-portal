import Image from 'next/image';
import Link from 'next/link';
import { PortalBrandHeader } from '@/components/portal-brand-header';
import { portalCopy } from '@/content/portal-copy';

const memberPromises = [
  'A calm place to return to your sessions and bookings.',
  'Member-only access shaped around privacy and trust.',
  'Your SheGymZ rhythm, held in one soft and simple space.',
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <PortalBrandHeader />
      <div className="mx-auto max-w-6xl pb-12">
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/75 bg-white/88 p-7 shadow-[0_28px_90px_rgba(53,18,41,0.09)] backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-rose-200/45 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.32em] text-plum-700">
              Private women&apos;s wellness club
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
                className="inline-flex justify-center rounded-full bg-plum-900 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(53,18,41,0.18)] transition hover:bg-plum-800"
              >
                {portalCopy.landing.primaryCta}
              </Link>
              <Link
                href="/signup"
                className="inline-flex justify-center rounded-full border border-plum-200 bg-white/85 px-7 py-3.5 text-sm font-semibold text-plum-900 transition hover:border-plum-400 hover:bg-plum-50"
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
                  key={promise}
                  className="rounded-[1.7rem] border border-plum-100/80 bg-[#faf7f4]/85 px-5 py-5 shadow-[0_12px_36px_rgba(53,18,41,0.04)]"
                >
                  <p className="text-sm leading-7 text-plum-800">{promise}</p>
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
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/74 via-plum-900/22 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                  Safe. Soft. Strong.
                </p>
                <p className="mt-3 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">
                  A private member space for the work you are doing for yourself.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/75 bg-plum-900 p-6 text-white shadow-[0_22px_70px_rgba(53,18,41,0.13)]">
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
