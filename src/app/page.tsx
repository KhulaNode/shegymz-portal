import Link from 'next/link';

const milestones = [
  'Membership validation against Paystack by email',
  'OTP-gated first-time signup before account creation',
  'Google and email/password signup after eligibility passes',
  'Protected Mina access for subscribed members only',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sand via-white to-plum-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
            SheGymZ Portal
          </p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-plum-900">
            Phase 1 portal foundation is now separated from the public website.
          </h1>
          <p className="mb-8 text-lg leading-8 text-plum-800">
            This app will own member signup, authentication, Paystack entitlement checks,
            and protected Mina access. The public website now stops at payment and portal
            handoff.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-plum-100 bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-plum-900">Milestone 1 scope</h2>
            <ul className="space-y-3 text-plum-800">
              {milestones.map((item) => (
                <li key={item} className="rounded-2xl bg-sand px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl bg-plum-900 p-8 text-white shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Entry routes</h2>
            <div className="space-y-3 text-sm text-white/85">
              <Link href="/signup" className="block rounded-2xl bg-white/10 px-4 py-3">
                `/signup`
              </Link>
              <Link href="/login" className="block rounded-2xl bg-white/10 px-4 py-3">
                `/login`
              </Link>
              <Link href="/portal" className="block rounded-2xl bg-white/10 px-4 py-3">
                `/portal`
              </Link>
              <Link href="/mina" className="block rounded-2xl bg-white/10 px-4 py-3">
                `/mina`
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
