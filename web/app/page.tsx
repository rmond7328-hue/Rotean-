export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-[-0.02em]">rotean</div>
          <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-xs font-medium text-[var(--muted)]">
            Web foundation
          </span>
        </header>

        <section className="max-w-3xl py-20">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">
            Your life, intelligently managed.
          </p>
          <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-7xl">
            Rotean is being rebuilt for the web.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            The intelligence, personal context and life-management foundation stays. The new interface will run as a fast, installable web app.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 text-sm font-medium">
            <span className="rounded-full bg-[var(--green)] px-4 py-2 text-white">Next.js</span>
            <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2">Supabase</span>
            <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2">PWA</span>
            <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2">TypeScript</span>
          </div>
        </section>

        <footer className="border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
          Phase 1 · Foundation
        </footer>
      </div>
    </main>
  );
}
