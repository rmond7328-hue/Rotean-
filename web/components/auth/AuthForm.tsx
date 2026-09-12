"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/app` } });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) return setMessage("Account created. Check your email to confirm your account.");
    window.location.assign("/app");
  }

  async function resetPassword() {
    if (!email.trim()) return setMessage("Enter your email first.");
    setLoading(true); setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
    setLoading(false);
    setMessage(error ? error.message : "Password reset email sent. Check your inbox.");
  }

  return <form onSubmit={submit} className="space-y-4">
    {mode === "signup" && <label className="block text-sm font-medium">Name<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--green)]" /></label>}
    <label className="block text-sm font-medium">Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--green)]" /></label>
    <label className="block text-sm font-medium">Password<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-[var(--green)]" /></label>
    {mode === "signin" && <button type="button" onClick={resetPassword} disabled={loading} className="text-sm font-medium text-[var(--green)] disabled:opacity-50">Forgot your password?</button>}
    {message && <p role="status" className="rounded-xl bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">{message}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-[var(--green)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}</button>
    <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }} className="w-full py-2 text-sm font-medium text-[var(--green)]">{mode === "signin" ? "New to Rotean? Create an account" : "Already have an account? Sign in"}</button>
  </form>;
}
