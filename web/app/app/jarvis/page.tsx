"use client";

import { FormEvent, useState } from "react";

type Action = { type: string; label: string; requires_confirmation: boolean; payload?: Record<string, unknown> };
type Response = { message: string; intent: string; confidence: number; actions: Action[] };

type Turn = { role: "user" | "rotean"; text: string; response?: Response };

const starters = ["What should I do now?", "Fix my day", "I'm tired. What makes sense?", "What am I forgetting?"];

export default function JarvisPage() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);

  async function send(value = input) {
    const text = value.trim();
    if (!text || loading) return;
    setInput("");
    setTurns((current) => [...current, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/jarvis", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ input: text }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rotean could not respond.");
      setTurns((current) => [...current, { role: "rotean", text: data.response.message, response: data.response }]);
    } catch (error) {
      setTurns((current) => [...current, { role: "rotean", text: error instanceof Error ? error.message : "Something went wrong." }]);
    } finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(); }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:py-10">
      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green)]">Rotean Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">What do you need handled?</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Talk normally. Rotean uses your current life context to reason about what matters next, then shows you what it proposes before anything consequential happens.</p>
      </section>

      {turns.length === 0 ? (
        <section className="mb-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
          <p className="text-sm font-medium text-[var(--ink)]">Try one of these</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {starters.map((starter) => <button key={starter} onClick={() => void send(starter)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-3 text-left text-sm text-[var(--ink)] transition hover:-translate-y-px hover:border-[var(--green)]">{starter}</button>)}
          </div>
        </section>
      ) : (
        <section className="mb-6 space-y-4">
          {turns.map((turn, index) => (
            <div key={`${turn.role}-${index}`} className={turn.role === "user" ? "ml-auto max-w-[85%] rounded-3xl bg-[var(--green)] px-5 py-4 text-sm leading-6 text-white" : "max-w-[92%] rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 text-sm leading-6 text-[var(--ink)]"}>
              <p>{turn.text}</p>
              {turn.response?.actions?.length ? <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-4"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Proposed next steps</p>{turn.response.actions.map((action, actionIndex) => <div key={actionIndex} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-subtle)] px-3 py-3"><span className="text-sm">{action.label}</span><span className="shrink-0 text-xs text-[var(--muted)]">{action.requires_confirmation ? "Confirmation required" : "Ready"}</span></div>)}</div> : null}
              {turn.response ? <p className="mt-3 text-xs text-[var(--muted)]">{turn.response.intent.replaceAll("_", " ")} · {Math.round(turn.response.confidence * 100)}% confidence</p> : null}
            </div>
          ))}
          {loading ? <div className="max-w-[92%] rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 text-sm text-[var(--muted)]">Thinking through your context…</div> : null}
        </section>
      )}

      <form onSubmit={submit} className="sticky bottom-3 mt-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[0_12px_40px_rgba(23,33,27,0.08)]">
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={2} maxLength={2000} placeholder="Tell Rotean what you need…" className="min-h-12 flex-1 resize-none rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
          <button disabled={loading || !input.trim()} className="rounded-2xl bg-[var(--green)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Send</button>
        </div>
      </form>
    </main>
  );
}
