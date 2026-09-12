"use client";

import { FormEvent, useEffect, useState } from "react";

const planningStyles = ["Structured", "Balanced", "Flexible"] as const;

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [style, setStyle] = useState<(typeof planningStyles)[number]>("Balanced");
  const [location, setLocation] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(async (r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.profile?.display_name) setName(data.profile.display_name);
        const p = data?.preferences;
        if (p?.planning_style) setStyle(p.planning_style === "structured" ? "Structured" : p.planning_style === "flexible" ? "Flexible" : "Balanced");
        if (typeof p?.location_permission === "boolean") setLocation(p.location_permission);
        if (typeof p?.calendar_permission === "boolean") setCalendar(p.calendar_permission);
        if (typeof p?.notification_preferences?.enabled === "boolean") setNotifications(p.notification_preferences.enabled);
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: name,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        locale: "en-NG",
        preferences: {
          planning_style: style.toLowerCase(),
          location_permission: location,
          calendar_permission: calendar,
          notification_preferences: { enabled: notifications },
        },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "We couldn't save your setup. Try again.");
      setSaving(false);
      return;
    }
    window.location.assign("/app");
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-[var(--muted)]">Preparing Rotean…</main>;

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-between"><div className="text-xl font-semibold tracking-[-0.04em]">rotean</div><span className="text-xs text-[var(--muted)]">Your setup</span></div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_20px_60px_rgba(23,33,27,0.06)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--green)]">Before we begin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Let Rotean understand how you live.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">These choices shape your first recommendations. You can change them later. Rotean only uses location or calendar access when you allow it.</p>

          <form onSubmit={submit} className="mt-9 space-y-8">
            <label className="block text-sm font-medium">What should Rotean call you?
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} placeholder="Your name" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--green)]" />
            </label>

            <fieldset><legend className="text-sm font-medium">How should Rotean plan with you?</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{planningStyles.map((item) => <button type="button" key={item} onClick={() => setStyle(item)} className={`rounded-2xl border p-4 text-left transition ${style === item ? "border-[var(--green)] bg-[var(--soft-green)]" : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--green)]"}`}><span className="font-medium">{item}</span><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{item === "Structured" ? "Give me a clear plan." : item === "Flexible" ? "Adapt as my day changes." : "A practical middle ground."}</span></button>)}</div></fieldset>

            <div className="space-y-3">
              <Permission label="Use my location when I allow it" description="Useful for travel time and nearby recommendations." checked={location} onChange={setLocation} />
              <Permission label="Connect my calendar later" description="Helps Rotean understand commitments and free windows." checked={calendar} onChange={setCalendar} />
              <Permission label="Keep useful notifications on" description="Rotean will aim for useful, sparse reminders." checked={notifications} onChange={setNotifications} />
            </div>

            {error && <p role="alert" className="rounded-xl bg-[var(--background)] px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}
            <button disabled={saving} className="w-full rounded-xl bg-[var(--green)] px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Setting things up…" : "Start using Rotean"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Permission({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--line)] p-4"><span><span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{description}</span></span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[var(--green)]" /></label>;
}
