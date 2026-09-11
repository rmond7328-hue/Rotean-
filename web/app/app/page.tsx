export default function AppHomePage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--green)]">Sunday · September 6</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Good evening.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">Rotean will bring your day, priorities and next best actions together here.</p>
        </div>
        <button className="w-fit rounded-xl bg-[var(--green)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(23,77,58,0.14)] transition hover:-translate-y-0.5">+ Add something</button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="rounded-3xl bg-[var(--green)] p-6 text-white shadow-[0_18px_50px_rgba(23,77,58,0.12)] sm:p-8">
          <div className="flex items-start justify-between gap-5"><div><span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">What’s next?</span><h2 className="mt-5 max-w-2xl text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Start with what matters most.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Once your life data is connected, Rotean will use time, commitments, goals and context to recommend what makes sense right now.</p></div><span className="hidden text-3xl text-[var(--lime)] sm:block">✦</span></div>
          <div className="mt-7 flex flex-wrap gap-2"><button className="rounded-xl bg-[var(--lime)] px-4 py-2.5 text-xs font-bold text-[var(--green-deep)]">See recommendations</button><button className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/90">Open JARVIS</button></div>
        </div>
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Today</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[var(--background)] p-4"><p className="text-2xl font-semibold">0</p><p className="mt-1 text-xs text-[var(--muted)]">tasks due</p></div><div className="rounded-2xl bg-[var(--background)] p-4"><p className="text-2xl font-semibold">0</p><p className="mt-1 text-xs text-[var(--muted)]">events</p></div><div className="rounded-2xl bg-[var(--background)] p-4"><p className="text-2xl font-semibold">0</p><p className="mt-1 text-xs text-[var(--muted)]">habits</p></div><div className="rounded-2xl bg-[var(--background)] p-4"><p className="text-2xl font-semibold">—</p><p className="mt-1 text-xs text-[var(--muted)]">free time</p></div></div></div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[['Tasks','Capture work and responsibilities.','/app/tasks'],['Calendar','See the shape of your day.','/app/calendar'],['Personal model','Teach Rotean how your life works.','/app/personal-model']].map(([title,desc,href]) => <a key={title} href={href} className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--green)]/30 hover:shadow-[0_12px_32px_rgba(23,33,27,0.06)]"><div className="flex items-center justify-between"><h3 className="font-semibold tracking-[-0.02em]">{title}</h3><span className="text-[var(--muted)] transition group-hover:translate-x-1">→</span></div><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{desc}</p></a>)}
      </section>
    </div>
  );
}
