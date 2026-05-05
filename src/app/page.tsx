import Link from 'next/link';

const portalHighlights = [
  'Paid-member email is the access anchor from signup through protected access.',
  'OTP verification happens before any first-time account creation is allowed.',
  'Returning members can come back with Google or password without repeating onboarding.',
  'Schedule access stays behind both authentication and active membership checks.',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,223,241,0.55),_transparent_42%),linear-gradient(180deg,#fcfaf8_0%,#f5f1ec_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
          <section className="rounded-[2rem] border border-plum-100/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(53,18,41,0.08)] backdrop-blur sm:p-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
              SheGymZ Portal
            </p>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-plum-900 sm:text-6xl">
              Member onboarding, access control, and schedule entry now live in one place.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-plum-800 sm:text-xl">
              This portal now carries the handoff from SheGymZ payment into verified signup,
              returning login, and protected schedule access. The public site sells the
              membership. The portal opens the member experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-plum-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-plum-800"
              >
                Start first-time signup
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-plum-200 bg-white px-6 py-3 text-sm font-semibold text-plum-900 transition hover:border-plum-400"
              >
                Returning member login
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {portalHighlights.map((item) => (
                <div key={item} className="rounded-3xl border border-plum-100 bg-sand/75 px-5 py-5">
                  <p className="text-sm leading-7 text-plum-800">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-plum-900 p-8 text-white shadow-[0_24px_80px_rgba(53,18,41,0.18)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">
              Live Entry Points
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              The first-run path is now clearer and the protected surface has a named destination.
            </h2>
            <div className="mt-8 space-y-3 text-sm">
              <Link
                href="/signup"
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <span>First-time signup</span>
                <span className="font-semibold text-white/70">/signup</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <span>Returning login</span>
                <span className="font-semibold text-white/70">/login</span>
              </Link>
              <Link
                href="/portal"
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <span>Member home</span>
                <span className="font-semibold text-white/70">/portal</span>
              </Link>
              <Link
                href="/schedule"
                className="flex items-center justify-between rounded-2xl bg-white/20 px-4 py-4 transition hover:bg-white/25"
              >
                <span>Protected schedule</span>
                <span className="font-semibold text-white">/schedule</span>
              </Link>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/8 p-5">
              <p className="text-sm leading-7 text-white/78">
                Unpaid users do not clear signup. Logged-out users do not clear protected routes.
                Authenticated members land in the portal and move into schedule from there.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
