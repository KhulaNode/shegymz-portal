export default function PortalPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl rounded-3xl border border-plum-100 bg-sand p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-plum-700">
          Protected Shell
        </p>
        <h1 className="mb-4 text-4xl font-bold text-plum-900">Portal shell scaffolded</h1>
        <p className="text-lg leading-8 text-plum-800">
          Milestone 4 will put session and entitlement checks in front of this route and
          expose the minimum client portal experience.
        </p>
      </div>
    </main>
  );
}
