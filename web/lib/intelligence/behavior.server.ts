import { createClient } from "@/lib/supabase/server";

export async function recordBehaviorServer(signal: { type: string; entity_id?: string | null; metadata?: Record<string, unknown>; occurred_at?: string }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You need to be signed in.");
  return supabase.from("behavior_signals").insert({ user_id: auth.user.id, signal_type: signal.type, entity_id: signal.entity_id ?? null, metadata: signal.metadata ?? {}, occurred_at: signal.occurred_at ?? new Date().toISOString() }).select().single();
}
