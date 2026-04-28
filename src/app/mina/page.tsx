export default function MinaPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl rounded-3xl border border-plum-100 bg-plum-900 p-8 text-white shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          Mina Inside The Portal
        </p>
        <h1 className="mb-4 text-4xl font-bold">Protected Mina surface scaffolded</h1>
        <p className="text-lg leading-8 text-white/85">
          This route exists so Mina can be mounted inside the portal and protected by
          auth and entitlement checks in phase 1. The public Mina site is only docs and
          demo reference material for the library build.
        </p>
      </div>
    </main>
  );
}
