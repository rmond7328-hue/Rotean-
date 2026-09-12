import { createClient } from "@/lib/supabase/client";

export type Task = {
  id: string; user_id: string; project_id: string | null; goal_id: string | null; parent_task_id: string | null;
  title: string; description: string | null; status: string; priority: number; estimated_minutes: number | null;
  due_at: string | null; energy_level: string | null; context_tags: string[]; completed_at: string | null;
};
export type Project = { id: string; user_id: string; goal_id: string | null; title: string; description: string | null; status: string };
export type Goal = { id: string; user_id: string; title: string; description: string | null; status: string; priority: number; target_date: string | null };
export type Habit = { id: string; user_id: string; title: string; description: string | null; frequency: Record<string, unknown>; preferred_time: string | null; estimated_minutes: number | null; energy_level: string | null; active: boolean };
export type Note = { id: string; user_id: string; title: string | null; content: string; note_type: string };
export type Memory = { id: string; user_id: string; memory_type: string; content: string; source: string | null; importance: number; confidence: number; last_confirmed_at: string | null; expires_at: string | null };
export type CalendarEvent = { id: string; user_id: string; title: string; description: string | null; starts_at: string; ends_at: string; location_name: string | null; all_day: boolean; source: string; external_id: string | null };

const client = () => createClient();
async function userId() { const { data } = await client().auth.getUser(); if (!data.user) throw new Error("You need to be signed in."); return data.user.id; }

export async function getTasks() { return client().from("tasks").select("*").order("status").order("due_at", { ascending: true, nullsFirst: false }).order("priority", { ascending: false }); }
export async function createTask(input: { title: string; description?: string; priority?: number; estimated_minutes?: number; due_at?: string | null; energy_level?: string | null; project_id?: string | null; goal_id?: string | null }) { return client().from("tasks").insert({ user_id: await userId(), title: input.title.trim(), description: input.description?.trim() || null, priority: input.priority ?? 3, estimated_minutes: input.estimated_minutes ?? null, due_at: input.due_at || null, energy_level: input.energy_level || null, project_id: input.project_id || null, goal_id: input.goal_id || null, status: "todo", context_tags: [] }).select().single(); }
export async function updateTask(id: string, patch: Partial<Task>) { return client().from("tasks").update(patch).eq("id", id).select().single(); }
export async function deleteTask(id: string) { return client().from("tasks").delete().eq("id", id); }

export async function getProjects() { return client().from("projects").select("*").order("updated_at", { ascending: false }); }
export async function createProject(title: string, description?: string) { return client().from("projects").insert({ user_id: await userId(), title: title.trim(), description: description?.trim() || null, status: "active" }).select().single(); }
export async function updateProject(id: string, patch: Partial<Project>) { return client().from("projects").update(patch).eq("id", id).select().single(); }
export async function deleteProject(id: string) { return client().from("projects").delete().eq("id", id); }

export async function getGoals() { return client().from("goals").select("*").order("priority", { ascending: false }).order("target_date", { ascending: true, nullsFirst: false }); }
export async function createGoal(input: { title: string; description?: string; priority?: number; target_date?: string | null }) { return client().from("goals").insert({ user_id: await userId(), title: input.title.trim(), description: input.description?.trim() || null, priority: input.priority ?? 3, target_date: input.target_date || null, status: "active" }).select().single(); }
export async function updateGoal(id: string, patch: Partial<Goal>) { return client().from("goals").update(patch).eq("id", id).select().single(); }
export async function deleteGoal(id: string) { return client().from("goals").delete().eq("id", id); }

export async function getHabits() { return client().from("habits").select("*").eq("active", true).order("title"); }
export async function createHabit(input: { title: string; description?: string; frequency?: Record<string, unknown>; preferred_time?: string | null; estimated_minutes?: number | null; energy_level?: string | null }) { return client().from("habits").insert({ user_id: await userId(), title: input.title.trim(), description: input.description?.trim() || null, frequency: input.frequency ?? { type: "daily" }, preferred_time: input.preferred_time || null, estimated_minutes: input.estimated_minutes ?? null, energy_level: input.energy_level || null, active: true }).select().single(); }
export async function updateHabit(id: string, patch: Partial<Habit>) { return client().from("habits").update(patch).eq("id", id).select().single(); }
export async function deleteHabit(id: string) { return client().from("habits").delete().eq("id", id); }

export async function getNotes() { return client().from("notes").select("*").order("updated_at", { ascending: false }); }
export async function createNote(input: { title?: string; content: string; note_type?: string }) { return client().from("notes").insert({ user_id: await userId(), title: input.title?.trim() || null, content: input.content.trim(), note_type: input.note_type ?? "note" }).select().single(); }
export async function updateNote(id: string, patch: Partial<Note>) { return client().from("notes").update(patch).eq("id", id).select().single(); }
export async function deleteNote(id: string) { return client().from("notes").delete().eq("id", id); }

export async function getMemories() { return client().from("memories").select("*").order("importance", { ascending: false }).order("updated_at", { ascending: false }); }
export async function createMemory(input: { content: string; memory_type?: string; source?: string; importance?: number; confidence?: number }) { return client().from("memories").insert({ user_id: await userId(), content: input.content.trim(), memory_type: input.memory_type ?? "preference", source: input.source ?? "user", importance: input.importance ?? 3, confidence: input.confidence ?? 1 }).select().single(); }
export async function updateMemory(id: string, patch: Partial<Memory>) { return client().from("memories").update(patch).eq("id", id).select().single(); }
export async function deleteMemory(id: string) { return client().from("memories").delete().eq("id", id); }

export async function getCalendarEvents(from: string, to: string) { return client().from("calendar_events").select("*").lt("starts_at", to).gt("ends_at", from).order("starts_at"); }
export async function createCalendarEvent(input: { title: string; description?: string; starts_at: string; ends_at: string; location_name?: string; all_day?: boolean }) { return client().from("calendar_events").insert({ user_id: await userId(), title: input.title.trim(), description: input.description?.trim() || null, starts_at: input.starts_at, ends_at: input.ends_at, location_name: input.location_name?.trim() || null, all_day: input.all_day ?? false, source: "rotean" }).select().single(); }
export async function updateCalendarEvent(id: string, patch: Partial<CalendarEvent>) { return client().from("calendar_events").update(patch).eq("id", id).select().single(); }
export async function deleteCalendarEvent(id: string) { return client().from("calendar_events").delete().eq("id", id); }
