import { createClient } from "@/lib/supabase/server";
import type { LifeSnapshot } from "@/lib/intelligence/lifeSnapshot";

export async function getServerLifeSnapshot(): Promise<LifeSnapshot> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You need to be signed in.");

  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [profile, preferences, tasks, projects, goals, habits, notes, memories, calendar] = await Promise.all([
    supabase.from("profiles").select("timezone").eq("id", auth.user.id).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("tasks").select("*").order("status").order("due_at", { ascending: true, nullsFirst: false }).order("priority", { ascending: false }),
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("goals").select("*").order("priority", { ascending: false }).order("target_date", { ascending: true, nullsFirst: false }),
    supabase.from("habits").select("*").eq("active", true).order("title"),
    supabase.from("notes").select("*").order("updated_at", { ascending: false }),
    supabase.from("memories").select("*").order("importance", { ascending: false }).order("updated_at", { ascending: false }),
    supabase.from("calendar_events").select("*").lt("starts_at", to).gt("ends_at", from).order("starts_at"),
  ]);

  const firstError = [profile, preferences, tasks, projects, goals, habits, notes, memories, calendar].find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const timezone = profile.data?.timezone || "Africa/Lagos";
  return {
    generated_at: now.toISOString(),
    tasks: tasks.data,
    projects: projects.data,
    goals: goals.data,
    habits: habits.data,
    notes: notes.data,
    memories: memories.data,
    calendar_events: calendar.data,
    preferences: (preferences.data as Record<string, unknown> | null) ?? null,
    timezone,
  };
}
