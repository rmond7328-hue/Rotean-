import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type BehaviorSignal = {
  type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  occurred_at?: string;
};

const clampLimit = (limit: number) => Math.min(Math.max(limit, 1), 500);

export async function recordBehavior(signal: BehaviorSignal) {
  const supabase = createBrowserClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("You need to be signed in.");
  return supabase.from("behavior_signals").insert({
    user_id: user.user.id,
    signal_type: signal.type,
    entity_id: signal.entity_id ?? null,
    metadata: signal.metadata ?? {},
    occurred_at: signal.occurred_at ?? new Date().toISOString(),
  }).select().single();
}

export async function getRecentBehavior(limit = 200) {
  const supabase = createBrowserClient();
  return supabase.from("behavior_signals").select("*").order("occurred_at", { ascending: false }).limit(clampLimit(limit));
}

export async function getRecentBehaviorServer(limit = 200) {
  const supabase = await createServerClient();
  return supabase.from("behavior_signals").select("*").order("occurred_at", { ascending: false }).limit(clampLimit(limit));
}
