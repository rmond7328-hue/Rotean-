export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--ink)]">
      <div className="mx-auto max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">Rotean</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found.</h1>
        <p className="mt-3 text-[var(--muted)]">The page you requested does not exist.</p>
        <a className="mt-6 inline-flex rounded-xl bg-[var(--green)] px-5 py-3 font-medium text-white" href="/app">
          Back to Rotean
        </a>
      </div>
    </main>
  );
}
