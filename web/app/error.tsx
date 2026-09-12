"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Rotean application error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-16 text-[var(--ink)]">
      <section className="w-full max-w-lg rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_20px_60px_rgba(23,33,27,0.08)] sm:p-9">
        <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--soft-green)] text-lg font-semibold text-[var(--green)]">r.</div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Rotean</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Something went wrong.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Rotean hit an unexpected problem. Nothing was intentionally changed. Try the page again.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--lime)] focus:ring-offset-2" onClick={() => reset()}>Try again</button>
          <a className="rounded-xl border border-[var(--line)] px-5 py-3 text-center text-sm font-semibold transition hover:border-[var(--green)] hover:bg-[var(--surface-subtle)]" href="/app">Back to Today</a>
        </div>
      </section>
    </main>
  );
}
