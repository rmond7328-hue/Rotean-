import { createClient } from "@/lib/supabase/client";
import { getCalendarEvents, getGoals, getHabits, getMemories, getNotes, getProjects, getTasks } from "@/lib/data/life";

export type LifeSnapshot = {
  generated_at: string;
  tasks: Awaited<ReturnType<typeof getTasks>>["data"];
  projects: Awaited<ReturnType<typeof getProjects>>["data"];
  goals: Awaited<ReturnType<typeof getGoals>>["data"];
  habits: Awaited<ReturnType<typeof getHabits>>["data"];
  notes: Awaited<ReturnType<typeof getNotes>>["data"];
  memories: Awaited<ReturnType<typeof getMemories>>["data"];
  calendar_events: Awaited<ReturnType<typeof getCalendarEvents>>["data"];
  preferences: Record<string, unknown> | null;
  timezone: string;
};

function dayWindow() { const start = new Date(); start.setHours(0,0,0,0); const end = new Date(start); end.setDate(end.getDate()+1); return { from:start.toISOString(), to:end.toISOString() }; }

export async function getLifeSnapshot(): Promise<LifeSnapshot> {
  const { from, to } = dayWindow();
  const [tasks, projects, goals, habits, notes, memories, events] = await Promise.all([getTasks(), getProjects(), getGoals(), getHabits(), getNotes(), getMemories(), getCalendarEvents(from,to)]);
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  let preferences: Record<string, unknown> | null = null; let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (user.user) {
    const [{ data: prefs }, { data: profile }] = await Promise.all([
      supabase.from("user_preferences").select("*").eq("user_id", user.user.id).maybeSingle(),
      supabase.from("profiles").select("timezone").eq("id", user.user.id).maybeSingle(),
    ]);
    preferences = (prefs as Record<string, unknown> | null) ?? null;
    timezone = profile?.timezone || timezone;
  }
  return { generated_at:new Date().toISOString(), tasks:tasks.data, projects:projects.data, goals:goals.data, habits:habits.data, notes:notes.data, memories:memories.data, calendar_events:events.data, preferences, timezone };
}
