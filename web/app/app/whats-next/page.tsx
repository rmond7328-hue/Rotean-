"use client";

import { useEffect, useState } from "react";
import type { WhatsNextResult, WhatsNextCandidate } from "@/lib/intelligence/whatsNext";

export default function WhatsNextPage() {
  const [result, setResult] = useState<WhatsNextResult | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    try {
      setError("");
      const response = await fetch("/api/whats-next", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setResult(body.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load recommendations.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function rate(candidate: WhatsNextCandidate, rating: "accepted" | "rejected" | "dismissed") {
    setFeedback(candidate.id);
    await fetch("/api/whats-next/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recommendation_id: candidate.id, rating }) });
    if (rating !== "accepted") setResult((current) => current ? { ...current, candidates: current.candidates.filter((item) => item.id !== candidate.id) } : current);
  }

  if (error) return <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6"><h1 className="text-2xl font-semibold">What’s next?</h1><p className="mt-2 text-sm text-[var(--danger)]">{error}</p></div>;
  if (!result) return <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">Thinking about what makes sense right now…</div>;

  const top = result.candidates[0];
  return <div className="space-y-7">
    <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--green)]">Rotean Intelligence</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">What’s next?</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Rotean ranks the things you could do now using your time, commitments, priorities, goals, habits and learned behavior. It makes a recommendation — you stay in control.</p></header>
    <section className="rounded-[2rem] bg-[var(--green)] p-6 text-white sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Best move right now</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em]">{top?.title ?? "You have nothing urgent to force."}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">{top?.reason ?? "Use the free time deliberately. Rest is allowed."}</p>{top && <div className="mt-6 flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">{top.duration_minutes} min</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">{Math.round(top.confidence * 100)}% confidence</span><button onClick={() => rate(top, "accepted")} className="rounded-xl bg-[var(--lime)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)]">Do this</button></div>}</section>
    <section><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">Other good options</h2><p className="mt-1 text-sm text-[var(--muted)]">Available window: {result.available_minutes} min{result.next_commitment_at ? " before your next commitment" : ""}.</p></div><button onClick={() => void load()} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold">Recalculate</button></div><div className="mt-4 space-y-3">{result.candidates.slice(1).map((candidate) => <article key={candidate.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--green)]">{candidate.type.replace("_", " ")}</span><span className="text-xs text-[var(--muted)]">{candidate.duration_minutes} min</span></div><h3 className="mt-1 font-semibold">{candidate.title}</h3><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{candidate.reason}</p></div><div className="flex shrink-0 gap-2"><button disabled={feedback === candidate.id} onClick={() => void rate(candidate, "accepted")} className="rounded-xl bg-[var(--green)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Choose</button><button disabled={feedback === candidate.id} onClick={() => void rate(candidate, "rejected")} className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold disabled:opacity-50">Not now</button></div></div></article>)}</div></section>
  </div>;
}
