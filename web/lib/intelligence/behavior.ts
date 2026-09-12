import { createClient } from "@/lib/supabase/client";

export type BehaviorSignal = {
  type: "task_completed" | "task_deferred" | "habit_created" | "habit_deleted" | "note_created" | "goal_created";
  entity_id?: string;
  metadata?: Record<string, unknown>;
  occurred_at?: string;
};

export async function recordBehavior(signal: BehaviorSignal) {
  // Phase 5 will persist and aggregate behavioral events in a dedicated table.
  // Keeping this boundary now prevents UI code from becoming coupled to storage.
  void signal;
  const supabase = createClient();
  return { supabase, recorded: false };
}
