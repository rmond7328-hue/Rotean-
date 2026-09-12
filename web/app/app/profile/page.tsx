"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/profile"), createClient().auth.getUser()]).then(async ([profileResponse, auth]) => {
      const data = await profileResponse.json();
      setName(data.profile?.display_name || ""); setUsername(data.profile?.username || ""); setEmail(auth.data.user?.email || "");
    });
  }, []);

  async function save() {
    setSaving(true); setSaved(""); setError("");
    const response = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ display_name: name, username, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", locale: "en-NG", preferences: {} }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false); if (!response.ok) return setError(data.error || "Could not save profile."); setSaved("Profile saved.");
  }

  async function signOut() { await createClient().auth.signOut(); window.location.assign("/login"); }

  return <section><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--green)]">Profile</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Your details.</h1><p className="mt-2 text-sm text-[var(--muted)]">Keep the basics Rotean uses to understand you.</p></div><div className="max-w-2xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8"><div className="space-y-5"><label className="block text-sm font-medium">Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--green)]" /></label><label className="block text-sm font-medium">Username<input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} placeholder="optional" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--green)]" /></label><label className="block text-sm font-medium">Email<input value={email} disabled className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-[var(--muted)]" /></label>{(error || saved) && <p role="status" className="text-sm text-[var(--muted)]">{error || saved}</p>}<button onClick={save} disabled={saving} className="rounded-xl bg-[var(--green)] px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button></div><div className="mt-10 border-t border-[var(--line)] pt-6"><button onClick={signOut} className="text-sm font-medium text-[var(--danger)]">Sign out</button></div></div></section>;
}
