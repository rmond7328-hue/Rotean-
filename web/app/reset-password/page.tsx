"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setMessage("Use at least 6 characters.");
    if (password !== confirm) return setMessage("Passwords do not match.");
    setSaving(true); setMessage("");
    const { error } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (error) return setMessage(error.message);
    setMessage("Password updated. Taking you into Rotean…");
    setTimeout(() => window.location.assign("/app"), 700);
  }

  return <main className="min-h-screen bg-[var(--background)] px-5 py-8"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center"><div className="w-full rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_20px_60px_rgba(23,33,27,0.06)]"><div className="text-xl font-semibold tracking-[-0.04em]">rotean</div><h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em]">Choose a new password.</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Set a new password for your Rotean account.</p><form onSubmit={submit} className="mt-8 space-y-4"><input type="password" required minLength={6} autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--green)]" /><input type="password" required minLength={6} autoComplete="new-password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--green)]" />{message && <p role="status" className="rounded-xl bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">{message}</p>}<button disabled={saving} className="w-full rounded-xl bg-[var(--green)] px-4 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Updating…" : "Update password"}</button></form></div></div></main>;
}
