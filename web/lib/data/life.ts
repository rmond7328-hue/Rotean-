import { createClient } from "@/lib/supabase/client";

export type Task = {
  id: string; title: string; description: string | null; status: string; priority: number;
  estimated_minutes: number | null; due_at: string | null; energy_level: string | null;
  project_id: string | null; goal_id: string | null; context_tags: string[];
};

export async function getTasks() {
  const supabase = createClient();
  return supabase.from("tasks").select("*").order("status", { ascending: true }).order("due_at", { ascending: true, nullsFirst: false }).order("priority", { ascending: false });
}

export async function createTask(input: { title: string; description?: string; priority?: number; estimated_minutes?: number; due_at?: string | null; energy_level?: string | null }) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("You need to be signed in.");
  return supabase.from("tasks").insert({ user_id: user.user.id, title: input.title.trim(), description: input.description?.trim() || null, priority: input.priority ?? 3, estimated_minutes: input.estimated_minutes ?? null, due_at: input.due_at || null, energy_level: input.energy_level || null, status: "todo", context_tags: [] }).select().single();
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const supabase = createClient();
  return supabase.from("tasks").update(patch).eq("id", id).select().single();
}

export async function deleteTask(id: string) {
  const supabase = createClient();
  return supabase.from("tasks").delete().eq("id", id);
}

export async function getProjects() {
  const supabase = createClient();
  return supabase.from("projects").select("*").order("updated_at", { ascending: false });
}

export async function getGoals() {
  const supabase = createClient();
  return supabase.from("goals").select("*").order("priority", { ascending: false }).order("target_date", { ascending: true, nullsFirst: false });
}

export async function getHabits() {
  const supabase = createClient();
  return supabase.from("habits").select("*").eq("active", true).order("title");
}

export async function getNotes() {
  const supabase = createClient();
  return supabase.from("notes").select("*").order("updated_at", { ascending: false });
}

export async function getMemories() {
  const supabase = createClient();
  return supabase.from("memories").select("*").order("importance", { ascending: false }).order("updated_at", { ascending: false });
}

export async function getCalendarEvents(from: string, to: string) {
  const supabase = createClient();
  return supabase.from("calendar_events").select("*").gte("starts_at", from).lt("starts_at", to).order("starts_at");
}
