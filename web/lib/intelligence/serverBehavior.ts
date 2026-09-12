import { createClient } from "@/lib/supabase/server";

const clampLimit = (limit: number) => Math.min(Math.max(limit, 1), 500);

export async function getRecentBehaviorServer(limit = 200) {
  const supabase = await createClient();
  return supabase
    .from("behavior_signals")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(clampLimit(limit));
}
