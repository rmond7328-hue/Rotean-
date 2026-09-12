"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Rotean application error", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--ink)]">
      <div className="mx-auto max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--green)]">Rotean</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Something went wrong.</h1>
        <p className="mt-3 text-[var(--muted)]">Rotean hit an unexpected problem. Your data is still protected.</p>
        <button className="mt-6 rounded-xl bg-[var(--green)] px-5 py-3 font-medium text-white" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  );
}
