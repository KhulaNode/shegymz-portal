import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { LogoutButton } from '@/components/logout-button';
import Link from 'next/link';
import Image from 'next/image';
import { requireProtectedMember } from '@/lib/protected-member';
import { PortalBrandHeader } from '@/components/portal-brand-header';

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  const member = await requireProtectedMember();

  return (
    <main className="min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <PortalBrandHeader accent="Protected Member Home" />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2.5rem] border border-plum-100/80 bg-white/92 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              Member Home
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-plum-900 sm:text-5xl">
              Welcome to your SheGymZ home.
            </h1>
            <div className="mt-5 space-y-4 text-base leading-8 text-plum-800 sm:text-lg">
              <p>
                Signed in as <span className="font-semibold text-plum-900">{session?.user?.email}</span>.
              </p>
              <p>
                Your schedule, your rhythm, your progress. Everything should feel close, personal,
                and easy to return to.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/schedule"
                className="rounded-full bg-rose-300 px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-rose-200"
              >
                Go to my schedule
              </Link>
              <LogoutButton />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_24px_80px_rgba(53,18,41,0.12)]">
            <Image
              src="/images/IMG_3757.jpeg"
              alt="SheGymZ member area"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/72 via-plum-900/24 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/68">
                Women-First Wellness
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                A private place to feel stronger, softer, and more at ease in your body.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.9rem] border border-plum-100 bg-white/92 p-6 shadow-[0_16px_48px_rgba(53,18,41,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              Next
            </p>
            <p className="mt-4 text-base leading-8 text-plum-800">
              Step into your schedule and keep moving with intention.
            </p>
          </div>

          <div className="rounded-[1.9rem] border border-plum-100 bg-[#faf7f4] p-6 shadow-[0_16px_48px_rgba(53,18,41,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              Journey
            </p>
            <p className="mt-4 text-base leading-8 text-plum-800">
              Over time, this space should feel like a natural extension of your SheGymZ journey.
            </p>
          </div>

          <div className="rounded-[1.9rem] bg-plum-900 p-6 text-white shadow-[0_20px_70px_rgba(53,18,41,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              Identity
            </p>
            <p className="mt-4 text-base leading-8 text-white/82">
              Your access remains personal, trusted, and closely tied to your membership.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
