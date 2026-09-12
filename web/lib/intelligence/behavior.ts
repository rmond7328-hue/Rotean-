import { createClient } from "@/lib/supabase/client";

export type BehaviorSignal = {
  type: "task_completed" | "task_deferred" | "habit_completed" | "habit_skipped" | "note_created" | "goal_created" | "project_created";
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  occurred_at?: string;
};

export async function recordBehavior(signal: BehaviorSignal) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("You need to be signed in.");
  return supabase.from("behavior_signals").insert({ user_id: user.user.id, signal_type: signal.type, entity_id: signal.entity_id ?? null, metadata: signal.metadata ?? {}, occurred_at: signal.occurred_at ?? new Date().toISOString() }).select().single();
}

export async function getRecentBehavior(limit = 100) {
  const supabase = createClient();
  return supabase.from("behavior_signals").select("*").order("occurred_at", { ascending: false }).limit(limit);
}
